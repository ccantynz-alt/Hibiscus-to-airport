// POST /api/admin/login — Admin authentication

const { getDb } = require("../lib/db");
const { createAccessToken, verifyPassword, hashPassword } = require("../lib/auth");
const { ok, badRequest, unauthorized, serverError, methodNotAllowed, uuid } = require("../lib/helpers");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  const { username, password } = req.body || {};

  if (!username || !password) {
    return badRequest(res, "Username and password are required");
  }

  try {
    const sql = getDb();

    // Check if any admins exist — if not, create the initial admin
    const admins = await sql`SELECT COUNT(*) as count FROM admins`;
    if (parseInt(admins[0].count, 10) === 0) {
      const initPassword = process.env.ADMIN_INIT_PASSWORD;
      if (!initPassword) {
        return serverError(res, "No admin accounts exist and ADMIN_INIT_PASSWORD is not set");
      }
      if (password !== initPassword) {
        return unauthorized(res, "Invalid credentials");
      }

      // Create initial admin
      const adminId = uuid();
      const hashedPw = await hashPassword(password);
      await sql`
        INSERT INTO admins (id, username, password, created_at)
        VALUES (${adminId}, ${username}, ${hashedPw}, ${new Date().toISOString()})
      `;

      const token = createAccessToken({ sub: adminId, username });
      return ok(res, { token, username, message: "Initial admin account created" });
    }

    // Normal login
    const rows = await sql`SELECT * FROM admins WHERE username = ${username}`;
    if (rows.length === 0) {
      return unauthorized(res, "Invalid credentials");
    }

    const admin = rows[0];
    const valid = await verifyPassword(password, admin.password);
    if (!valid) {
      return unauthorized(res, "Invalid credentials");
    }

    const token = createAccessToken({ sub: admin.id, username: admin.username });
    return ok(res, { token, username: admin.username });
  } catch (err) {
    return serverError(res, err.message);
  }
};
