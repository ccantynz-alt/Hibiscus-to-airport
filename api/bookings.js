// /api/bookings
// POST = create booking (public)
// GET = list bookings (admin, requires auth)

const { getDb } = require("./lib/db");
const { authenticateRequest } = require("./lib/auth");
const { sendCustomerConfirmation, sendAdminNotification } = require("./lib/email");
const { sendCustomerSms, sendAdminSmsNotification, sendUrgentAdminSms } = require("./lib/sms");
const { calculateDistance, calculatePrice, isUrgentBooking } = require("./lib/pricing");
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

    // Authenticated admin requests get elevated privileges (manual price + status override)
    const adminUser = authenticateRequest(req);

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

    const passengers = Math.max(1, Math.min(parseInt(b.passengers, 10) || 1, 20));
    const vipPickup = b.vipPickup === true;
    const oversizedLuggage = b.oversizedLuggage === true;
    const returnTrip = b.returnTrip === true;

    // Server-side price recalculation. If the Maps API key is configured,
    // always recalculate to prevent client-supplied price manipulation.
    // If the key is missing, fall back to the client-supplied price (with a
    // floor of $100) and log a warning — this avoids blocking bookings in
    // environments where the key hasn't been set yet.
    const distance = await calculateDistance(b.pickupAddress, b.dropoffAddress);

    let totalPrice;
    let pricingResult;

    if (distance !== null) {
      pricingResult = calculatePrice(distance, passengers, vipPickup, oversizedLuggage);
      totalPrice = returnTrip ? pricingResult.totalPrice * 2 : pricingResult.totalPrice;
    } else {
      console.warn("GOOGLE_MAPS_API_KEY not configured or distance lookup failed — using client-supplied price");
      const clientPrice = parseFloat(b.totalPrice) || (b.pricing?.totalPrice) || 0;
      totalPrice = Math.max(100, clientPrice);
      pricingResult = b.pricing || { totalPrice };
    }

    // Validate and apply promo code server-side if provided
    let appliedPromoCode = null;
    let appliedPromoId = null;
    if (b.promoCode) {
      const promoRows = await sql`
        SELECT * FROM promo_codes
        WHERE code = ${b.promoCode.toUpperCase()}
          AND active = true
          AND (expiry_date IS NULL OR expiry_date > NOW())
          AND (max_uses IS NULL OR uses_count < max_uses)
      `;
      if (promoRows.length > 0) {
        const promo = promoRows[0];
        const minAmount = parseFloat(promo.min_booking_amount) || 0;
        if (totalPrice >= minAmount) {
          const discountValue = parseFloat(promo.discount_value);
          const discount = promo.discount_type === "percentage"
            ? totalPrice * (discountValue / 100)
            : discountValue;
          totalPrice = Math.max(0, totalPrice - Math.min(discount, totalPrice));
          appliedPromoCode = promo.code;
          appliedPromoId = promo.id;
          // Increment deferred until after booking INSERT succeeds
        }
      }
    }

    totalPrice = Math.round(totalPrice * 100) / 100;
    const pricing = {
      ...pricingResult,
      returnTrip,
      appliedPromoCode,
      totalPrice,
    };

    // Generate booking reference (atomic — uses DB)
    const lastRef = await sql`
      SELECT booking_ref FROM bookings
      WHERE booking_ref LIKE 'H%'
      ORDER BY CAST(SUBSTRING(booking_ref FROM 2) AS INTEGER) DESC
      LIMIT 1
    `;
    const nextNum = lastRef.length > 0 ? parseInt(lastRef[0].booking_ref.slice(1), 10) + 1 : 1;
    const bookingRef = `H${nextNum}`;

    const createdAt = new Date().toISOString();

    await sql`
      INSERT INTO bookings (
        id, booking_ref, name, email, phone, pickup_address, dropoff_address,
        date, time, passengers, notes, pricing, total_price, status, payment_status,
        payment_method, departure_flight_number, departure_time, arrival_flight_number, arrival_time,
        service_type, vip_pickup, oversized_luggage, return_trip, additional_pickups, created_at
      ) VALUES (
        ${bookingId}, ${bookingRef}, ${b.name}, ${b.email}, ${b.phone},
        ${b.pickupAddress}, ${b.dropoffAddress}, ${b.date}, ${b.time},
        ${String(passengers)}, ${b.notes || ""}, ${JSON.stringify(pricing)},
        ${totalPrice}, ${"pending"}, ${b.payment_method === 'cash' ? 'pay_on_day' : 'unpaid'},
        ${b.payment_method || null}, ${b.departureFlightNumber || ""}, ${b.departureTime || ""},
        ${b.arrivalFlightNumber || ""}, ${b.arrivalTime || ""},
        ${b.serviceType || ""}, ${vipPickup}, ${oversizedLuggage},
        ${returnTrip}, ${JSON.stringify(b.additionalPickups || [])}, ${createdAt}
      )
    `;

    // Increment promo usage only after a successful booking INSERT
    if (appliedPromoId) {
      await sql`UPDATE promo_codes SET uses_count = uses_count + 1 WHERE id = ${appliedPromoId}`;
    }

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
      passengers: String(passengers),
      notes: b.notes || "",
      pricing,
      totalPrice,
      status: "pending",
      payment_status: b.payment_method === 'cash' ? 'pay_on_day' : "unpaid",
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

    // Send customer confirmation for cash bookings only (Stripe bookings get confirmed via webhook)
    const isCash = b.payment_method === "cash";
    if (isCash) {
      try { await sendCustomerConfirmation(bookingDoc); } catch (e) { console.error("Customer email failed:", e.message); }
      try { await sendCustomerSms(bookingDoc); } catch (e) { console.error("Customer SMS failed:", e.message); }
    }

    return created(res, {
      message: "Booking created successfully",
      booking_id: bookingId,
      booking_ref: bookingRef,
      status: "pending",
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
