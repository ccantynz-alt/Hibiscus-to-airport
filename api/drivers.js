// /api/drivers
// GET = list drivers (admin), POST = create driver (admin)

const { getDb } = require("./lib/db");
const { authenticateRequest } = require("./lib/auth");
const { ok, created, badRequest, unauthorized, serverError, methodNotAllowed, uuid } = require("./lib/helpers");

module.exports = async function handler(req, res) {
  const user = authenticateRequest(req);
  if (!user) return unauthorized(res);

  if (req.method === "GET") return listDrivers(req, res);
  if (req.method === "POST") return createDriver(req, res);
  return methodNotAllowed(res, ["GET", "POST"]);
};

async function listDrivers(req, res) {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM drivers ORDER BY name`;
    return ok(res, { drivers: rows });
  } catch (err) {
    return serverError(res, err.message);
  }
}

async function createDriver(req, res) {
  const { name, phone, email, vehicle, license } = req.body || {};
  if (!name || !phone || !email) return badRequest(res, "name, phone, and email are required");

  try {
    const sql = getDb();
    const id = uuid();
    const now = new Date().toISOString();

    await sql`
      INSERT INTO drivers (id, name, phone, email, vehicle, license, created_at)
      VALUES (${id}, ${name}, ${phone}, ${email}, ${vehicle || ""}, ${license || ""}, ${now})
    `;

    return created(res, { message: "Driver created", driver: { id, name, phone, email, vehicle, license } });
  } catch (err) {
    return serverError(res, err.message);
  }
}
