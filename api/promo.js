// /api/promo
// GET = list promo codes (admin), POST = create promo (admin)
// Also: GET /api/promo?code=xxx&validate=true — public validation

const { getDb } = require("./lib/db");
const { authenticateRequest } = require("./lib/auth");
const { ok, created, badRequest, unauthorized, notFound, serverError, methodNotAllowed, uuid } = require("./lib/helpers");

module.exports = async function handler(req, res) {
  if (req.method === "GET") {
    // Public promo validation
    if (req.query.validate === "true" && req.query.code) {
      return validatePromo(req, res);
    }
    // Admin list
    const user = authenticateRequest(req);
    if (!user) return unauthorized(res);
    return listPromos(req, res);
  }
  if (req.method === "POST") {
    const user = authenticateRequest(req);
    if (!user) return unauthorized(res);
    return createPromo(req, res);
  }
  return methodNotAllowed(res, ["GET", "POST"]);
};

async function validatePromo(req, res) {
  try {
    const sql = getDb();
    const { code } = req.query;
    const rows = await sql`SELECT * FROM promo_codes WHERE code = ${code.toUpperCase()} AND active = true`;

    if (rows.length === 0) return notFound(res, "Invalid or expired promo code");

    const promo = rows[0];

    // Check expiry
    if (promo.expiry_date && new Date(promo.expiry_date) < new Date()) {
      return badRequest(res, "Promo code has expired");
    }

    // Check max uses
    if (promo.max_uses && promo.uses_count >= promo.max_uses) {
      return badRequest(res, "Promo code has reached maximum uses");
    }

    return ok(res, {
      code: promo.code,
      discount_type: promo.discount_type,
      discount_value: parseFloat(promo.discount_value),
      min_booking_amount: parseFloat(promo.min_booking_amount) || 0,
    });
  } catch (err) {
    return serverError(res, err.message);
  }
}

async function listPromos(req, res) {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM promo_codes ORDER BY created_at DESC`;
    return ok(res, { promos: rows });
  } catch (err) {
    return serverError(res, err.message);
  }
}

async function createPromo(req, res) {
  const { code, discount_type, discount_value, min_booking_amount, max_uses, expiry_date, description } = req.body || {};
  if (!code || !discount_type || discount_value == null) {
    return badRequest(res, "code, discount_type, and discount_value are required");
  }

  try {
    const sql = getDb();
    const id = uuid();
    await sql`
      INSERT INTO promo_codes (id, code, discount_type, discount_value, min_booking_amount, max_uses, expiry_date, description, created_at)
      VALUES (${id}, ${code.toUpperCase()}, ${discount_type}, ${discount_value}, ${min_booking_amount || 0}, ${max_uses || null}, ${expiry_date || null}, ${description || ""}, ${new Date().toISOString()})
    `;
    return created(res, { message: "Promo code created", id });
  } catch (err) {
    return serverError(res, err.message);
  }
}
