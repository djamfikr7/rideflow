import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRide } from "../../../store/useRide";
import { RIDE_TYPES } from "../../../lib/constants";
import { formatDistance } from "../../../lib/location";
import type { DriverInfo } from "../../../types/ride";

// Mock driver data for simulation
const MOCK_DRIVER: DriverInfo = {
  id: "driver_mock_001",
  fullName: "Marcus Johnson",
  rating: 4.92,
  totalRides: 1247,
  vehicleMake: "Toyota",
  vehicleModel: "Camry",
  vehicleColor: "Silver",
  licensePlate: "ABC 1234",
  currentLat: 0,
  currentLng: 0,
};

export default function RideMatching() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentRide, isMatching, setIsMatching, setDriver, clearRide } = useRide();

  const [dots, setDots] = useState("");
  const [matched, setMatched] = useState(false);
  const pulseAnim = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dotTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animated dots for "Searching for drivers..."
  useEffect(() => {
    dotTimerRef.current = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => {
      if (dotTimerRef.current) clearInterval(dotTimerRef.current);
    };
  }, []);

  // Simulate matching after 3-5 seconds
  useEffect(() => {
    const delay = 3000 + Math.random() * 2000; // 3-5 seconds
    timerRef.current = setTimeout(() => {
      setMatched(true);
      setIsMatching(false);
      setDriver(MOCK_DRIVER);

      if (currentRide) {
        useRide.getState().setCurrentRide({
          ...currentRide,
          status: "matched",
          driverId: MOCK_DRIVER.id,
          matchedAt: new Date().toISOString(),
        });
      }
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Pulse animation counter (simple counter for opacity cycling)
  useEffect(() => {
    if (matched) return;
    const interval = setInterval(() => {
      pulseAnim.current = (pulseAnim.current + 1) % 60;
      // Force re-render via state is expensive; we use a different approach below
    }, 50);
    return () => clearInterval(interval);
  }, [matched]);

  const handleCancel = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    clearRide();
    router.replace("/(rider)/ride/request");
  };

  const handleViewRide = () => {
    router.replace("/(rider)/ride/active");
  };

  const rideTypeInfo = currentRide
    ? RIDE_TYPES.find((rt) => rt.id === currentRide.rideType)
    : null;

  // Redirect if no current ride
  if (!currentRide) {
    return (
      <View className="flex-1 bg-white items-center justify-center" style={{ paddingTop: insets.top }}>
        <Text className="text-gray-500 text-base mb-4">No ride in progress</Text>
        <Pressable
          onPress={() => router.replace("/(rider)/ride/request")}
          className="bg-black rounded-full px-6 py-3"
        >
          <Text className="text-white font-semibold">Request a Ride</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={handleCancel} className="w-10 h-10 items-center justify-center" hitSlop={8}>
          <Text className="text-2xl text-gray-800">&larr;</Text>
        </Pressable>
        <Text className="text-xl font-bold text-gray-900 ml-3">
          {matched ? "Driver Found" : "Finding Your Ride"}
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        {/* Pulsing circle animation */}
        {!matched && (
          <View className="items-center mb-8">
            <PulsingCircle />
            <Text className="text-lg font-semibold text-gray-900 mt-6">
              Searching for drivers{dots}
            </Text>
            <Text className="text-sm text-gray-500 mt-2 text-center">
              This usually takes less than a minute
            </Text>
          </View>
        )}

        {/* Driver matched */}
        {matched && (
          <View className="items-center mb-8">
            <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-4">
              <Text className="text-5xl">&#10003;</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-1">Driver Found!</Text>
            <Text className="text-sm text-gray-500">Your driver is on the way</Text>
          </View>
        )}

        {/* Route summary card */}
        <View className="w-full bg-gray-50 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center mb-3">
            <View className="w-3 h-3 bg-gray-800 rounded-full mr-3" />
            <Text className="text-sm text-gray-900 flex-1" numberOfLines={1}>
              {currentRide.pickup.address}
            </Text>
          </View>
          <View className="w-0.5 h-4 bg-gray-300 ml-1.5 mb-3" />
          <View className="flex-row items-center mb-3">
            <View className="w-3 h-3 bg-blue-500 rounded-full mr-3" />
            <Text className="text-sm text-gray-900 flex-1" numberOfLines={1}>
              {currentRide.destination.address}
            </Text>
          </View>

          {/* Ride type & fare */}
          <View className="flex-row items-center justify-between mt-2 pt-3 border-t border-gray-200">
            <View className="flex-row items-center">
              <Text className="text-xl mr-2">{rideTypeInfo?.icon ?? "🚗"}</Text>
              <View>
                <Text className="text-sm font-semibold text-gray-900">{rideTypeInfo?.name ?? "Ride"}</Text>
                <Text className="text-xs text-gray-500">
                  {currentRide.distanceKm ? formatDistance(currentRide.distanceKm) : ""}{" "}
                  {currentRide.durationMinutes ? `~${currentRide.durationMinutes} min` : ""}
                </Text>
              </View>
            </View>
            <Text className="text-xl font-bold text-gray-900">
              ${currentRide.fareEstimate?.toFixed(2) ?? "0.00"}
            </Text>
          </View>
        </View>

        {/* Driver info (shown after match) */}
        {matched && (
          <View className="w-full bg-white border border-gray-200 rounded-2xl p-4 mb-4">
            <Text className="text-xs font-semibold text-gray-400 uppercase mb-3">Your Driver</Text>
            <View className="flex-row items-center">
              <View className="w-14 h-14 bg-gray-200 rounded-full items-center justify-center mr-4">
                <Text className="text-2xl font-bold text-gray-600">
                  {MOCK_DRIVER.fullName.charAt(0)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900">{MOCK_DRIVER.fullName}</Text>
                <Text className="text-sm text-gray-500">
                  {MOCK_DRIVER.rating.toFixed(2)} rating &middot; {MOCK_DRIVER.totalRides} rides
                </Text>
              </View>
            </View>
            <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
              <View className="flex-1">
                <Text className="text-xs text-gray-400 uppercase">Vehicle</Text>
                <Text className="text-sm font-medium text-gray-900 mt-0.5">
                  {MOCK_DRIVER.vehicleColor} {MOCK_DRIVER.vehicleMake} {MOCK_DRIVER.vehicleModel}
                </Text>
              </View>
              <View>
                <Text className="text-xs text-gray-400 uppercase">Plate</Text>
                <Text className="text-sm font-medium text-gray-900 mt-0.5">{MOCK_DRIVER.licensePlate}</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Bottom buttons */}
      <View className="px-6 pb-6" style={{ paddingBottom: insets.bottom + 24 }}>
        {matched ? (
          <Pressable
            onPress={handleViewRide}
            className="bg-black rounded-full py-4 items-center justify-center active:opacity-80"
          >
            <Text className="text-white text-lg font-semibold">View Ride Details</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleCancel}
            className="bg-white border-2 border-gray-300 rounded-full py-4 items-center justify-center active:opacity-80"
          >
            <Text className="text-gray-700 text-lg font-semibold">Cancel Ride</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

/** Simple pulsing circle using opacity animation via interval-driven state */
function PulsingCircle() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setScale((prev) => (prev >= 1.3 ? 1 : prev + 0.015));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <View className="relative items-center justify-center">
      {/* Outer pulse ring */}
      <View
        className="absolute w-32 h-32 rounded-full bg-blue-100"
        style={{ opacity: 0.3 + (1.3 - scale) * 1.5, transform: [{ scale }] }}
      />
      {/* Middle pulse ring */}
      <View
        className="absolute w-24 h-24 rounded-full bg-blue-200"
        style={{ opacity: 0.4 + (1.3 - scale) * 1.2, transform: [{ scale: 1 + (scale - 1) * 0.6 }] }}
      />
      {/* Center icon */}
      <View className="w-16 h-16 bg-blue-500 rounded-full items-center justify-center z-10">
        <Text className="text-3xl text-white">&#128663;</Text>
      </View>
    </View>
  );
}
