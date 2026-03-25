// POST /api/admin/reset-password — Request or confirm password reset

const crypto = require("crypto");
const { getDb } = require("../lib/db");
const { hashPassword } = require("../lib/auth");
const { sendPasswordResetEmail } = require("../lib/email");
const { ok, badRequest, serverError, methodNotAllowed } = require("../lib/helpers");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  const { email, token, new_password } = req.body || {};

  // If token + new_password provided, this is a reset confirmation
  if (token && new_password) {
    return confirmReset(req, res, token, new_password);
  }

  // Otherwise, request a reset
  if (!email) return badRequest(res, "email is required");

  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM admins WHERE email = ${email}`;
    if (rows.length === 0) {
      // Don't reveal if email exists
      return ok(res, { message: "If that email exists, a reset link has been sent." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    await sql`
      INSERT INTO password_resets (email, token, expires_at, created_at)
      VALUES (${email}, ${resetToken}, ${expiresAt}, ${new Date().toISOString()})
    `;

    await sendPasswordResetEmail(email, resetToken);

    return ok(res, { message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    return serverError(res, err.message);
  }
};

async function confirmReset(req, res, token, newPassword) {
  if (newPassword.length < 8) {
    return badRequest(res, "Password must be at least 8 characters");
  }

  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM password_resets WHERE token = ${token}`;

    if (rows.length === 0) {
      return badRequest(res, "Invalid or expired reset token");
    }

    const resetRecord = rows[0];

    // FIXED: Actually check token expiry (was missing in old backend)
    if (new Date(resetRecord.expires_at) < new Date()) {
      await sql`DELETE FROM password_resets WHERE token = ${token}`;
      return badRequest(res, "Reset token has expired. Please request a new one.");
    }

    const hashedPw = await hashPassword(newPassword);
    await sql`UPDATE admins SET password = ${hashedPw}, updated_at = ${new Date().toISOString()} WHERE email = ${resetRecord.email}`;

    // Clean up used token
    await sql`DELETE FROM password_resets WHERE token = ${token}`;

    return ok(res, { message: "Password reset successfully" });
  } catch (err) {
    return serverError(res, err.message);
  }
}
