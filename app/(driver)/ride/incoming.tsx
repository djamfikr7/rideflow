import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDriver } from "../../../store/useDriver";
import { useRide } from "../../../store/useRide";
import { useLocation } from "../../../store/useLocation";
import { formatDistance } from "../../../lib/location";
import type { Ride, DriverInfo } from "../../../types/ride";

const COUNTDOWN_SECONDS = 15;

// Mock ride data for simulation (matches what dashboard sends)
const MOCK_INCOMING_RIDE: Ride = {
  id: "ride_incoming_001",
  riderId: "rider_mock_002",
  status: "requested",
  pickup: {
    lat: 37.7849,
    lng: -122.4094,
    address: "456 Market Street, San Francisco, CA",
  },
  destination: {
    lat: 37.7599,
    lng: -122.4148,
    address: "1234 Mission Street, San Francisco, CA",
  },
  rideType: "standard",
  fareEstimate: 14.5,
  distanceKm: 3.2,
  durationMinutes: 12,
  requestedAt: new Date().toISOString(),
};

// Driver info for the current driver (self)
const CURRENT_DRIVER: DriverInfo = {
  id: "driver_self_001",
  fullName: "You",
  rating: 4.95,
  totalRides: 523,
  vehicleMake: "Honda",
  vehicleModel: "Civic",
  vehicleColor: "Black",
  licensePlate: "XYZ 5678",
  currentLat: 37.7749,
  currentLng: -122.4194,
};

