// GET /api/cron/cleanup — Vercel Cron Job: daily cleanup of expired/stale data
// Configured in vercel.json to run daily at 6:00 UTC (7 PM NZDT)

const { getDb } = require("../lib/db");
const { ok, unauthorized, serverError } = require("../lib/helpers");

module.exports = async function handler(req, res) {
  // Verify this is a legitimate cron call (Vercel sets this header)
  const cronSecret = req.headers["authorization"];
  const expectedSecret = process.env.CRON_SECRET;

  // In production, verify the cron secret
  if (expectedSecret && cronSecret !== `Bearer ${expectedSecret}`) {
    return unauthorized(res, "Invalid cron secret");
  }

  const results = {};

  try {
    const sql = getDb();

    // Delete expired password reset tokens (tokens expire after 1 hour, clean up after 2)
    const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const deleted = await sql`
      DELETE FROM password_resets
      WHERE expires_at < ${cutoff}
    `;
    results.expiredPasswordResets = deleted.count ?? 0;
    console.log(`Cleanup: removed ${results.expiredPasswordResets} expired password reset token(s)`);

    return ok(res, { message: "Cleanup complete", results });
  } catch (err) {
    return serverError(res, err.message);
  }
};
