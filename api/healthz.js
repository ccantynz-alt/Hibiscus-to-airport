// GET /api/healthz — Health check endpoint

const { ok } = require("./lib/helpers");

module.exports = function handler(req, res) {
  return ok(res, {
    status: "healthy",
    platform: "vercel-serverless",
    timestamp: new Date().toISOString(),
  });
};
