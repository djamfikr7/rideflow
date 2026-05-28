import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRide } from "../../../store/useRide";
import { useLocation } from "../../../store/useLocation";
import { RIDE_TYPES } from "../../../lib/constants";
import { formatDistance } from "../../../lib/location";
import RideMap from "../../../components/map/RideMap";
import DriverInfoCard from "../../../components/ride/DriverInfoCard";
import type { RideStatus } from "../../../types/ride";

const STATUS_LABELS: Record<RideStatus, string> = {
  requested: "Requested",
  matched: "Driver Assigned",
  driver_arriving: "Driver Arriving",
  in_progress: "Ride In Progress",
  completed: "Ride Completed",
  cancelled: "Cancelled",
};

const STATUS_STEPS: { status: RideStatus; label: string }[] = [
  { status: "matched", label: "Driver Assigned" },
  { status: "driver_arriving", label: "Driver Arriving" },
  { status: "in_progress", label: "In Progress" },
  { status: "completed", label: "Completed" },
];

export default function ActiveRide() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentRide, driver } = useRide();
  const { pickup, destination } = useLocation();

  const [rideStatus, setRideStatus] = useState<RideStatus>("matched");
  const [driverPosition, setDriverPosition] = useState<{ lat: number; lng: number } | null>(null);
  const driverSimRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize driver position at an offset from pickup when driver is assigned
  useEffect(() => {
    if (!driver || !pickup) return;

    // Start the driver ~0.01 degrees away (roughly 1km) at a random angle
    const angle = Math.random() * 2 * Math.PI;
    const offset = 0.01;
    const startLat = pickup.lat + offset * Math.sin(angle);
    const startLng = pickup.lng + offset * Math.cos(angle);

    setDriverPosition({ lat: startLat, lng: startLng });
    // Sync initial position to store
    useRide.getState().updateDriverLocation(startLat, startLng);
  }, [driver?.id, pickup?.lat, pickup?.lng]);

  // Simulate driver movement toward pickup (driver_arriving) then toward destination (in_progress)
  useEffect(() => {
    if (!driverPosition) return;

    // Clear any existing interval
    if (driverSimRef.current) {
      clearInterval(driverSimRef.current);
      driverSimRef.current = null;
    }

    // Determine target based on status
    let target: { lat: number; lng: number } | null = null;
    if (rideStatus === "driver_arriving" && pickup) {
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
          useRide.getState().updateDriverLocation(target!.lat, target!.lng);
          return { lat: target!.lat, lng: target!.lng };
        }

        useRide.getState().updateDriverLocation(newLat, newLng);
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

  // Simulate ride status progression
  useEffect(() => {
    if (!currentRide) return;

    // Progress through statuses automatically for demo
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(
      setTimeout(() => setRideStatus("driver_arriving"), 3000),
      setTimeout(() => setRideStatus("in_progress"), 8000),
      setTimeout(() => {
        setRideStatus("completed");
        // Set final fare (slight variation from estimate for realism)
        const finalFare = currentRide.fareEstimate
          ? currentRide.fareEstimate + (Math.random() - 0.5) * 2
          : undefined;
        useRide.getState().setCurrentRide({
          ...currentRide,
          status: "completed",
          fareFinal: finalFare ? Math.round(finalFare * 100) / 100 : undefined,
          completedAt: new Date().toISOString(),
        });
      }, 15000)
    );

    return () => timers.forEach(clearTimeout);
  }, [currentRide]);

  const handleCancel = () => {
    useRide.getState().clearRide();
    router.replace("/(rider)/ride/request");
  };

  const handleRate = () => {
    router.push("/(rider)/ride/complete");
  };

  const rideTypeInfo = currentRide
    ? RIDE_TYPES.find((rt) => rt.id === currentRide.rideType)
    : null;

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.status === rideStatus);

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
          {STATUS_LABELS[rideStatus]}
        </Text>
      </View>

      {/* Map with real-time driver tracking */}
      <View className="mx-4 h-64 rounded-2xl overflow-hidden mb-4">
        <RideMap
          showPickup={true}
          showDestination={rideStatus === "in_progress" || rideStatus === "completed"}
          showMyLocationButton={false}
          driverPosition={driverPosition ?? undefined}
          rideStatus={rideStatus}
        />
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 16 }}>
        {/* Status stepper */}
        <View className="mb-5">
          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isPending = idx > currentStepIndex;

            return (
              <View key={step.status} className="flex-row items-start mb-1">
                {/* Vertical line + dot */}
                <View className="items-center mr-3">
                  <View
                    className={`w-3 h-3 rounded-full ${
                      isCompleted ? "bg-green-500" : isCurrent ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  />
                  {idx < STATUS_STEPS.length - 1 && (
                    <View className={`w-0.5 h-8 ${isCompleted ? "bg-green-300" : "bg-gray-200"}`} />
                  )}
                </View>
                <View className="pt-0.5">
                  <Text
                    className={`text-sm font-medium ${
                      isCurrent ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Driver info card with contact buttons */}
        {driver && (
          <DriverInfoCard
            driver={driver}
            onCall={() => Alert.alert("Call Driver", "Phone feature coming soon")}
            onMessage={() => Alert.alert("Message Driver", "Messaging feature coming soon")}
          />
        )}

        {/* Route & fare card */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-4">
          <Text className="text-xs font-semibold text-gray-400 uppercase mb-3">Trip Details</Text>
          <View className="flex-row items-center mb-2">
            <View className="w-2.5 h-2.5 bg-gray-800 rounded-full mr-3" />
            <Text className="text-sm text-gray-900 flex-1" numberOfLines={1}>
              {currentRide.pickup.address}
            </Text>
          </View>
          <View className="w-0.5 h-3 bg-gray-300 ml-1 mb-2" />
          <View className="flex-row items-center mb-3">
            <View className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-3" />
            <Text className="text-sm text-gray-900 flex-1" numberOfLines={1}>
              {currentRide.destination.address}
            </Text>
          </View>
          <View className="flex-row items-center justify-between pt-3 border-t border-gray-200">
            <View className="flex-row items-center">
              <Text className="text-lg mr-2">{rideTypeInfo?.icon ?? "🚗"}</Text>
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
      </ScrollView>

      {/* Bottom button */}
      <View className="px-6 pb-6" style={{ paddingBottom: insets.bottom + 24 }}>
        {rideStatus === "completed" ? (
          <Pressable
            onPress={handleRate}
            className="bg-black rounded-full py-4 items-center justify-center active:opacity-80"
          >
            <Text className="text-white text-lg font-semibold">Rate Your Ride</Text>
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
