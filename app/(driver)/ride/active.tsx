import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRide } from "../../../store/useRide";
import { useDriver } from "../../../store/useDriver";
import { useLocation } from "../../../store/useLocation";
import { formatDistance } from "../../../lib/location";
import { RIDE_TYPES } from "../../../lib/constants";
import RideMap from "../../../components/map/RideMap";
import type { RideStatus } from "../../../types/ride";

export default function DriverActiveRide() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentRide, driver, setCurrentRide } = useRide();
  const { setOnline, setTodayEarnings, todayEarnings, setTodayRides, todayRides } = useDriver();
  const { pickup, destination } = useLocation();

  const [rideStatus, setRideStatus] = useState<RideStatus>("matched");
  const [showEarnings, setShowEarnings] = useState(false);
  const [driverPosition, setDriverPosition] = useState<{ lat: number; lng: number } | null>(null);
  const driverSimRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize driver position near pickup
  useEffect(() => {
    if (!pickup) return;

    // Start the driver ~0.01 degrees away from pickup
    const angle = Math.random() * 2 * Math.PI;
    const offset = 0.01;
    const startLat = pickup.lat + offset * Math.sin(angle);
    const startLng = pickup.lng + offset * Math.cos(angle);

    setDriverPosition({ lat: startLat, lng: startLng });
  }, [pickup?.lat, pickup?.lng]);

  // Simulate driver movement toward pickup (matched) then destination (in_progress)
  useEffect(() => {
    if (!driverPosition) return;

    // Clear any existing interval
    if (driverSimRef.current) {
      clearInterval(driverSimRef.current);
      driverSimRef.current = null;
    }

    // Determine target based on status
    let target: { lat: number; lng: number } | null = null;
    if (rideStatus === "matched" && pickup) {
      target = pickup;
    } else if (rideStatus === "in_progress" && destination) {
      target = destination;
    }

    if (!target) return;

    // Move driver toward target every 2 seconds, covering 15% of remaining distance each tick
    driverSimRef.current = setInterval(() => {
      setDriverPosition((prev) => {
        if (!prev) return prev;

        const newLat = prev.lat + (target!.lat - prev.lat) * 0.15;
        const newLng = prev.lng + (target!.lng - prev.lng) * 0.15;

        // Snap to target if very close
        const distLat = Math.abs(target!.lat - newLat);
        const distLng = Math.abs(target!.lng - newLng);
        if (distLat < 0.00005 && distLng < 0.00005) {
          return { lat: target!.lat, lng: target!.lng };
        }

        return { lat: newLat, lng: newLng };
      });
    }, 2000);

    return () => {
      if (driverSimRef.current) {
        clearInterval(driverSimRef.current);
        driverSimRef.current = null;
      }
    };
  }, [rideStatus, driverPosition?.lat, driverPosition?.lng, pickup?.lat, pickup?.lng, destination?.lat, destination?.lng]);

  const handleArrivedAtPickup = useCallback(() => {
    setRideStatus("in_progress");
    if (currentRide) {
      setCurrentRide({
        ...currentRide,
        status: "in_progress",
        startedAt: new Date().toISOString(),
      });
    }
  }, [currentRide, setCurrentRide]);

  const handleCompleteRide = useCallback(() => {
    setRideStatus("completed");

    const finalFare = currentRide?.fareEstimate
      ? currentRide.fareEstimate + (Math.random() - 0.5) * 2
      : 0;

    if (currentRide) {
      setCurrentRide({
        ...currentRide,
        status: "completed",
        fareFinal: Math.round(finalFare * 100) / 100,
        completedAt: new Date().toISOString(),
      });
    }

    // Update driver earnings
    setTodayEarnings(todayEarnings + Math.round(finalFare * 100) / 100);
    setTodayRides(todayRides + 1);

    setShowEarnings(true);
  }, [currentRide, setCurrentRide, setTodayEarnings, todayEarnings, setTodayRides, todayRides]);

  const handleBackToDashboard = useCallback(() => {
    // Clear ride and return to dashboard
    useRide.getState().clearRide();
    // Clear pickup/destination locations
    useLocation.getState().clearLocations();
    // Keep driver online
    router.replace("/(driver)");
  }, [router]);

  const handleGoOffline = useCallback(() => {
    useRide.getState().clearRide();
    useLocation.getState().clearLocations();
    setOnline(false);
    router.replace("/(driver)");
  }, [setOnline, router]);

  // Redirect if no current ride
  if (!currentRide) {
    return (
      <View className="flex-1 bg-white items-center justify-center" style={{ paddingTop: insets.top }}>
        <Text className="text-gray-500 text-base mb-4">No ride in progress</Text>
        <Pressable
          onPress={() => router.replace("/(driver)")}
          className="bg-black rounded-full px-6 py-3"
        >
          <Text className="text-white font-semibold">Back to Dashboard</Text>
        </Pressable>
      </View>
    );
  }

  const rideTypeInfo = RIDE_TYPES.find((rt) => rt.id === currentRide.rideType);

  // Earnings summary after ride completion
  if (showEarnings) {
    const earned = currentRide.fareFinal ?? currentRide.fareEstimate ?? 0;
    return (
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        {/* Success header */}
        <View className="items-center pt-8 pb-6">
          <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-4">
            <Text className="text-5xl text-green-600">&#10003;</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-1">Ride Completed!</Text>
          <Text className="text-base text-gray-500">Great job, driver</Text>
        </View>

        {/* Earnings card */}
        <View className="mx-6 bg-gray-50 rounded-2xl p-5 mb-6">
          <Text className="text-xs font-semibold text-gray-400 uppercase mb-4">Earnings</Text>

          <View className="items-center mb-4">
            <Text className="text-5xl font-bold text-green-600">
              ${earned.toFixed(2)}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">earned this ride</Text>
          </View>

          <View className="h-px bg-gray-200 mb-4" />

          {/* Trip details */}
          <View className="mb-3">
            <View className="flex-row items-center mb-2">
              <View className="w-2.5 h-2.5 bg-gray-800 rounded-full mr-3" />
              <Text className="text-sm text-gray-900 flex-1" numberOfLines={1}>
                {currentRide.pickup.address}
              </Text>
            </View>
            <View className="w-0.5 h-3 bg-gray-300 ml-1 mb-2" />
            <View className="flex-row items-center">
              <View className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-3" />
              <Text className="text-sm text-gray-900 flex-1" numberOfLines={1}>
                {currentRide.destination.address}
              </Text>
            </View>
          </View>

          <View className="h-px bg-gray-200 my-3" />

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-lg mr-2">{rideTypeInfo?.icon ?? "\u{1F697}"}</Text>
              <Text className="text-sm font-medium text-gray-900">{rideTypeInfo?.name ?? "Ride"}</Text>
            </View>
            <Text className="text-sm text-gray-500">
              {currentRide.distanceKm ? formatDistance(currentRide.distanceKm) : ""}{" "}
              {currentRide.durationMinutes ? `\u00b7 ~${currentRide.durationMinutes} min` : ""}
            </Text>
          </View>

          <View className="h-px bg-gray-200 my-3" />

          {/* Daily totals */}
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-500">Today's total</Text>
            <Text className="text-lg font-bold text-gray-900">
              ${(todayEarnings).toFixed(2)} ({todayRides} rides)
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <View className="px-6 pb-6" style={{ paddingBottom: insets.bottom + 24 }}>
          <Pressable
            onPress={handleBackToDashboard}
            className="bg-black rounded-full py-4 items-center justify-center active:opacity-80 mb-3"
          >
            <Text className="text-white text-lg font-semibold">Continue Driving</Text>
          </Pressable>
          <Pressable
            onPress={handleGoOffline}
            className="bg-white border-2 border-gray-300 rounded-full py-4 items-center justify-center active:opacity-80"
          >
            <Text className="text-gray-700 text-lg font-semibold">Go Offline</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Active ride view
  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={handleBackToDashboard} className="w-10 h-10 items-center justify-center" hitSlop={8}>
          <Text className="text-2xl text-gray-800">&larr;</Text>
        </Pressable>
        <View className="flex-1 ml-3">
          <Text className="text-xl font-bold text-gray-900">
            {rideStatus === "matched" && "Heading to Pickup"}
            {rideStatus === "in_progress" && "Ride in Progress"}
          </Text>
          <Text className="text-sm text-gray-500">
            {rideStatus === "matched" && "Navigate to the pickup location"}
            {rideStatus === "in_progress" && "Taking rider to destination"}
          </Text>
        </View>
      </View>

      {/* Map */}
      <View className="mx-4 h-64 rounded-2xl overflow-hidden mb-4">
        <RideMap
          showPickup={true}
          showDestination={rideStatus === "in_progress"}
          showMyLocationButton={true}
          driverPosition={driverPosition ?? undefined}
          rideStatus={rideStatus === "matched" ? "driver_arriving" : rideStatus}
        />
      </View>

      {/* Status indicator */}
      <View className="mx-6 mb-4">
        <View className="flex-row items-center">
          {/* Matched step */}
          <View className={`flex-1 h-1.5 rounded-full ${rideStatus === "matched" || rideStatus === "in_progress" ? "bg-green-500" : "bg-gray-200"}`} />
          <View className={`w-4 h-4 rounded-full mx-1 ${rideStatus === "matched" ? "bg-green-500" : rideStatus === "in_progress" ? "bg-green-500" : "bg-gray-300"}`} />
          {/* In progress step */}
          <View className={`flex-1 h-1.5 rounded-full ${rideStatus === "in_progress" ? "bg-blue-500" : "bg-gray-200"}`} />
          <View className={`w-4 h-4 rounded-full mx-1 ${rideStatus === "in_progress" ? "bg-blue-500" : "bg-gray-300"}`} />
          {/* Completed step */}
          <View className="flex-1 h-1.5 rounded-full bg-gray-200" />
        </View>
        <View className="flex-row justify-between mt-1">
          <Text className="text-xs text-gray-500">Pickup</Text>
          <Text className="text-xs text-gray-500">Dropoff</Text>
        </View>
      </View>

      {/* Trip details */}
      <View className="mx-6 bg-gray-50 rounded-2xl p-4 mb-4">
        <View className="mb-3">
          <View className="flex-row items-center mb-2">
            <View className="w-2.5 h-2.5 bg-gray-800 rounded-full mr-3" />
            <Text className="text-sm text-gray-900 flex-1" numberOfLines={1}>
              {currentRide.pickup.address}
            </Text>
          </View>
          <View className="w-0.5 h-3 bg-gray-300 ml-1 mb-2" />
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-3" />
            <Text className="text-sm text-gray-900 flex-1" numberOfLines={1}>
              {currentRide.destination.address}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between pt-3 border-t border-gray-200">
          <View className="flex-row items-center">
            <Text className="text-lg mr-2">{rideTypeInfo?.icon ?? "\u{1F697}"}</Text>
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

      {/* Action buttons */}
      <View className="px-6 pb-6" style={{ paddingBottom: insets.bottom + 24 }}>
        {rideStatus === "matched" && (
          <Pressable
            onPress={handleArrivedAtPickup}
            className="bg-green-500 rounded-full py-4 items-center justify-center active:opacity-80"
          >
            <Text className="text-white text-lg font-semibold">Arrived at Pickup</Text>
          </Pressable>
        )}

        {rideStatus === "in_progress" && (
          <Pressable
            onPress={handleCompleteRide}
            className="bg-blue-500 rounded-full py-4 items-center justify-center active:opacity-80"
          >
            <Text className="text-white text-lg font-semibold">Complete Ride</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