export default function IncomingRide() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setOnline, setIncomingRide, incomingRideId, setTodayEarnings, todayEarnings, setTodayRides, todayRides } = useDriver();
  const { setCurrentRide, setDriver } = useRide();
  const { setPickup, setDestination } = useLocation();

  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_SECONDS);
  const [ride] = useState<Ride>(MOCK_INCOMING_RIDE);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasResponded = useRef(false);

  // Start countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer expired — auto-reject
          if (!hasResponded.current) {
            hasResponded.current = true;
            handleReject();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const handleAccept = useCallback(() => {
    if (hasResponded.current) return;
    hasResponded.current = true;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Set up the ride in the ride store
    const acceptedRide: Ride = {
      ...ride,
      status: "matched",
      driverId: CURRENT_DRIVER.id,
      matchedAt: new Date().toISOString(),
    };

    setCurrentRide(acceptedRide);
    setDriver(CURRENT_DRIVER);

    // Set locations for the map
    setPickup(ride.pickup);
    setDestination(ride.destination);

    // Clear incoming ride
    setIncomingRide(null);

    // Navigate to active ride
    router.replace("/(driver)/ride/active");
  }, [ride, setCurrentRide, setDriver, setPickup, setDestination, setIncomingRide, router]);

  const handleReject = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Clear incoming ride and go back to dashboard
    setIncomingRide(null);
    router.replace("/(driver)");
  }, [setIncomingRide, router]);

  // If no incoming ride ID, redirect to dashboard
  if (!incomingRideId) {
    return (
      <View className="flex-1 bg-white items-center justify-center" style={{ paddingTop: insets.top }}>
        <Text className="text-gray-500 text-base mb-4">No incoming ride request</Text>
        <Pressable
          onPress={() => router.replace("/(driver)")}
          className="bg-black rounded-full px-6 py-3"
        >
          <Text className="text-white font-semibold">Back to Dashboard</Text>
        </Pressable>
      </View>
    );
  }

  // Timer color based on time remaining
  const timerColor = timeLeft <= 5 ? "text-red-500" : timeLeft <= 10 ? "text-yellow-500" : "text-green-500";
  const timerBgColor = timeLeft <= 5 ? "bg-red-50" : timeLeft <= 10 ? "bg-yellow-50" : "bg-green-50";

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="items-center px-4 py-4">
        <View className="flex-row items-center mb-2">
          <View className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse" />
          <Text className="text-xl font-bold text-gray-900">New Ride Request</Text>
        </View>
        <Text className="text-sm text-gray-500">Respond before the timer runs out</Text>
      </View>

      {/* Countdown Timer */}
      <View className="items-center mb-6">
        <View className={`w-28 h-28 rounded-full ${timerBgColor} items-center justify-center border-4 ${
          timeLeft <= 5 ? "border-red-300" : timeLeft <= 10 ? "border-yellow-300" : "border-green-300"
        }`}>
          <Text className={`text-4xl font-bold ${timerColor}`}>
            {timeLeft}
          </Text>
          <Text className="text-xs text-gray-500 mt-1">seconds</Text>
        </View>
        {/* Progress bar */}
        <View className="w-48 h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
          <View
            className={`h-full rounded-full ${
              timeLeft <= 5 ? "bg-red-500" : timeLeft <= 10 ? "bg-yellow-500" : "bg-green-500"
            }`}
            style={{ width: `${(timeLeft / COUNTDOWN_SECONDS) * 100}%` }}
          />
        </View>
      </View>

      {/* Ride Details Card */}
      <View className="mx-6 bg-gray-50 rounded-2xl p-5 mb-4">
        <Text className="text-xs font-semibold text-gray-400 uppercase mb-4">Trip Details</Text>

        {/* Route */}
        <View className="mb-4">
          <View className="flex-row items-center mb-2">
            <View className="w-3 h-3 bg-gray-800 rounded-full mr-3" />
            <View className="flex-1">
              <Text className="text-xs text-gray-400 uppercase">Pickup</Text>
              <Text className="text-sm font-medium text-gray-900 mt-0.5" numberOfLines={2}>
                {ride.pickup.address}
              </Text>
            </View>
          </View>
          <View className="w-0.5 h-4 bg-gray-300 ml-1.5 mb-2" />
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-blue-500 rounded-full mr-3" />
            <View className="flex-1">
              <Text className="text-xs text-gray-400 uppercase">Destination</Text>
              <Text className="text-sm font-medium text-gray-900 mt-0.5" numberOfLines={2}>
                {ride.destination.address}
              </Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View className="h-px bg-gray-200 mb-4" />

        {/* Fare and distance */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-gray-400 uppercase">Distance</Text>
            <Text className="text-lg font-bold text-gray-900 mt-0.5">
              {ride.distanceKm ? formatDistance(ride.distanceKm) : "N/A"}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-xs text-gray-400 uppercase">Duration</Text>
            <Text className="text-lg font-bold text-gray-900 mt-0.5">
              ~{ride.durationMinutes ?? "?"} min
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-gray-400 uppercase">Fare</Text>
            <Text className="text-2xl font-bold text-gray-900 mt-0.5">
              ${ride.fareEstimate?.toFixed(2) ?? "0.00"}
            </Text>
          </View>
        </View>
      </View>

      {/* Rider info placeholder */}
      <View className="mx-6 bg-white border border-gray-200 rounded-2xl p-4 mb-6">
        <Text className="text-xs font-semibold text-gray-400 uppercase mb-2">Rider</Text>
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center mr-3">
            <Text className="text-lg font-bold text-gray-600">A</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">Alex M.</Text>
            <Text className="text-sm text-gray-500">4.8 rating</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="px-6 pb-6" style={{ paddingBottom: insets.bottom + 24 }}>
        <View className="flex-row gap-3">
          {/* Reject Button */}
          <Pressable
            onPress={handleReject}
            className="flex-1 bg-white border-2 border-red-300 rounded-full py-4 items-center justify-center active:opacity-80"
          >
            <Text className="text-red-500 text-lg font-semibold">Reject</Text>
          </Pressable>

          {/* Accept Button */}
          <Pressable
            onPress={handleAccept}
            className="flex-1 bg-green-500 rounded-full py-4 items-center justify-center active:opacity-80"
          >
            <Text className="text-white text-lg font-semibold">Accept</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
