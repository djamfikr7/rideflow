// Fare calculation utility
// Base rates per vehicle type (USD)
const BASE_FARES = {
  STANDARD: { base: 2.50, perKm: 1.50, perMin: 0.25, minimum: 5.00 },
  COMFORT: { base: 4.00, perKm: 2.25, perMin: 0.35, minimum: 8.00 },
  PREMIUM: { base: 7.00, perKm: 3.50, perMin: 0.50, minimum: 15.00 },
};

// Surge multiplier (simplified - time-based)
function getSurgeMultiplier(): number {
  const hour = new Date().getHours();
  // Peak hours: 7-9 AM and 5-7 PM
  if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
    return 1.5;
  }
  // Late night: 11 PM - 4 AM
  if (hour >= 23 || hour <= 4) {
    return 1.25;
  }
  return 1.0;
}

export interface FareEstimate {
  rideType: string;
  distance: number; // km
  duration: number; // minutes
  price: number;
  currency: string;
  surgeMultiplier: number;
}

export function calculateFare(
  distanceKm: number,
  durationMinutes: number,
  vehicleType: 'STANDARD' | 'COMFORT' | 'PREMIUM'
): FareEstimate {
  const rates = BASE_FARES[vehicleType];
  const surge = getSurgeMultiplier();

  const distanceFare = distanceKm * rates.perKm;
  const timeFare = durationMinutes * rates.perMin;
  const rawFare = (rates.base + distanceFare + timeFare) * surge;
  const finalFare = Math.max(rawFare, rates.minimum);

  return {
    rideType: vehicleType.toLowerCase(),
    distance: Math.round(distanceKm * 100) / 100,
    duration: Math.round(durationMinutes),
    price: Math.round(finalFare * 100) / 100,
    currency: 'USD',
    surgeMultiplier: surge,
  };
}

// Haversine distance between two points (km)
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Estimate duration based on distance (simplified)
export function estimateDuration(distanceKm: number): number {
  // Assume average speed of 30 km/h in city
  return Math.round((distanceKm / 30) * 60); // minutes
}
