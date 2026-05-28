import { create } from 'zustand';
import type { Location } from '../types/ride';

interface LocationState {
  currentLocation: Location | null;
  pickup: Location | null;
  destination: Location | null;
  setCurrentLocation: (location: Location) => void;
  setPickup: (location: Location | null) => void;
  setDestination: (location: Location | null) => void;
  clearLocations: () => void;
}

export const useLocation = create<LocationState>((set) => ({
  currentLocation: null,
  pickup: null,
  destination: null,

  setCurrentLocation: (location) => set({ currentLocation: location }),
  setPickup: (location) => set({ pickup: location }),
  setDestination: (location) => set({ destination: location }),
  clearLocations: () => set({ pickup: null, destination: null }),
}));
