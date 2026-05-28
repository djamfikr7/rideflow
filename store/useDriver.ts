import { create } from "zustand";
import * as ExpoLocation from "expo-location";
import { useLocation } from "./useLocation";

interface DriverModeState {
  isOnline: boolean;
  todayEarnings: number;
  todayRides: number;
  incomingRideId: string | null;
  locationSubscription: ExpoLocation.LocationSubscription | null;

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
  locationSubscription: null,

  setOnline: (online) => set({ isOnline: online }),
  setTodayEarnings: (earnings) => set({ todayEarnings: earnings }),
  setTodayRides: (rides) => set({ todayRides: rides }),
  setIncomingRide: (rideId) => set({ incomingRideId: rideId }),

  goOnline: async () => {
    const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    // Get initial position
    const initial = await ExpoLocation.getCurrentPositionAsync({
      accuracy: ExpoLocation.Accuracy.Balanced,
    });
    useLocation.getState().setCurrentLocation({
      lat: initial.coords.latitude,
      lng: initial.coords.longitude,
      address: "Current Location",
    });

    // Start continuous tracking
    const subscription = await ExpoLocation.watchPositionAsync(
      {
        accuracy: ExpoLocation.Accuracy.Balanced,
        distanceInterval: 25, // update every 25 meters
        timeInterval: 10000, // or every 10 seconds
      },
      (location) => {
        useLocation.getState().setCurrentLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          address: "Current Location",
        });
      }
    );

    set({ isOnline: true, locationSubscription: subscription });
  },

  goOffline: () => {
    const { locationSubscription } = get();
    if (locationSubscription) {
      locationSubscription.remove();
    }
    set({ isOnline: false, locationSubscription: null });
  },
}));
