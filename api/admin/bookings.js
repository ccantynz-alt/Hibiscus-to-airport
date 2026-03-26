// GET /api/admin/bookings — List bookings with optional filters (admin)
// Also handles CSV export via ?format=csv

const { getDb } = require("../lib/db");
const { authenticateRequest } = require("../lib/auth");
const { ok, unauthorized, serverError, methodNotAllowed, rowToBooking } = require("../lib/helpers");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  const user = authenticateRequest(req);
  if (!user) return unauthorized(res);

  try {
    const sql = getDb();
    const { status, payment_status, format, search } = req.query;

    // Build query with filters
    let rows;
    if (search) {
      rows = await sql`
        SELECT id, booking_ref, name, email, phone, pickup_address, dropoff_address,
               date, time, passengers, notes, service_type, pricing, total_price,
               status, payment_status, payment_method, assigned_driver_name,
               tracking_status, created_at, updated_at
        FROM bookings
        WHERE name ILIKE ${"%" + search + "%"}
           OR email ILIKE ${"%" + search + "%"}
           OR phone ILIKE ${"%" + search + "%"}
           OR booking_ref ILIKE ${"%" + search + "%"}
        ORDER BY created_at DESC LIMIT 500
      `;
    } else if (status && payment_status) {
      rows = await sql`
        SELECT id, booking_ref, name, email, phone, pickup_address, dropoff_address,
               date, time, passengers, notes, service_type, pricing, total_price,
               status, payment_status, payment_method, assigned_driver_name,
               tracking_status, created_at, updated_at
        FROM bookings WHERE status = ${status} AND payment_status = ${payment_status}
        ORDER BY created_at DESC LIMIT 500
      `;
    } else if (status) {
      rows = await sql`
        SELECT id, booking_ref, name, email, phone, pickup_address, dropoff_address,
               date, time, passengers, notes, service_type, pricing, total_price,
               status, payment_status, payment_method, assigned_driver_name,
               tracking_status, created_at, updated_at
        FROM bookings WHERE status = ${status}
        ORDER BY created_at DESC LIMIT 500
      `;
    } else {
      rows = await sql`
        SELECT id, booking_ref, name, email, phone, pickup_address, dropoff_address,
               date, time, passengers, notes, service_type, pricing, total_price,
               status, payment_status, payment_method, assigned_driver_name,
               tracking_status, created_at, updated_at
        FROM bookings ORDER BY created_at DESC LIMIT 500
      `;
    }

    // CSV export
    if (format === "csv") {
      const headers = ["Ref", "Name", "Email", "Phone", "Pickup", "Dropoff", "Date", "Time", "Passengers", "Total", "Status", "Payment"];
      const csvRows = rows.map((r) =>
        [r.booking_ref, r.name, r.email, r.phone, r.pickup_address, r.dropoff_address, r.date, r.time, r.passengers, r.total_price, r.status, r.payment_status]
          .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
          .join(",")
      );
      const csv = [headers.join(","), ...csvRows].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=bookings.csv");
      return res.status(200).send(csv);
    }

    return ok(res, { bookings: rows.map(rowToBooking), count: rows.length });
  } catch (err) {
    return serverError(res, err.message);
  }
};
