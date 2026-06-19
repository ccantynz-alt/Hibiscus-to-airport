// GET /api/cron/reminders — Vercel Cron Job: send day-before reminders
// Configured in vercel.json to run daily at 5:00 UTC (6 PM NZDT)

const { getDb } = require("../lib/db");
const { sendReminderEmail } = require("../lib/email");
const { sendReminderSms } = require("../lib/sms");
const { ok, unauthorized, serverError } = require("../lib/helpers");

module.exports = async function handler(req, res) {
  // Verify this is a legitimate cron call (Vercel sets this header)
  const cronSecret = req.headers["authorization"];
  const expectedSecret = process.env.CRON_SECRET;

  // In production, verify the cron secret
  if (expectedSecret && cronSecret !== `Bearer ${expectedSecret}`) {
    return unauthorized(res, "Invalid cron secret");
  }

  try {
    const sql = getDb();

    // Calculate tomorrow's date in NZ timezone using calendar-level arithmetic
    // (adding 86400000ms is wrong across DST transitions — NZ has 23/25-hour days)
    const todayNzStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Auckland" }).format(new Date());
    const [y, m, d] = todayNzStr.split("-").map(Number);
    const tomorrowStr = new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);

    const rows = await sql`
      SELECT * FROM bookings
      WHERE date = ${tomorrowStr}
        AND status = 'confirmed'
        AND payment_status = 'paid'
        AND (reminder_sent IS NULL OR reminder_sent = false)
      LIMIT 100
    `;

    let sentCount = 0;
    for (const booking of rows) {
      try {
        const emailOk = await sendReminderEmail(booking);
        const smsOk = await sendReminderSms(booking);

        if (emailOk || smsOk) {
          await sql`
            UPDATE bookings
            SET reminder_sent = true, reminder_sent_at = ${new Date().toISOString()}
            WHERE id = ${booking.id}
          `;
          sentCount++;
        } else {
          console.error(`All reminders failed for ${booking.booking_ref} — will retry next run`);
        }
      } catch (err) {
        console.error(`Reminder failed for ${booking.booking_ref}: ${err.message}`);
      }
    }

    console.log(`Day-before reminders: ${sentCount}/${rows.length} sent`);
    return ok(res, { message: `Reminders sent: ${sentCount}`, total: rows.length });
  } catch (err) {
    return serverError(res, err.message);
  }
};
