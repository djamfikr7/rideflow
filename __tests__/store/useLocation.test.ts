import { describe, it, expect, beforeEach } from "vitest";
import { useLocation } from "../../store/useLocation";
import type { Location } from "../../types/ride";

const sfLocation: Location = {
  lat: 37.7749,
  lng: -122.4194,
  address: "San Francisco, CA",
};

const oaklandLocation: Location = {
  lat: 37.8044,
  lng: -122.2712,
  address: "Oakland, CA",
};

function resetLocation() {
  useLocation.setState({ currentLocation: null, pickup: null, destination: null });
}

describe("useLocation", () => {
  beforeEach(() => {
    resetLocation();
  });

  it("has correct initial state", () => {
    const state = useLocation.getState();
    expect(state.currentLocation).toBeNull();
    expect(state.pickup).toBeNull();
    expect(state.destination).toBeNull();
  });

  describe("setCurrentLocation", () => {
    it("sets the current location", () => {
      useLocation.getState().setCurrentLocation(sfLocation);
      expect(useLocation.getState().currentLocation).toEqual(sfLocation);
    });

    it("overwrites previous current location", () => {
      useLocation.getState().setCurrentLocation(sfLocation);
      useLocation.getState().setCurrentLocation(oaklandLocation);
      expect(useLocation.getState().currentLocation).toEqual(oaklandLocation);
    });
  });

  describe("setPickup", () => {
    it("sets the pickup location", () => {
      useLocation.getState().setPickup(sfLocation);
      expect(useLocation.getState().pickup).toEqual(sfLocation);
    });

    it("can be set to null", () => {
      useLocation.getState().setPickup(sfLocation);
      useLocation.getState().setPickup(null);
      expect(useLocation.getState().pickup).toBeNull();
    });
  });

  describe("setDestination", () => {
    it("sets the destination location", () => {
      useLocation.getState().setDestination(oaklandLocation);
      expect(useLocation.getState().destination).toEqual(oaklandLocation);
    });

    it("can be set to null", () => {
      useLocation.getState().setDestination(oaklandLocation);
      useLocation.getState().setDestination(null);
      expect(useLocation.getState().destination).toBeNull();
    });
  });

  describe("clearLocations", () => {
    it("clears pickup and destination but keeps currentLocation", () => {
      useLocation.getState().setCurrentLocation(sfLocation);
      useLocation.getState().setPickup(sfLocation);
      useLocation.getState().setDestination(oaklandLocation);

      useLocation.getState().clearLocations();

      const state = useLocation.getState();
      expect(state.currentLocation).toEqual(sfLocation);
      expect(state.pickup).toBeNull();
      expect(state.destination).toBeNull();
    });
  });
});
