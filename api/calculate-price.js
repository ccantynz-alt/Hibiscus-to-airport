// POST /api/calculate-price
// Public endpoint — calculates price for a pickup/dropoff pair

const { calculateDistance, calculatePrice } = require("./lib/pricing");
const { ok, badRequest, serverError, methodNotAllowed } = require("./lib/helpers");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return methodNotAllowed(res, ["POST"]);
  }

  try {
    const { pickupAddress, dropoffAddress, passengers = 1 } = req.body || {};

    if (!pickupAddress || !dropoffAddress) {
      return badRequest(res, "pickupAddress and dropoffAddress are required");
    }

    const distance = await calculateDistance(pickupAddress, dropoffAddress);
    if (distance === null) {
      return badRequest(res, "Could not calculate distance between addresses");
    }

    const pricing = calculatePrice(distance, parseInt(passengers, 10) || 1);
    return ok(res, pricing);
  } catch (err) {
    return serverError(res, err.message);
  }
};
