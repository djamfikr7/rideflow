import { create } from "zustand";
import type { Ride, DriverInfo, FareEstimate, RideType, RideRating } from "../types/ride";

interface RideState {
  currentRide: Ride | null;
  driver: DriverInfo | null;
  fareEstimates: FareEstimate[];
  selectedRideType: RideType;
  isMatching: boolean;
  lastRating: RideRating | null;

  setCurrentRide: (ride: Ride | null) => void;
  setDriver: (driver: DriverInfo | null) => void;
  setFareEstimates: (estimates: FareEstimate[]) => void;
  setSelectedRideType: (type: RideType) => void;
  setIsMatching: (matching: boolean) => void;
  updateDriverLocation: (lat: number, lng: number) => void;
  submitRating: (stars: number, comment?: string) => void;
  clearRide: () => void;
}

export const useRide = create<RideState>((set) => ({
  currentRide: null,
  driver: null,
  fareEstimates: [],
  selectedRideType: "standard",
  isMatching: false,
  lastRating: null,

  setCurrentRide: (ride) => set({ currentRide: ride }),
  setDriver: (driver) => set({ driver }),
  setFareEstimates: (estimates) => set({ fareEstimates: estimates }),
  setSelectedRideType: (type) => set({ selectedRideType: type }),
  setIsMatching: (matching) => set({ isMatching: matching }),
  updateDriverLocation: (lat, lng) =>
    set((state) => ({
      driver: state.driver ? { ...state.driver, currentLat: lat, currentLng: lng } : null,
    })),
  submitRating: (stars, comment) =>
    set({
      lastRating: {
        stars,
        comment: comment?.trim() || undefined,
        submittedAt: new Date().toISOString(),
      },
    }),
  clearRide: () =>
    set({
      currentRide: null,
      driver: null,
      fareEstimates: [],
      isMatching: false,
      lastRating: null,
    }),
}));
