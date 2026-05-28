import { View, Text, TouchableOpacity, Animated } from "react-native";
import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDriver } from "../../store/useDriver";
import { useLocation } from "../../store/useLocation";
import RideMap from "../../components/map/RideMap";
import type { Ride } from "../../types/ride";

// Simulated incoming ride request data
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

export default function DriverDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isOnline, todayEarnings, todayRides, setIncomingRide, goOnline, goOffline } = useDriver();
  const currentLocation = useLocation((s) => s.currentLocation);
  const rideRequestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Simulate incoming ride request after going online
  useEffect(() => {
    if (isOnline) {
      rideRequestTimer.current = setTimeout(() => {
        setIncomingRide(MOCK_INCOMING_RIDE.id);
        router.push("/(driver)/ride/incoming");
      }, 5000);
    } else {
      if (rideRequestTimer.current) {
        clearTimeout(rideRequestTimer.current);
        rideRequestTimer.current = null;
      }
    }

    return () => {
      if (rideRequestTimer.current) {
        clearTimeout(rideRequestTimer.current);
        rideRequestTimer.current = null;
      }
    };
  }, [isOnline, router, setIncomingRide]);

  const handleToggleOnline = useCallback(async () => {
    if (isOnline) {
      goOffline();
    } else {
      await goOnline();
    }
  }, [isOnline, goOnline, goOffline]);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="items-center mb-6 pt-4">
        <Text className="text-2xl font-bold text-black mb-1">Driver Dashboard</Text>
        <Text className="text-gray-500">Welcome back, Driver</Text>
      </View>

      {/* Online toggle */}
      <TouchableOpacity
        className={`mx-6 py-5 rounded-2xl mb-6 ${isOnline ? "bg-green-500" : "bg-gray-200"}`}
        onPress={handleToggleOnline}
      >
        <Text
          className={`text-center text-xl font-bold ${
            isOnline ? "text-white" : "text-gray-600"
          }`}
        >
          {isOnline ? "ONLINE — Looking for rides" : "OFFLINE — Tap to go online"}
        </Text>
      </TouchableOpacity>

      {/* Map when online, Stats when offline */}
      {isOnline ? (
        <OnlineContent
          currentLocation={currentLocation}
        />
      ) : (
        <OfflineContent
          todayEarnings={todayEarnings}
          todayRides={todayRides}
        />
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Online: map + pulsing waiting indicator                            */
/* ------------------------------------------------------------------ */

function OnlineContent({
  currentLocation,
}: {
  currentLocation: { lat: number; lng: number } | null;
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  return (
    <View className="flex-1 mx-6 rounded-2xl overflow-hidden mb-6">
      <RideMap
        showPickup={false}
        showDestination={false}
        showMyLocationButton={true}
        driverPosition={currentLocation ?? undefined}
      />
      {/* Waiting overlay with pulsing indicator */}
      <View className="absolute bottom-0 left-0 right-0 bg-white/90 py-4 px-6 items-center border-t border-gray-200">
        <View className="flex-row items-center">
          <Animated.View
            className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2"
            style={{ opacity: pulseAnim }}
          />
          <Text className="text-base font-semibold text-gray-800">
            Waiting for ride requests...
          </Text>
        </View>
        <Text className="text-sm text-gray-500 mt-1">
          Stay online to receive ride requests
        </Text>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Offline: stats + recent activity                                   */
/* ------------------------------------------------------------------ */

function OfflineContent({
  todayEarnings,
  todayRides,
}: {
  todayEarnings: number;
  todayRides: number;
}) {
  return (
    <View className="flex-1 px-6">
      {/* Stats */}
      <View className="flex-row gap-4 mb-6">
        <View className="flex-1 bg-gray-50 rounded-2xl p-5 items-center">
          <Text className="text-3xl font-bold text-black">
            ${todayEarnings.toFixed(2)}
          </Text>
          <Text className="text-gray-500 text-sm mt-1">Today's Earnings</Text>
        </View>
        <View className="flex-1 bg-gray-50 rounded-2xl p-5 items-center">
          <Text className="text-3xl font-bold text-black">{todayRides}</Text>
          <Text className="text-gray-500 text-sm mt-1">Rides Today</Text>
        </View>
      </View>

      <View className="flex-row gap-4 mb-6">
        <View className="flex-1 bg-gray-50 rounded-2xl p-5 items-center">
          <Text className="text-3xl font-bold text-black">5.0</Text>
          <Text className="text-gray-500 text-sm mt-1">Rating</Text>
        </View>
        <View className="flex-1 bg-gray-50 rounded-2xl p-5 items-center">
          <Text className="text-3xl font-bold text-black">{todayRides}</Text>
          <Text className="text-gray-500 text-sm mt-1">Total Rides</Text>
        </View>
      </View>

      {/* Recent activity placeholder */}
      <View className="bg-gray-50 rounded-2xl p-5">
        <Text className="text-xs font-semibold text-gray-400 uppercase mb-3">
          Recent Activity
        </Text>
        <Text className="text-sm text-gray-500 text-center py-4">
          No rides today yet. Go online to start earning!
        </Text>
      </View>
    </View>
  );
}
