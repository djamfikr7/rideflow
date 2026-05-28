import { vi, describe, it, expect } from "vitest";

vi.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: vi.fn(),
  getCurrentPositionAsync: vi.fn(),
  reverseGeocodeAsync: vi.fn(),
  geocodeAsync: vi.fn(),
  Accuracy: { Balanced: 3 },
}));

vi.mock("react-native-maps", () => ({}));

import {
  haversineDistance,
  formatDistance,
  estimateDurationMinutes,
  getRegionForCoordinates,
} from "../../lib/location";

describe("haversineDistance", () => {
  const sf = { lat: 37.7749, lng: -122.4194 };
  const la = { lat: 34.0522, lng: -118.2437 };

  it("returns ~559 km from SF to LA", () => {
    const distance = haversineDistance(sf, la);
    expect(distance).toBeCloseTo(559, 0); // within 1 km
  });

  it("returns 0 for the same point", () => {
    expect(haversineDistance(sf, sf)).toBe(0);
  });

  it("is symmetric (A to B == B to A)", () => {
    const ab = haversineDistance(sf, la);
    const ba = haversineDistance(la, sf);
    expect(ab).toBeCloseTo(ba, 10);
  });

  it("returns ~1.5 km for a short urban trip", () => {
    // SF Market St to roughly Union Square
    const a = { lat: 37.7749, lng: -122.4194 };
    const b = { lat: 37.7879, lng: -122.4074 };
    const distance = haversineDistance(a, b);
    expect(distance).toBeGreaterThan(1.0);
    expect(distance).toBeLessThan(2.5);
  });
});

describe("formatDistance", () => {
  it("formats sub-km distances in meters", () => {
    expect(formatDistance(0.5)).toBe("500 m");
  });

  it("formats 1.0 km", () => {
    expect(formatDistance(1.0)).toBe("1.0 km");
  });

  it("formats 3.2 km", () => {
    expect(formatDistance(3.2)).toBe("3.2 km");
  });

  it("formats very small distance in meters", () => {
    expect(formatDistance(0.1)).toBe("100 m");
  });

  it("formats large distance in km", () => {
    expect(formatDistance(15.7)).toBe("15.7 km");
  });
});

describe("estimateDurationMinutes", () => {
  it("returns 20 min for 10 km at 30 km/h", () => {
    expect(estimateDurationMinutes(10)).toBe(20);
  });

  it("returns 0 for 0 km", () => {
    expect(estimateDurationMinutes(0)).toBe(0);
  });

  it("returns 2 min for 1 km", () => {
    expect(estimateDurationMinutes(1)).toBe(2);
  });

  it("returns 6 min for 3 km", () => {
    expect(estimateDurationMinutes(3)).toBe(6);
  });
});

describe("getRegionForCoordinates", () => {
  it("returns default SF region for empty coordinates", () => {
    const region = getRegionForCoordinates([]);
    expect(region.latitude).toBe(37.7749);
    expect(region.longitude).toBe(-122.4194);
    expect(region.latitudeDelta).toBe(0.05);
    expect(region.longitudeDelta).toBe(0.05);
  });

  it("centers on a single point with small delta", () => {
    const region = getRegionForCoordinates([{ lat: 34.0522, lng: -118.2437 }]);
    expect(region.latitude).toBe(34.0522);
    expect(region.longitude).toBe(-118.2437);
    expect(region.latitudeDelta).toBe(0.01);
    expect(region.longitudeDelta).toBe(0.01);
  });

  it("centers between two points", () => {
    const region = getRegionForCoordinates([
      { lat: 37.0, lng: -122.0 },
      { lat: 38.0, lng: -121.0 },
    ]);
    expect(region.latitude).toBeCloseTo(37.5, 5);
    expect(region.longitude).toBeCloseTo(-121.5, 5);
  });

  it("uses padding factor for multiple points", () => {
    const coords = [
      { lat: 37.0, lng: -122.0 },
      { lat: 38.0, lng: -121.0 },
      { lat: 37.5, lng: -121.5 },
    ];
    const region = getRegionForCoordinates(coords);
    // latitude span = 1.0 * 1.5 = 1.5
    expect(region.latitudeDelta).toBeCloseTo(1.5, 5);
    // longitude span = 1.0 * 1.5 = 1.5
    expect(region.longitudeDelta).toBeCloseTo(1.5, 5);
  });

  it("enforces minimum delta of 0.01", () => {
    const region = getRegionForCoordinates([
      { lat: 37.7749, lng: -122.4194 },
      { lat: 37.7750, lng: -122.4195 },
    ]);
    expect(region.latitudeDelta).toBeGreaterThanOrEqual(0.01);
    expect(region.longitudeDelta).toBeGreaterThanOrEqual(0.01);
  });
});
