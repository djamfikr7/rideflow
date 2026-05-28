import { create } from "zustand";

interface DriverModeState {
  isOnline: boolean;
  todayEarnings: number;
  todayRides: number;
  incomingRideId: string | null;

  setOnline: (online: boolean) => void;
  setTodayEarnings: (earnings: number) => void;
  setTodayRides: (rides: number) => void;
  setIncomingRide: (rideId: string | null) => void;
}

export const useDriver = create<DriverModeState>((set) => ({
  isOnline: false,
  todayEarnings: 0,
  todayRides: 0,
  incomingRideId: null,

  setOnline: (online) => set({ isOnline: online }),
  setTodayEarnings: (earnings) => set({ todayEarnings: earnings }),
  setTodayRides: (rides) => set({ todayRides: rides }),
  setIncomingRide: (rideId) => set({ incomingRideId: rideId }),
}));
