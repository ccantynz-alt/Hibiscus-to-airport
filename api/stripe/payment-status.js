// GET /api/stripe/payment-status?booking_id=xxx — Check payment status

const { getDb } = require("../lib/db");
const { ok, badRequest, notFound, serverError, methodNotAllowed } = require("../lib/helpers");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  const { booking_id, booking_ref } = req.query;

  if (!booking_id && !booking_ref) {
    return badRequest(res, "booking_id or booking_ref is required");
  }

  try {
    const sql = getDb();
    let rows;

    if (booking_ref) {
      rows = await sql`SELECT id, booking_ref, status, payment_status, payment_method FROM bookings WHERE booking_ref = ${booking_ref}`;
    } else {
      rows = await sql`SELECT id, booking_ref, status, payment_status, payment_method FROM bookings WHERE id = ${booking_id}`;
    }

    if (rows.length === 0) return notFound(res, "Booking not found");

    const b = rows[0];
    return ok(res, {
      booking_ref: b.booking_ref,
      status: b.status,
      payment_status: b.payment_status,
      payment_method: b.payment_method,
    });
  } catch (err) {
    return serverError(res, err.message);
  }
};
