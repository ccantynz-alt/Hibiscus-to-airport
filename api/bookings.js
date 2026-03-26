// /api/bookings
// POST = create booking (public)
// GET = list bookings (admin, requires auth)

const { getDb } = require("./lib/db");
const { authenticateRequest } = require("./lib/auth");
const { sendCustomerConfirmation, sendAdminNotification } = require("./lib/email");
const { sendCustomerSms, sendAdminSmsNotification, sendUrgentAdminSms } = require("./lib/sms");
const { isUrgentBooking } = require("./lib/pricing");
const {
  ok, created, badRequest, unauthorized, serverError, methodNotAllowed,
  uuid, isValidEmail, isValidPhone, rowToBooking, escapeHtml,
} = require("./lib/helpers");

module.exports = async function handler(req, res) {
  if (req.method === "POST") {
    return createBooking(req, res);
  }
  if (req.method === "GET") {
    return listBookings(req, res);
  }
  return methodNotAllowed(res, ["GET", "POST"]);
};

async function createBooking(req, res) {
  try {
    const b = req.body || {};

    // Input validation
    if (!b.name || !b.email || !b.phone || !b.pickupAddress || !b.dropoffAddress || !b.date || !b.time) {
      return badRequest(res, "Missing required fields: name, email, phone, pickupAddress, dropoffAddress, date, time");
    }
    if (!isValidEmail(b.email)) {
      return badRequest(res, "Invalid email address");
    }
    if (!isValidPhone(b.phone)) {
      return badRequest(res, "Invalid phone number");
    }

    const sql = getDb();
    const bookingId = uuid();

    // Generate booking reference (atomic — uses DB)
    const lastRef = await sql`
      SELECT booking_ref FROM bookings
      WHERE booking_ref LIKE 'H%'
      ORDER BY CAST(SUBSTRING(booking_ref FROM 2) AS INTEGER) DESC
      LIMIT 1
    `;
    const nextNum = lastRef.length > 0 ? parseInt(lastRef[0].booking_ref.slice(1), 10) + 1 : 1;
    const bookingRef = `H${nextNum}`;

    const totalPrice = b.totalPrice != null ? b.totalPrice : (b.pricing?.totalPrice || 0);
    const createdAt = new Date().toISOString();
    const pricing = b.pricing || {};

    await sql`
      INSERT INTO bookings (
        id, booking_ref, name, email, phone, pickup_address, dropoff_address,
        date, time, passengers, notes, pricing, total_price, status, payment_status,
        departure_flight_number, departure_time, arrival_flight_number, arrival_time,
        service_type, vip_pickup, oversized_luggage, return_trip, additional_pickups, created_at
      ) VALUES (
        ${bookingId}, ${bookingRef}, ${b.name}, ${b.email}, ${b.phone},
        ${b.pickupAddress}, ${b.dropoffAddress}, ${b.date}, ${b.time},
        ${String(b.passengers || "1")}, ${b.notes || ""}, ${JSON.stringify(pricing)},
        ${totalPrice}, ${b.status || "pending"}, ${b.payment_status || "unpaid"},
        ${b.departureFlightNumber || ""}, ${b.departureTime || ""},
        ${b.arrivalFlightNumber || ""}, ${b.arrivalTime || ""},
        ${b.serviceType || ""}, ${b.vipPickup || false}, ${b.oversizedLuggage || false},
        ${b.returnTrip || false}, ${JSON.stringify(b.additionalPickups || [])}, ${createdAt}
      )
    `;

    const bookingDoc = {
      id: bookingId,
      booking_ref: bookingRef,
      name: b.name,
      email: b.email,
      phone: b.phone,
      pickupAddress: b.pickupAddress,
      dropoffAddress: b.dropoffAddress,
      date: b.date,
      time: b.time,
      passengers: String(b.passengers || "1"),
      notes: b.notes || "",
      pricing,
      totalPrice,
      status: b.status || "pending",
      payment_status: b.payment_status || "unpaid",
      departureFlightNumber: b.departureFlightNumber || "",
      departureTime: b.departureTime || "",
      arrivalFlightNumber: b.arrivalFlightNumber || "",
      arrivalTime: b.arrivalTime || "",
    };

    // Send notifications (non-blocking — don't fail the booking if notifications fail)
    try { await sendAdminNotification(bookingDoc); } catch (e) { console.error("Admin email failed:", e.message); }
    try { await sendAdminSmsNotification(bookingDoc); } catch (e) { console.error("Admin SMS failed:", e.message); }

    // Check for urgent booking
    const { isUrgent, hoursUntil } = isUrgentBooking(b.date, b.time);
    if (isUrgent) {
      try { await sendUrgentAdminSms(bookingDoc, hoursUntil); } catch (e) { console.error("Urgent SMS failed:", e.message); }
    }

    // If confirmed+paid, send customer notifications
    if (b.status === "confirmed" && b.payment_status === "paid") {
      try { await sendCustomerConfirmation(bookingDoc); } catch (e) { console.error("Customer email failed:", e.message); }
      try { await sendCustomerSms(bookingDoc); } catch (e) { console.error("Customer SMS failed:", e.message); }
    }

    return created(res, {
      message: "Booking created successfully",
      booking_id: bookingId,
      booking_ref: bookingRef,
      status: b.status || "pending",
    });
  } catch (err) {
    return serverError(res, err.message);
  }
}

async function listBookings(req, res) {
  const user = authenticateRequest(req);
  if (!user) {
    return unauthorized(res);
  }

  try {
    const sql = getDb();
    const rows = await sql`
      SELECT id, booking_ref, name, email, phone, pickup_address, dropoff_address,
             date, time, passengers, notes, service_type, pricing, total_price,
             status, payment_status, payment_method, assigned_driver_name,
             tracking_status, created_at, updated_at
      FROM bookings
      ORDER BY created_at DESC
      LIMIT 500
    `;

    return ok(res, { bookings: rows.map(rowToBooking) });
  } catch (err) {
    return serverError(res, err.message);
  }
}
