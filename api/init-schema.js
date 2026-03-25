// GET /api/init-schema — Initialize database schema (run once after migration)
// Protected by ADMIN_API_KEY

const { initSchema } = require("./lib/db");
const { ok, unauthorized, serverError } = require("./lib/helpers");

module.exports = async function handler(req, res) {
  // Require API key for schema initialization
  const apiKey = req.headers["x-api-key"] || req.query.key;
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey || apiKey !== expectedKey) {
    return unauthorized(res, "Invalid API key");
  }

  try {
    const result = await initSchema();
    return ok(res, result);
  } catch (err) {
    return serverError(res, err.message);
  }
};
