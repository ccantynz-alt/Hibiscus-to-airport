// api/lib/auth.js
// JWT authentication for Vercel Serverless Functions

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const SECRET_KEY = process.env.JWT_SECRET_KEY;
const ALGORITHM = "HS256";
const TOKEN_EXPIRY = "24h";

if (!SECRET_KEY && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET_KEY environment variable is REQUIRED in production");
}

function getSecret() {
  if (!SECRET_KEY) {
    throw new Error("JWT_SECRET_KEY environment variable is not set");
  }
  return SECRET_KEY;
}

/**
 * Create a JWT access token.
 */
function createAccessToken(payload) {
  return jwt.sign(payload, getSecret(), {
    algorithm: ALGORITHM,
    expiresIn: TOKEN_EXPIRY,
  });
}

/**
 * Verify and decode a JWT token. Returns payload or null.
 */
function decodeToken(token) {
  try {
    return jwt.verify(token, getSecret(), { algorithms: [ALGORITHM] });
  } catch {
    return null;
  }
}

/**
 * Extract and verify bearer token from request.
 * Returns user payload or null.
 */
function authenticateRequest(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.slice(7);
  return decodeToken(token);
}

/**
 * Hash a password with bcrypt.
 */
async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

/**
 * Verify a password against a bcrypt hash.
 */
async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = {
  createAccessToken,
  decodeToken,
  authenticateRequest,
  hashPassword,
  verifyPassword,
};
