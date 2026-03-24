// POST /api/stripe/webhook — Stripe webhook handler

const { getDb } = require("../lib/db");
const { sendCustomerConfirmation } = require("../lib/email");
const { sendCustomerSms } = require("../lib/sms");
const { rowToBooking } = require("../lib/helpers");

// Disable body parsing — Stripe needs raw body for signature verification
module.exports.config = { api: { bodyParser: false } };

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey) {
    return res.status(500).json({ ok: false, error: "Stripe not configured" });
  }

  const stripe = require("stripe")(stripeKey);

  // Read raw body
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const rawBody = Buffer.concat(chunks);

  let event;
  try {
    if (webhookSecret) {
      const sig = req.headers["stripe-signature"];
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      event = JSON.parse(rawBody.toString());
      console.warn("STRIPE_WEBHOOK_SECRET not set — webhook signature not verified");
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ ok: false, error: "Invalid signature" });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata?.booking_id;

    if (!bookingId) {
      console.error("Webhook missing booking_id in metadata");
      return res.status(200).json({ ok: true, message: "No booking_id in metadata" });
    }

    try {
      const sql = getDb();

      // IDEMPOTENCY CHECK: Don't process if already paid
      const rows = await sql`SELECT * FROM bookings WHERE id = ${bookingId}`;
      if (rows.length === 0) {
        console.error(`Webhook: booking ${bookingId} not found`);
        return res.status(200).json({ ok: true, message: "Booking not found" });
      }

      const booking = rows[0];

      if (booking.payment_status === "paid") {
        console.log(`Webhook: booking ${booking.booking_ref} already paid — skipping`);
        return res.status(200).json({ ok: true, message: "Already processed" });
      }

      // Update payment status
      await sql`
        UPDATE bookings
        SET status = 'confirmed', payment_status = 'paid',
            payment_method = 'stripe', updated_at = ${new Date().toISOString()}
        WHERE id = ${bookingId}
      `;

      // Send customer notifications
      const bookingDoc = rowToBooking(booking);
      bookingDoc.status = "confirmed";
      bookingDoc.payment_status = "paid";

      try { await sendCustomerConfirmation(bookingDoc); } catch (e) { console.error("Post-payment email failed:", e.message); }
      try { await sendCustomerSms(bookingDoc); } catch (e) { console.error("Post-payment SMS failed:", e.message); }

      console.log(`Payment confirmed for booking ${booking.booking_ref}`);
    } catch (err) {
      console.error("Webhook processing error:", err.message);
    }
  }

  return res.status(200).json({ ok: true, received: true });
};
