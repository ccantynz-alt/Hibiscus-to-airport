// POST /api/admin/change-password — Change admin password (requires auth)

const { getDb } = require("../lib/db");
const { authenticateRequest, verifyPassword, hashPassword } = require("../lib/auth");
const { ok, badRequest, unauthorized, serverError, methodNotAllowed } = require("../lib/helpers");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  const user = authenticateRequest(req);
  if (!user) return unauthorized(res);

  const { current_password, new_password } = req.body || {};

  if (!current_password || !new_password) {
    return badRequest(res, "current_password and new_password are required");
  }

  if (new_password.length < 8) {
    return badRequest(res, "New password must be at least 8 characters");
  }

  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM admins WHERE id = ${user.sub}`;
    if (rows.length === 0) return unauthorized(res, "Admin not found");

    const admin = rows[0];
    const valid = await verifyPassword(current_password, admin.password);
    if (!valid) return unauthorized(res, "Current password is incorrect");

    const hashedPw = await hashPassword(new_password);
    await sql`UPDATE admins SET password = ${hashedPw}, updated_at = ${new Date().toISOString()} WHERE id = ${user.sub}`;

    return ok(res, { message: "Password changed successfully" });
  } catch (err) {
    return serverError(res, err.message);
  }
};
