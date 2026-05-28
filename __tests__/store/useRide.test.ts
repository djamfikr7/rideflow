import { describe, it, expect, beforeEach } from "vitest";
import { useRide } from "../../store/useRide";
import type { Ride, DriverInfo, FareEstimate } from "../../types/ride";

const mockDriver: DriverInfo = {
  id: "d-1",
  fullName: "Jane Driver",
  rating: 4.9,
  totalRides: 500,
  vehicleMake: "Toyota",
  vehicleModel: "Camry",
  vehicleColor: "White",
  licensePlate: "ABC1234",
  currentLat: 37.7749,
  currentLng: -122.4194,
};

const mockRide: Ride = {
  id: "ride-1",
  riderId: "rider-1",
  driverId: "d-1",
  status: "in_progress",
  pickup: { lat: 37.7749, lng: -122.4194, address: "SF" },
  destination: { lat: 37.8044, lng: -122.2712, address: "Oakland" },
  rideType: "standard",
  fareEstimate: 15.0,
  requestedAt: "2026-05-28T10:00:00.000Z",
};

const mockEstimates: FareEstimate[] = [
  { rideType: "standard", distance: 5, duration: 15, price: 12.5, currency: "USD" },
  { rideType: "comfort", distance: 5, duration: 15, price: 18.75, currency: "USD" },
  { rideType: "premium", distance: 5, duration: 15, price: 25.0, currency: "USD" },
];

function resetRide() {
  useRide.setState({
    currentRide: null,
    driver: null,
    fareEstimates: [],
    selectedRideType: "standard",
    isMatching: false,
    lastRating: null,
    paymentMethod: "card",
  });
}

describe("useRide", () => {
  beforeEach(() => {
    resetRide();
  });

  it("has correct initial state", () => {
    const state = useRide.getState();
    expect(state.currentRide).toBeNull();
    expect(state.driver).toBeNull();
    expect(state.fareEstimates).toEqual([]);
    expect(state.selectedRideType).toBe("standard");
    expect(state.isMatching).toBe(false);
    expect(state.lastRating).toBeNull();
    expect(state.paymentMethod).toBe("card");
  });

  describe("setCurrentRide", () => {
    it("sets the current ride", () => {
      useRide.getState().setCurrentRide(mockRide);
      expect(useRide.getState().currentRide).toEqual(mockRide);
    });

    it("can be cleared with null", () => {
      useRide.getState().setCurrentRide(mockRide);
      useRide.getState().setCurrentRide(null);
      expect(useRide.getState().currentRide).toBeNull();
    });
  });

  describe("setDriver", () => {
    it("sets the driver info", () => {
      useRide.getState().setDriver(mockDriver);
      expect(useRide.getState().driver).toEqual(mockDriver);
    });

    it("can be cleared with null", () => {
      useRide.getState().setDriver(mockDriver);
      useRide.getState().setDriver(null);
      expect(useRide.getState().driver).toBeNull();
    });
  });

  describe("setFareEstimates", () => {
    it("sets fare estimates array", () => {
      useRide.getState().setFareEstimates(mockEstimates);
      expect(useRide.getState().fareEstimates).toHaveLength(3);
      expect(useRide.getState().fareEstimates[0].price).toBe(12.5);
    });
  });

  describe("setSelectedRideType", () => {
    it("changes selected ride type", () => {
      useRide.getState().setSelectedRideType("comfort");
      expect(useRide.getState().selectedRideType).toBe("comfort");
    });

    it("can be set to premium", () => {
      useRide.getState().setSelectedRideType("premium");
      expect(useRide.getState().selectedRideType).toBe("premium");
    });
  });

  describe("setIsMatching", () => {
    it("sets matching state to true", () => {
      useRide.getState().setIsMatching(true);
      expect(useRide.getState().isMatching).toBe(true);
    });

    it("sets matching state to false", () => {
      useRide.getState().setIsMatching(true);
      useRide.getState().setIsMatching(false);
      expect(useRide.getState().isMatching).toBe(false);
    });
  });

  describe("updateDriverLocation", () => {
    it("updates driver coordinates when driver exists", () => {
      useRide.getState().setDriver(mockDriver);
      useRide.getState().updateDriverLocation(37.8, -122.3);
      const driver = useRide.getState().driver!;
      expect(driver.currentLat).toBe(37.8);
      expect(driver.currentLng).toBe(-122.3);
    });

    it("does nothing when no driver is set", () => {
      useRide.getState().updateDriverLocation(37.8, -122.3);
      expect(useRide.getState().driver).toBeNull();
    });
  });

  describe("submitRating", () => {
    it("creates a rating with stars only", () => {
      useRide.getState().submitRating(5);
      const rating = useRide.getState().lastRating!;
      expect(rating.stars).toBe(5);
      expect(rating.comment).toBeUndefined();
      expect(rating.submittedAt).toBeTruthy();
    });

    it("creates a rating with stars and comment", () => {
      useRide.getState().submitRating(4, "Great ride!");
      const rating = useRide.getState().lastRating!;
      expect(rating.stars).toBe(4);
      expect(rating.comment).toBe("Great ride!");
    });

    it("trims whitespace from comment", () => {
      useRide.getState().submitRating(3, "   ");
      expect(useRide.getState().lastRating!.comment).toBeUndefined();
    });
  });

  describe("setPaymentMethod", () => {
    it("sets payment method", () => {
      useRide.getState().setPaymentMethod("cash");
      expect(useRide.getState().paymentMethod).toBe("cash");
    });

    it("can set to wallet", () => {
      useRide.getState().setPaymentMethod("wallet");
      expect(useRide.getState().paymentMethod).toBe("wallet");
    });
  });

  describe("clearRide", () => {
    it("resets ride-related state to defaults", () => {
      useRide.getState().setCurrentRide(mockRide);
      useRide.getState().setDriver(mockDriver);
      useRide.getState().setFareEstimates(mockEstimates);
      useRide.getState().setIsMatching(true);
      useRide.getState().submitRating(5, "Nice");
      useRide.getState().setPaymentMethod("cash");

      useRide.getState().clearRide();

      const state = useRide.getState();
      expect(state.currentRide).toBeNull();
      expect(state.driver).toBeNull();
      expect(state.fareEstimates).toEqual([]);
      expect(state.isMatching).toBe(false);
      expect(state.lastRating).toBeNull();
      expect(state.paymentMethod).toBe("card");
    });
  });
});
