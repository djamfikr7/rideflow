import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback, useMemo } from "react";
import { useHistory } from "../../store/useHistory";
import { RIDE_TYPES } from "../../lib/constants";
import { formatDistance } from "../../lib/location";
import type { Ride, RideStatus, RideType } from "../../types/ride";

const STATUS_COLORS: Record<RideStatus, { bg: string; text: string; label: string }> = {
  requested: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Requested" },
  matched: { bg: "bg-blue-100", text: "text-blue-700", label: "Matched" },
  driver_arriving: { bg: "bg-blue-100", text: "text-blue-700", label: "Arriving" },
  in_progress: { bg: "bg-indigo-100", text: "text-indigo-700", label: "In Progress" },
  completed: { bg: "bg-green-100", text: "text-green-700", label: "Completed" },
  cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" },
};

function getRideTypeIcon(rideType: RideType): string {
  return RIDE_TYPES.find((rt) => rt.id === rideType)?.icon ?? "\u{1F697}";
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function RideHistoryItem({ ride, onPress }: { ride: Ride; onPress: () => void }) {
  const statusInfo = STATUS_COLORS[ride.status];
  const icon = getRideTypeIcon(ride.rideType);
  const fare = ride.fareFinal ?? ride.fareEstimate;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white mx-4 mb-3 rounded-2xl p-4 shadow-sm shadow-black/5 active:opacity-80"
    >
      {/* Top row: date, time, status badge */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm text-gray-400">
          {formatDate(ride.requestedAt)} at {formatTime(ride.requestedAt)}
        </Text>
        <View className={`${statusInfo.bg} px-2.5 py-1 rounded-full`}>
          <Text className={`text-xs font-semibold ${statusInfo.text}`}>{statusInfo.label}</Text>
        </View>
      </View>

      {/* Route: pickup -> destination */}
      <View className="mb-3">
        <View className="flex-row items-center mb-1.5">
          <View className="w-2 h-2 bg-gray-800 rounded-full mr-2.5" />
          <Text className="text-sm text-gray-900 flex-1" numberOfLines={1}>
            {ride.pickup.address}
          </Text>
        </View>
        <View className="w-0.5 h-2.5 bg-gray-300 ml-0.75 mb-1.5" />
        <View className="flex-row items-center">
          <View className="w-2 h-2 bg-blue-500 rounded-full mr-2.5" />
          <Text className="text-sm text-gray-900 flex-1" numberOfLines={1}>
            {ride.destination.address}
          </Text>
        </View>
      </View>

      {/* Bottom row: ride type icon, distance, fare */}
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <View className="flex-row items-center">
          <Text className="text-lg mr-2">{icon}</Text>
          <Text className="text-sm text-gray-500">
            {ride.distanceKm ? formatDistance(ride.distanceKm) : ""}
            {ride.durationMinutes ? ` \u00b7 ${ride.durationMinutes} min` : ""}
          </Text>
        </View>
        {fare !== undefined && (
          <Text className="text-base font-bold text-gray-900">${fare.toFixed(2)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-5xl mb-4">{"\u{1F4CB}"}</Text>
      <Text className="text-xl font-bold text-gray-900 mb-2">No rides yet</Text>
      <Text className="text-gray-500 text-center leading-5">
        Your completed rides will appear here with receipts and trip details.
      </Text>
    </View>
  );
}

export default function RideHistory() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { rides } = useHistory();

  // Sort newest first
  const sortedRides = useMemo(
    () => [...rides].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()),
    [rides]
  );

  const handleRidePress = useCallback(
    (rideId: string) => {
      router.push(`/(rider)/ride/receipt?id=${rideId}`);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: Ride }) => (
      <RideHistoryItem ride={item} onPress={() => handleRidePress(item.id)} />
    ),
    [handleRidePress]
  );

  const keyExtractor = useCallback((item: Ride) => item.id, []);

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-5 pt-4 pb-3">
        <Text className="text-2xl font-bold text-gray-900">Ride History</Text>
      </View>

      {sortedRides.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={sortedRides}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: insets.bottom + 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
