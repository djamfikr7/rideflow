import { create } from 'zustand';
import type { Ride } from '../types/ride';

interface HistoryState {
  rides: Ride[];
  isLoading: boolean;
  setRides: (rides: Ride[]) => void;
  addRide: (ride: Ride) => void;
  setLoading: (loading: boolean) => void;
  getRideById: (id: string) => Ride | undefined;
}

export const useHistory = create<HistoryState>((set, get) => ({
  rides: [],
  isLoading: false,

  setRides: (rides) => set({ rides }),
  addRide: (ride) =>
    set((state) => ({
      rides: [ride, ...state.rides],
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  getRideById: (id) => get().rides.find((r) => r.id === id),
}));
