import * as ExpoLocation from "expo-location";
import type { Location } from "../types/ride";
import type { Region } from "react-native-maps";

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
  return status === "granted";
}

export async function getCurrentLocation(): Promise<Location | null> {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return null;

  const location = await ExpoLocation.getCurrentPositionAsync({
    accuracy: ExpoLocation.Accuracy.Balanced,
  });

  return {
    lat: location.coords.latitude,
    lng: location.coords.longitude,
    address: "Current Location",
  };
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const results = await ExpoLocation.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    if (results.length > 0) {
      const { street, city, region, country } = results[0];
      return [street, city, region, country].filter(Boolean).join(", ");
    }
  } catch {
    // silent fail
  }
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

export async function searchPlaces(query: string): Promise<Location[]> {
  try {
    const results = await ExpoLocation.geocodeAsync(query);
    return results.map((r) => ({
      lat: r.latitude,
      lng: r.longitude,
      address: query,
    }));
  } catch {
    return [];
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timeout")), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

/**
 * Forward-geocode a query string, then reverse-geocode each result
 * to get a human-readable address. Returns up to `limit` locations.
 */
export async function geocodeSearch(query: string, limit = 5): Promise<Location[]> {
  try {
    const geocoded = await withTimeout(ExpoLocation.geocodeAsync(query), 5000);
    const sliced = geocoded.slice(0, limit);

    const results = await Promise.allSettled(
      sliced.map(async (r) => {
        const reverseResult = await ExpoLocation.reverseGeocodeAsync({
          latitude: r.latitude,
          longitude: r.longitude,
        });
        const formatted =
          reverseResult.length > 0
            ? [reverseResult[0].street, reverseResult[0].city, reverseResult[0].region, reverseResult[0].country]
                .filter(Boolean)
                .join(", ")
            : query;
        return { lat: r.latitude, lng: r.longitude, address: formatted } as Location;
      })
    );

    return results
      .filter((r): r is PromiseFulfilledResult<Location> => r.status === "fulfilled")
      .map((r) => r.value);
  } catch {
    return [];
  }
}

/**
 * Haversine formula: compute straight-line distance in km between two coordinates.
 */
export function haversineDistance(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format a distance in km to a human-readable string (e.g., "3.2 km").
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Estimate travel duration in minutes assuming an average speed of 30 km/h (urban).
 * This is a rough placeholder until we integrate Google Directions API.
 */
export function estimateDurationMinutes(distanceKm: number): number {
  const avgSpeedKmh = 30;
  return Math.round((distanceKm / avgSpeedKmh) * 60);
}

/**
 * Compute a Region that fits all the given coordinates with padding.
 * Falls back to a default region centered on San Francisco if no coords.
 */
export function getRegionForCoordinates(
  coordinates: Array<{ lat: number; lng: number }>,
  paddingFactor = 1.5
): Region {
  if (coordinates.length === 0) {
    return {
      latitude: 37.7749,
      longitude: -122.4194,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }

  if (coordinates.length === 1) {
    return {
      latitude: coordinates[0].lat,
      longitude: coordinates[0].lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const coord of coordinates) {
    minLat = Math.min(minLat, coord.lat);
    maxLat = Math.max(maxLat, coord.lat);
    minLng = Math.min(minLng, coord.lng);
    maxLng = Math.max(maxLng, coord.lng);
  }

  const latDelta = (maxLat - minLat) * paddingFactor;
  const lngDelta = (maxLng - minLng) * paddingFactor;

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(latDelta, 0.01),
    longitudeDelta: Math.max(lngDelta, 0.01),
  };
}
