import { describe, it, expect, beforeEach } from "vitest";
import { useHistory } from "../../store/useHistory";
import type { Ride } from "../../types/ride";

const mockNewRide: Ride = {
  id: "ride-new-001",
  riderId: "rider-test",
  driverId: "driver-new",
  status: "completed",
  pickup: { lat: 37.7749, lng: -122.4194, address: "Test Pickup" },
  destination: { lat: 37.8044, lng: -122.2712, address: "Test Destination" },
  rideType: "standard",
  fareEstimate: 20.0,
  fareFinal: 21.5,
  distanceKm: 10,
  durationMinutes: 25,
  requestedAt: "2026-05-28T10:00:00.000Z",
  matchedAt: "2026-05-28T10:01:00.000Z",
  startedAt: "2026-05-28T10:05:00.000Z",
  completedAt: "2026-05-28T10:30:00.000Z",
};

// useHistory starts with 5 mock rides — no reset needed between tests
// since we only test read + append behavior.

describe("useHistory", () => {
  it("has mock rides on initial state", () => {
    const rides = useHistory.getState().rides;
    expect(rides.length).toBeGreaterThanOrEqual(5);
  });

  it("mock rides include expected ids", () => {
    const ids = useHistory.getState().rides.map((r) => r.id);
    expect(ids).toContain("ride-hist-001");
    expect(ids).toContain("ride-hist-002");
    expect(ids).toContain("ride-hist-003");
    expect(ids).toContain("ride-hist-004");
    expect(ids).toContain("ride-hist-005");
  });

  describe("addRide", () => {
    it("prepends a new ride to the list", () => {
      const initialCount = useHistory.getState().rides.length;
      useHistory.getState().addRide(mockNewRide);
      const rides = useHistory.getState().rides;
      expect(rides.length).toBe(initialCount + 1);
      expect(rides[0].id).toBe("ride-new-001");
    });
  });

  describe("getRideById", () => {
    it("returns a ride when found", () => {
      const ride = useHistory.getState().getRideById("ride-hist-001");
      expect(ride).toBeDefined();
      expect(ride!.id).toBe("ride-hist-001");
      expect(ride!.status).toBe("completed");
    });

    it("returns a comfort ride by id", () => {
      const ride = useHistory.getState().getRideById("ride-hist-002");
      expect(ride).toBeDefined();
      expect(ride!.rideType).toBe("comfort");
    });

    it("returns a premium ride by id", () => {
      const ride = useHistory.getState().getRideById("ride-hist-003");
      expect(ride).toBeDefined();
      expect(ride!.rideType).toBe("premium");
    });

    it("returns a cancelled ride by id", () => {
      const ride = useHistory.getState().getRideById("ride-hist-004");
      expect(ride).toBeDefined();
      expect(ride!.status).toBe("cancelled");
    });

    it("returns undefined for non-existent id", () => {
      const ride = useHistory.getState().getRideById("non-existent-id");
      expect(ride).toBeUndefined();
    });

    it("can find a recently added ride", () => {
      useHistory.getState().addRide(mockNewRide);
      const ride = useHistory.getState().getRideById("ride-new-001");
      expect(ride).toBeDefined();
      expect(ride!.fareFinal).toBe(21.5);
    });
  });
});
