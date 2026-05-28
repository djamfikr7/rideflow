import { create } from 'zustand';
import { useLocation } from './useLocation';

interface DriverModeState {
  isOnline: boolean;
  todayEarnings: number;
  todayRides: number;
  incomingRideId: string | null;
  locationWatchId: number | null;

  setOnline: (online: boolean) => void;
  setTodayEarnings: (earnings: number) => void;
  setTodayRides: (rides: number) => void;
  setIncomingRide: (rideId: string | null) => void;
  goOnline: () => Promise<void>;
  goOffline: () => void;
}

export const useDriver = create<DriverModeState>((set, get) => ({
  isOnline: false,
  todayEarnings: 0,
  todayRides: 0,
  incomingRideId: null,
  locationWatchId: null,

  setOnline: (online) => set({ isOnline: online }),
  setTodayEarnings: (earnings) => set({ todayEarnings: earnings }),
  setTodayRides: (rides) => set({ todayRides: rides }),
  setIncomingRide: (rideId) => set({ incomingRideId: rideId }),

  goOnline: async () => {
    if (!navigator.geolocation) return;

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        useLocation.getState().setCurrentLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: 'Current Location',
        });
      },
      () => {
        // Fallback to SF
        useLocation.getState().setCurrentLocation({
          lat: 37.7749,
          lng: -122.4194,
          address: 'San Francisco, CA',
        });
      }
    );

    // Start continuous tracking
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        useLocation.getState().setCurrentLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: 'Current Location',
        });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000 }
    );

    set({ isOnline: true, locationWatchId: watchId });
  },

  goOffline: () => {
    const { locationWatchId } = get();
    if (locationWatchId !== null) {
      navigator.geolocation.clearWatch(locationWatchId);
    }
    set({ isOnline: false, locationWatchId: null });
  },
}));
