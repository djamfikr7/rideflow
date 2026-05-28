import { create } from "zustand";
import type { Ride, RideType } from "../types/ride";

interface HistoryState {
  rides: Ride[];
  addRide: (ride: Ride) => void;
  getRideById: (id: string) => Ride | undefined;
}

// Generate ISO date strings relative to today for realistic mock data
function daysAgo(days: number, hours = 12, minutes = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

const MOCK_RIDES: Ride[] = [
  {
    id: "ride-hist-001",
    riderId: "rider-mock",
    driverId: "driver-001",
    status: "completed",
    pickup: {
      lat: 37.7749,
      lng: -122.4194,
      address: "123 Market Street, San Francisco, CA",
    },
    destination: {
      lat: 37.7849,
      lng: -122.4094,
      address: "456 Union Square, San Francisco, CA",
    },
    rideType: "standard",
    fareEstimate: 12.5,
    fareFinal: 13.2,
    distanceKm: 4.8,
    durationMinutes: 16,
    requestedAt: daysAgo(1, 9, 15),
    matchedAt: daysAgo(1, 9, 16),
    startedAt: daysAgo(1, 9, 22),
    completedAt: daysAgo(1, 9, 38),
  },
  {
    id: "ride-hist-002",
    riderId: "rider-mock",
    driverId: "driver-002",
    status: "completed",
    pickup: {
      lat: 37.7849,
      lng: -122.4094,
      address: "456 Union Square, San Francisco, CA",
    },
    destination: {
      lat: 37.8044,
      lng: -122.4199,
      address: "Fisherman's Wharf, San Francisco, CA",
    },
    rideType: "comfort",
    fareEstimate: 18.75,
    fareFinal: 19.4,
    distanceKm: 6.2,
    durationMinutes: 22,
    requestedAt: daysAgo(3, 14, 0),
    matchedAt: daysAgo(3, 14, 2),
    startedAt: daysAgo(3, 14, 8),
    completedAt: daysAgo(3, 14, 30),
  },
  {
    id: "ride-hist-003",
    riderId: "rider-mock",
    driverId: "driver-003",
    status: "completed",
    pickup: {
      lat: 37.7694,
      lng: -122.4862,
      address: "Golden Gate Park, San Francisco, CA",
    },
    destination: {
      lat: 37.7749,
      lng: -122.4194,
      address: "123 Market Street, San Francisco, CA",
    },
    rideType: "premium",
    fareEstimate: 28.0,
    fareFinal: 31.5,
    distanceKm: 8.1,
    durationMinutes: 28,
    requestedAt: daysAgo(5, 18, 30),
    matchedAt: daysAgo(5, 18, 31),
    startedAt: daysAgo(5, 18, 37),
    completedAt: daysAgo(5, 19, 5),
  },
  {
    id: "ride-hist-004",
    riderId: "rider-mock",
    status: "cancelled",
    pickup: {
      lat: 37.7849,
      lng: -122.4094,
      address: "456 Union Square, San Francisco, CA",
    },
    destination: {
      lat: 37.7580,
      lng: -122.4375,
      address: "Dolores Park, San Francisco, CA",
    },
    rideType: "standard",
    fareEstimate: 9.25,
    distanceKm: 3.2,
    durationMinutes: 12,
    requestedAt: daysAgo(7, 11, 0),
    cancelledAt: daysAgo(7, 11, 3),
    cancellationReason: "Changed my mind",
  },
  {
    id: "ride-hist-005",
    riderId: "rider-mock",
    driverId: "driver-001",
    status: "completed",
    pickup: {
      lat: 37.7749,
      lng: -122.4194,
      address: "123 Market Street, San Francisco, CA",
    },
    destination: {
      lat: 37.8075,
      lng: -122.4144,
      address: "North Beach, San Francisco, CA",
    },
    rideType: "comfort",
    fareEstimate: 15.0,
    fareFinal: 15.8,
    distanceKm: 5.5,
    durationMinutes: 19,
    requestedAt: daysAgo(10, 20, 45),
    matchedAt: daysAgo(10, 20, 46),
    startedAt: daysAgo(10, 20, 52),
    completedAt: daysAgo(10, 21, 11),
  },
];

export const useHistory = create<HistoryState>((set, get) => ({
  rides: MOCK_RIDES,

  addRide: (ride) =>
    set((state) => ({
      rides: [ride, ...state.rides],
    })),

  getRideById: (id) => get().rides.find((r) => r.id === id),
}));
