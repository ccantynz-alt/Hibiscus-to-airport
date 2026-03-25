// POST /api/stripe/create-session — Create Stripe Checkout session

const { getDb } = require("../lib/db");
const { ok, badRequest, notFound, serverError, methodNotAllowed } = require("../lib/helpers");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return serverError(res, "Stripe not configured");

  const stripe = require("stripe")(stripeKey);
  const frontendUrl = process.env.FRONTEND_URL || "https://hibiscustoairport.co.nz";

  const { booking_id } = req.body || {};
  if (!booking_id) return badRequest(res, "booking_id is required");

  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM bookings WHERE id = ${booking_id}`;
    if (rows.length === 0) return notFound(res, "Booking not found");

    const booking = rows[0];
    const totalPrice = parseFloat(booking.total_price) || 0;

    if (totalPrice <= 0) return badRequest(res, "Invalid booking price");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "nzd",
            product_data: {
              name: `Airport Transfer - ${booking.booking_ref}`,
              description: `${booking.pickup_address} to ${booking.dropoff_address}`,
            },
            unit_amount: Math.round(totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${frontendUrl}/payment/success?booking_ref=${booking.booking_ref}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/payment/cancel?booking_ref=${booking.booking_ref}`,
      metadata: {
        booking_id: booking.id,
        booking_ref: booking.booking_ref,
      },
    });

    // Mark that payment link was sent
    await sql`UPDATE bookings SET payment_link_sent = ${new Date().toISOString()} WHERE id = ${booking_id}`;

    return ok(res, { sessionId: session.id, url: session.url });
  } catch (err) {
    return serverError(res, err.message);
  }
};
