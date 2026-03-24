// api/lib/helpers.js
// Shared helpers for Vercel Serverless Functions

const crypto = require("crypto");

/**
 * Standard JSON response helper.
 * All API responses use: { ok: true/false, data?: ..., error?: "..." }
 */
function jsonResponse(res, statusCode, body) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0, private");
  return res.status(statusCode).json(body);
}

function ok(res, data = {}) {
  return jsonResponse(res, 200, { ok: true, ...data });
}

function created(res, data = {}) {
  return jsonResponse(res, 201, { ok: true, ...data });
}

function badRequest(res, error) {
  return jsonResponse(res, 400, { ok: false, error });
}

function unauthorized(res, error = "Authentication required") {
  return jsonResponse(res, 401, { ok: false, error });
}

function notFound(res, error = "Not found") {
  return jsonResponse(res, 404, { ok: false, error });
}

function tooManyRequests(res, error) {
  return jsonResponse(res, 429, { ok: false, error });
}

function serverError(res, error = "Internal server error") {
  console.error("Server error:", error);
  return jsonResponse(res, 500, { ok: false, error: typeof error === "string" ? error : "Internal server error" });
}

function methodNotAllowed(res, allowed = []) {
  res.setHeader("Allow", allowed.join(", "));
  return jsonResponse(res, 405, { ok: false, error: `Method not allowed. Use: ${allowed.join(", ")}` });
}

/**
 * HTML-escape user-provided strings before inserting into email templates.
 * Prevents HTML injection / XSS in emails.
 */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Generate a UUID v4.
 */
function uuid() {
  return crypto.randomUUID();
}

/**
 * Validate email format.
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate NZ phone number (basic check).
 */
function isValidPhone(phone) {
  // Accept formats: 021 743 321, +64-21-743-321, 0211234567, etc.
  const cleaned = phone.replace(/[\s\-()]+/g, "");
  return /^(\+?64|0)\d{7,10}$/.test(cleaned);
}

/**
 * Convert DB row (snake_case) to camelCase API response.
 */
function rowToBooking(row) {
  if (!row) return null;
  return {
    id: row.id,
    booking_ref: row.booking_ref,
    name: row.name,
    email: row.email,
    phone: row.phone,
    pickupAddress: row.pickup_address || "",
    dropoffAddress: row.dropoff_address || "",
    date: row.date || "",
    time: row.time || "",
    passengers: row.passengers || "1",
    notes: row.notes || "",
    serviceType: row.service_type || "",
    departureFlightNumber: row.departure_flight_number || "",
    departureTime: row.departure_time || "",
    arrivalFlightNumber: row.arrival_flight_number || "",
    arrivalTime: row.arrival_time || "",
    vipPickup: row.vip_pickup || false,
    oversizedLuggage: row.oversized_luggage || false,
    returnTrip: row.return_trip || false,
    pricing: row.pricing,
    totalPrice: row.total_price != null ? parseFloat(row.total_price) : 0,
    status: row.status || "pending",
    payment_status: row.payment_status || "unpaid",
    payment_method: row.payment_method,
    lastEmailSent: row.last_email_sent,
    lastSmsSent: row.last_sms_sent,
    paymentLinkSent: row.payment_link_sent,
    trackingId: row.tracking_id,
    trackingStatus: row.tracking_status,
    assignedDriverId: row.assigned_driver_id,
    assignedDriverName: row.assigned_driver_name,
    driverPayout: row.driver_payout != null ? parseFloat(row.driver_payout) : null,
    driverNotes: row.driver_notes,
    acceptanceToken: row.acceptance_token,
    driverAccepted: row.driver_accepted,
    driverAcceptedAt: row.driver_accepted_at,
    driverDeclinedAt: row.driver_declined_at,
    driverDeclineReason: row.driver_decline_reason,
    driverAssignedAt: row.driver_assigned_at,
    driverLocation: row.driver_location,
    driverEtaMinutes: row.driver_eta_minutes,
    autoDispatched: row.auto_dispatched || false,
    reminderSent: row.reminder_sent || false,
    reminderSentAt: row.reminder_sent_at,
    returnDriverId: row.return_driver_id,
    returnDriverName: row.return_driver_name,
    returnDriverPayout: row.return_driver_payout != null ? parseFloat(row.return_driver_payout) : null,
    returnDriverNotes: row.return_driver_notes,
    returnAcceptanceToken: row.return_acceptance_token,
    returnDriverAccepted: row.return_driver_accepted,
    returnTrackingStatus: row.return_tracking_status,
    returnDriverAssignedAt: row.return_driver_assigned_at,
    googleCalendarEventId: row.google_calendar_event_id,
    additionalPickups: row.additional_pickups || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Simple rate limiter using response headers.
 * Returns minutes remaining if in cooldown, or 0 if can proceed.
 */
function checkCooldown(lastSentIso, cooldownMinutes = 5) {
  if (!lastSentIso) return 0;
  try {
    const lastSent = new Date(lastSentIso);
    const now = new Date();
    const elapsedMinutes = (now - lastSent) / 60000;
    if (elapsedMinutes < cooldownMinutes) {
      return Math.ceil(cooldownMinutes - elapsedMinutes);
    }
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Format date as DD/MM/YYYY (NZ format).
 */
function formatDateNz(dateStr) {
  try {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Format date as DD/MM/YYYY (DayName).
 */
function formatDateWithDay(dateStr) {
  try {
    const d = new Date(dateStr);
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year} (${days[d.getDay()]})`;
  } catch {
    return dateStr;
  }
}

module.exports = {
  jsonResponse,
  ok,
  created,
  badRequest,
  unauthorized,
  notFound,
  tooManyRequests,
  serverError,
  methodNotAllowed,
  escapeHtml,
  uuid,
  isValidEmail,
  isValidPhone,
  rowToBooking,
  checkCooldown,
  formatDateNz,
  formatDateWithDay,
};
