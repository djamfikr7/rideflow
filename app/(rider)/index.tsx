import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import RideMap from "../../components/map/RideMap";
import { useLocation } from "../../store/useLocation";
import { getCurrentLocation, reverseGeocode } from "../../lib/location";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RiderHome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentLocation, setCurrentLocation, setPickup } = useLocation();
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    loadCurrentLocation();
  }, []);

  const loadCurrentLocation = useCallback(async () => {
    setLoadingLocation(true);
    setLocationError(false);
    try {
      const location = await getCurrentLocation();
      if (location) {
        const address = await reverseGeocode(location.lat, location.lng);
        const locWithAddress = { ...location, address };
        setCurrentLocation(locWithAddress);
        setPickup(locWithAddress);
      } else {
        setLocationError(true);
        Alert.alert("Location", "Please enable location permissions to use RideFlow.");
      }
    } catch (err) {
      console.error("Location error:", err);
      setLocationError(true);
    } finally {
      setLoadingLocation(false);
    }
  }, []);

  const handleSearchPress = useCallback(() => {
    router.push("/(rider)/ride/request");
  }, [router]);

  const handleMyLocationPress = useCallback(() => {
    if (!currentLocation) {
      loadCurrentLocation();
    }
  }, [currentLocation, loadCurrentLocation]);

  return (
    <View className="flex-1 bg-white">
      {/* Full-screen map as background */}
      <RideMap showMyLocationButton onMyLocationPress={handleMyLocationPress} />

      {/* Overlay: "Where to?" search bar */}
      <View
        className="absolute left-0 right-0 px-4"
        style={{ bottom: insets.bottom + 16 }}
        pointerEvents="box-none"
      >
        {/* Current location indicator */}
        {currentLocation && !loadingLocation && (
          <View className="flex-row items-center mb-3 px-2">
            <View className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
            <Text className="text-xs text-gray-500 flex-1" numberOfLines={1}>
              {currentLocation.address}
            </Text>
          </View>
        )}

        {/* "Where to?" search bar */}
        <TouchableOpacity
          className="bg-white flex-row items-center px-4 py-4 rounded-xl shadow-lg shadow-black/10"
          onPress={handleSearchPress}
          activeOpacity={0.8}
          disabled={loadingLocation}
        >
          {loadingLocation ? (
            <ActivityIndicator size="small" color="#000" className="mr-3" />
          ) : (
            <View className="w-3 h-3 bg-gray-400 rounded-full mr-3" />
          )}
          <Text className="text-gray-400 text-base flex-1">
            {loadingLocation ? "Getting your location..." : "Where are you going?"}
          </Text>
          <View className="bg-black px-4 py-2 rounded-full">
            <Text className="text-white text-sm font-semibold">Search</Text>
          </View>
        </TouchableOpacity>

        {/* Retry button when location failed */}
        {locationError && !loadingLocation && (
          <TouchableOpacity
            onPress={loadCurrentLocation}
            className="bg-gray-100 py-2 rounded-lg mt-2 items-center"
          >
            <Text className="text-gray-600 text-sm">Tap to retry location</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
