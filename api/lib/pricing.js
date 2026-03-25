// api/lib/pricing.js
// Pricing engine for Hibiscus to Airport
// Matches BookaRide pricing tiers exactly

/**
 * Calculate distance between two addresses using Google Distance Matrix API.
 * Returns distance in km or null on failure.
 */
async function calculateDistance(pickup, dropoff) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_MAPS_API_KEY not set");
    return null;
  }

  try {
    const params = new URLSearchParams({
      origins: pickup,
      destinations: dropoff,
      key: apiKey,
      units: "metric",
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?${params}`
    );
    const data = await response.json();

    if (
      data.status === "OK" &&
      data.rows[0]?.elements[0]?.status === "OK"
    ) {
      const distanceMeters = data.rows[0].elements[0].distance.value;
      return Math.round((distanceMeters / 1000) * 100) / 100;
    }
    console.error("Google Maps API error:", JSON.stringify(data));
    return null;
  } catch (err) {
    console.error(`Distance calculation error: ${err.message}`);
    return null;
  }
}

/**
 * Calculate price based on distance bracket and passengers.
 *
 * IMPORTANT: The rate is based on TOTAL distance, not incremental.
 * A 30km trip uses $5.00/km for the ENTIRE distance.
 *
 * Pricing tiers:
 * - 0 - 15 km:      $12.00/km
 * - 15 - 15.8 km:   $8.00/km
 * - 15.8 - 16 km:   $6.00/km
 * - 16 - 25.5 km:   $5.50/km
 * - 25.5 - 35 km:   $5.00/km
 * - 35 - 50 km:     $4.00/km
 * - 50 - 60 km:     $2.60/km
 * - 60 - 75 km:     $2.47/km
 * - 75 - 100 km:    $2.70/km
 * - 100+ km:        $3.50/km
 */
function calculatePrice(distanceKm, passengers = 1, vipPickup = false, oversizedLuggage = false) {
  let ratePerKm;

  if (distanceKm <= 15.0) ratePerKm = 12.0;
  else if (distanceKm <= 15.8) ratePerKm = 8.0;
  else if (distanceKm <= 16.0) ratePerKm = 6.0;
  else if (distanceKm <= 25.5) ratePerKm = 5.5;
  else if (distanceKm <= 35.0) ratePerKm = 5.0;
  else if (distanceKm <= 50.0) ratePerKm = 4.0;
  else if (distanceKm <= 60.0) ratePerKm = 2.6;
  else if (distanceKm <= 75.0) ratePerKm = 2.47;
  else if (distanceKm <= 100.0) ratePerKm = 2.7;
  else ratePerKm = 3.5;

  let basePrice = distanceKm * ratePerKm;
  const passengerFee = Math.max(0, passengers - 1) * 5.0;
  const airportFee = vipPickup ? 15.0 : 0.0;
  const luggageFee = oversizedLuggage ? 25.0 : 0.0;

  let totalPrice = basePrice + passengerFee + airportFee + luggageFee;

  // Minimum fare of $100
  if (totalPrice < 100.0) {
    totalPrice = 100.0;
    basePrice = 100.0 - passengerFee - airportFee - luggageFee;
  }

  return {
    distance: Math.round(distanceKm * 100) / 100,
    basePrice: Math.round(basePrice * 100) / 100,
    airportFee: Math.round(airportFee * 100) / 100,
    passengerFee: Math.round(passengerFee * 100) / 100,
    oversizedLuggageFee: Math.round(luggageFee * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100,
    ratePerKm,
  };
}

/**
 * Check if a booking is urgent (within 24 hours).
 * Returns { isUrgent, hoursUntil }.
 */
function isUrgentBooking(bookingDate, bookingTime = "00:00") {
  try {
    const bookingDt = new Date(`${bookingDate}T${bookingTime}:00`);
    // Approximate NZ timezone offset (+12 or +13)
    const nzOffsetMs = 12 * 60 * 60 * 1000;
    const nowNz = new Date(Date.now() + nzOffsetMs);
    const bookingNz = new Date(bookingDt.getTime() + nzOffsetMs);

    const hoursUntil = (bookingNz - nowNz) / (1000 * 60 * 60);
    return {
      isUrgent: hoursUntil > 0 && hoursUntil <= 24,
      hoursUntil: Math.round(hoursUntil * 10) / 10,
    };
  } catch {
    return { isUrgent: false, hoursUntil: 0 };
  }
}

module.exports = { calculateDistance, calculatePrice, isUrgentBooking };
