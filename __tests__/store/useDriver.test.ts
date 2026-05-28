import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: vi.fn(),
  getCurrentPositionAsync: vi.fn(),
  watchPositionAsync: vi.fn(),
  Accuracy: { Balanced: 3 },
}));

import { useDriver } from "../../store/useDriver";

function resetDriver() {
  useDriver.setState({
    isOnline: false,
    todayEarnings: 0,
    todayRides: 0,
    incomingRideId: null,
    locationSubscription: null,
  });
}

describe("useDriver", () => {
  beforeEach(() => {
    resetDriver();
  });

  it("has correct initial state", () => {
    const state = useDriver.getState();
    expect(state.isOnline).toBe(false);
    expect(state.todayEarnings).toBe(0);
    expect(state.todayRides).toBe(0);
    expect(state.incomingRideId).toBeNull();
    expect(state.locationSubscription).toBeNull();
  });

  describe("setOnline", () => {
    it("sets online to true", () => {
      useDriver.getState().setOnline(true);
      expect(useDriver.getState().isOnline).toBe(true);
    });

    it("sets online to false", () => {
      useDriver.getState().setOnline(true);
      useDriver.getState().setOnline(false);
      expect(useDriver.getState().isOnline).toBe(false);
    });
  });

  describe("setTodayEarnings", () => {
    it("sets today earnings", () => {
      useDriver.getState().setTodayEarnings(125.50);
      expect(useDriver.getState().todayEarnings).toBe(125.50);
    });

    it("can be set to zero", () => {
      useDriver.getState().setTodayEarnings(100);
      useDriver.getState().setTodayEarnings(0);
      expect(useDriver.getState().todayEarnings).toBe(0);
    });
  });

  describe("setTodayRides", () => {
    it("sets today ride count", () => {
      useDriver.getState().setTodayRides(7);
      expect(useDriver.getState().todayRides).toBe(7);
    });
  });

  describe("setIncomingRide", () => {
    it("sets incoming ride id", () => {
      useDriver.getState().setIncomingRide("ride-123");
      expect(useDriver.getState().incomingRideId).toBe("ride-123");
    });

    it("can be cleared with null", () => {
      useDriver.getState().setIncomingRide("ride-123");
      useDriver.getState().setIncomingRide(null);
      expect(useDriver.getState().incomingRideId).toBeNull();
    });
  });
});
