import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMemo } from "react";
import { useHistory } from "../../../store/useHistory";
import { RIDE_TYPES, BASE_FARE, PER_KM_RATE, PER_MINUTE_RATE } from "../../../lib/constants";
import { formatDistance } from "../../../lib/location";
import type { RideType, RideStatus } from "../../../types/ride";

const STATUS_LABELS: Record<RideStatus, string> = {
  requested: "Requested",
  matched: "Matched",
  driver_arriving: "Driver Arriving",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

function getRideTypeInfo(rideType: RideType) {
  return RIDE_TYPES.find((rt) => rt.id === rideType) ?? RIDE_TYPES[0];
}

function formatFullDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Mock driver data for completed rides
const MOCK_DRIVERS: Record<string, { name: string; rating: number }> = {
  "driver-001": { name: "Marcus Johnson", rating: 5 },
  "driver-002": { name: "Sarah Chen", rating: 4 },
  "driver-003": { name: "David Kim", rating: 5 },
};

export default function RideReceipt() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getRideById } = useHistory();

  const ride = id ? getRideById(id) : undefined;

  const rideTypeInfo = useMemo(
    () => (ride ? getRideTypeInfo(ride.rideType) : RIDE_TYPES[0]),
    [ride]
  );

  const driver = ride?.driverId ? MOCK_DRIVERS[ride.driverId] : undefined;
  const isCompleted = ride?.status === "completed";
  const isCancelled = ride?.status === "cancelled";
  const fare = ride?.fareFinal ?? ride?.fareEstimate ?? 0;

  // Fare breakdown
  const fareBreakdown = useMemo(() => {
    if (!ride) return null;
    const distance = ride.distanceKm ?? 0;
    const duration = ride.durationMinutes ?? 0;
    const multiplier = rideTypeInfo.multiplier;

    const distanceFare = distance * PER_KM_RATE * multiplier;
    const timeFare = duration * PER_MINUTE_RATE;
    const baseFare = BASE_FARE;
    const subtotal = baseFare + distanceFare + timeFare;

    return {
      base: baseFare,
      distance: distanceFare,
      time: timeFare,
      subtotal,
      final: fare,
      adjustment: fare - subtotal,
    };
  }, [ride, rideTypeInfo, fare]);

  // Not found state
  if (!ride) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-8" style={{ paddingTop: insets.top }}>
        <Text className="text-5xl mb-4">{"\u{1F50D}"}</Text>
        <Text className="text-xl font-bold text-gray-900 mb-2">Ride not found</Text>
        <Text className="text-gray-500 text-center mb-6">
          This ride could not be located in your history.
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-black rounded-full px-6 py-3"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-2">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Text className="text-2xl">{"\u2190"}</Text>
          </Pressable>
          <Text className="text-xl font-bold text-gray-900 flex-1">Receipt</Text>
          <View
            className={`px-3 py-1 rounded-full ${
              isCompleted ? "bg-green-100" : isCancelled ? "bg-red-100" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                isCompleted ? "text-green-700" : isCancelled ? "text-red-700" : "text-gray-700"
              }`}
            >
              {STATUS_LABELS[ride.status]}
            </Text>
          </View>
        </View>

        {/* Receipt Card */}
        <View className="mx-5 mt-4 bg-gray-50 rounded-2xl p-5">
          {/* Date */}
          <Text className="text-xs font-semibold text-gray-400 uppercase mb-4">
            {formatFullDate(ride.requestedAt)}
          </Text>

          {/* Route */}
          <View className="mb-5">
            <View className="flex-row items-center mb-2">
              <View className="w-3 h-3 bg-gray-800 rounded-full mr-3 items-center justify-center">
                <View className="w-1 h-1 bg-white rounded-full" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-400 mb-0.5">Pickup</Text>
                <Text className="text-sm text-gray-900" numberOfLines={2}>
                  {ride.pickup.address}
                </Text>
              </View>
            </View>
            <View className="w-0.5 h-4 bg-gray-300 ml-1.25 mb-2" />
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-blue-500 rounded-full mr-3 items-center justify-center">
                <View className="w-1 h-1 bg-white rounded-full" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-400 mb-0.5">Destination</Text>
                <Text className="text-sm text-gray-900" numberOfLines={2}>
                  {ride.destination.address}
                </Text>
              </View>
            </View>
          </View>

          {/* Divider */}
          <View className="h-px bg-gray-200 mb-5" />

          {/* Ride type */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Text className="text-xl mr-2.5">{rideTypeInfo.icon}</Text>
              <View>
                <Text className="text-sm font-semibold text-gray-900">{rideTypeInfo.name}</Text>
                <Text className="text-xs text-gray-400">{rideTypeInfo.description}</Text>
              </View>
            </View>
            <Text className="text-sm text-gray-500">
              {ride.distanceKm ? formatDistance(ride.distanceKm) : ""}
              {ride.durationMinutes ? ` \u00b7 ${ride.durationMinutes} min` : ""}
            </Text>
          </View>

          {/* Driver info (completed rides) */}
          {driver && isCompleted && (
            <>
              <View className="h-px bg-gray-200 mb-4" />
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-sm text-gray-500">Driver</Text>
                <View className="flex-row items-center">
                  <Text className="text-sm font-medium text-gray-900 mr-2">{driver.name}</Text>
                  <Text className="text-xs text-yellow-500">
                    {"\u2605"} {driver.rating.toFixed(1)}
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Cancellation reason */}
          {isCancelled && ride.cancellationReason && (
            <>
              <View className="h-px bg-gray-200 mb-4" />
              <View className="mb-4">
                <Text className="text-sm text-gray-500 mb-1">Cancellation reason</Text>
                <Text className="text-sm text-gray-900">{ride.cancellationReason}</Text>
              </View>
            </>
          )}

          {/* Fare breakdown (completed rides) */}
          {fareBreakdown && isCompleted && (
            <>
              <View className="h-px bg-gray-200 mb-4" />
              <Text className="text-xs font-semibold text-gray-400 uppercase mb-3">
                Fare Breakdown
              </Text>
              <View className="gap-y-2 mb-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-500">Base fare</Text>
                  <Text className="text-sm text-gray-900">${fareBreakdown.base.toFixed(2)}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-500">
                    Distance ({ride.distanceKm ? formatDistance(ride.distanceKm) : "0 km"})
                  </Text>
                  <Text className="text-sm text-gray-900">
                    ${fareBreakdown.distance.toFixed(2)}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-500">
                    Time ({ride.durationMinutes ?? 0} min)
                  </Text>
                  <Text className="text-sm text-gray-900">${fareBreakdown.time.toFixed(2)}</Text>
                </View>
                {Math.abs(fareBreakdown.adjustment) > 0.01 && (
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-gray-500">Adjustment</Text>
                    <Text
                      className={`text-sm ${
                        fareBreakdown.adjustment >= 0 ? "text-gray-900" : "text-green-600"
                      }`}
                    >
                      {fareBreakdown.adjustment >= 0 ? "+" : "-"}$
                      {Math.abs(fareBreakdown.adjustment).toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}

          {/* Divider */}
          <View className="h-px bg-gray-200 mb-4" />

          {/* Total */}
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-gray-900">Total</Text>
            <Text className="text-2xl font-bold text-gray-900">
              ${fare.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Done button */}
      <View className="px-6 pb-6" style={{ paddingBottom: insets.bottom + 24 }}>
        <Pressable
          onPress={() => router.back()}
          className="bg-black rounded-full py-4 items-center justify-center active:opacity-80"
        >
          <Text className="text-white text-lg font-semibold">Done</Text>
        </Pressable>
      </View>
    </View>
  );
}
