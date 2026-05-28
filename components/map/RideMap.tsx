import { View, TouchableOpacity } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, type Region } from "react-native-maps";
import { useLocation } from "../../store/useLocation";
import { useRef, useEffect, useCallback } from "react";
import { getRegionForCoordinates } from "../../lib/location";
import type { RideStatus } from "../../types/ride";

interface DriverPosition {
  lat: number;
  lng: number;
}

interface RideMapProps {
  showPickup?: boolean;
  showDestination?: boolean;
  showMyLocationButton?: boolean;
  onMyLocationPress?: () => void;
  driverPosition?: DriverPosition;
  rideStatus?: RideStatus;
}

export default function RideMap({
  showPickup = true,
  showDestination = true,
  showMyLocationButton = true,
  onMyLocationPress,
  driverPosition,
  rideStatus,
}: RideMapProps) {
  const { currentLocation, pickup, destination } = useLocation();
  const mapRef = useRef<MapView>(null);

  const defaultRegion: Region = {
    latitude: currentLocation?.lat ?? 37.7749,
    longitude: currentLocation?.lng ?? -122.4194,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // When markers change, fit the map to show all relevant points
  useEffect(() => {
    if (!mapRef.current) return;

    const coords: Array<{ lat: number; lng: number }> = [];
    if (driverPosition) coords.push(driverPosition);
    if (showPickup && pickup) coords.push(pickup);
    if (showDestination && destination) coords.push(destination);

    if (coords.length >= 2) {
      // Fit to both pickup and destination
      const region = getRegionForCoordinates(coords, 1.5);
      mapRef.current.animateToRegion(region, 350);
    } else if (coords.length === 1) {
      // Animate to the single marker
      mapRef.current.animateToRegion(
        {
          latitude: coords[0].lat,
          longitude: coords[0].lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        350
      );
    }
  }, [pickup?.lat, pickup?.lng, destination?.lat, destination?.lng, showPickup, showDestination, driverPosition?.lat, driverPosition?.lng]);

  // Animate to current location when it first loads
  useEffect(() => {
    if (currentLocation && mapRef.current && !pickup && !destination) {
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        350
      );
    }
  }, [currentLocation?.lat, currentLocation?.lng]);

  const handleMyLocationPress = useCallback(() => {
    if (onMyLocationPress) {
      onMyLocationPress();
      return;
    }
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        350
      );
    }
  }, [currentLocation, onMyLocationPress]);

  return (
    <View className="flex-1">
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        initialRegion={defaultRegion}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        toolbarEnabled={false}
      >
        {/* Driver marker */}
        {driverPosition && (
          <Marker
            coordinate={{ latitude: driverPosition.lat, longitude: driverPosition.lng }}
            title="Driver"
            pinColor="#10B981"
            identifier="driver"
            anchor={{ x: 0.5, y: 0.5 }}
          />
        )}

        {showPickup && pickup && (
          <Marker
            coordinate={{ latitude: pickup.lat, longitude: pickup.lng }}
            title="Pickup"
            description={pickup.address}
            pinColor="black"
            identifier="pickup"
          />
        )}

        {showDestination && destination && (
          <Marker
            coordinate={{ latitude: destination.lat, longitude: destination.lng }}
            title="Destination"
            description={destination.address}
            pinColor="blue"
            identifier="destination"
          />
        )}

        {/* Polyline: driver to pickup (driver arriving) */}
        {rideStatus === "driver_arriving" && driverPosition && pickup && (
          <Polyline
            coordinates={[
              { latitude: driverPosition.lat, longitude: driverPosition.lng },
              { latitude: pickup.lat, longitude: pickup.lng },
            ]}
            strokeColor="#10B981"
            strokeWidth={3}
          />
        )}

        {/* Polyline: pickup to destination (ride in progress) */}
        {rideStatus === "in_progress" && pickup && destination && (
          <Polyline
            coordinates={[
              { latitude: pickup.lat, longitude: pickup.lng },
              { latitude: destination.lat, longitude: destination.lng },
            ]}
            strokeColor="#3B82F6"
            strokeWidth={3}
          />
        )}

        {/* Default route polyline (when no active ride status) */}
        {!rideStatus && showPickup && showDestination && pickup && destination && (
          <Polyline
            coordinates={[
              { latitude: pickup.lat, longitude: pickup.lng },
              { latitude: destination.lat, longitude: destination.lng },
            ]}
            strokeColor="#3B82F6"
            strokeWidth={3}
            lineDashPattern={[12, 6]}
          />
        )}
      </MapView>

      {/* My Location button */}
      {showMyLocationButton && (
        <TouchableOpacity
          onPress={handleMyLocationPress}
          className="absolute bottom-6 right-4 w-12 h-12 bg-white rounded-full items-center justify-center shadow-lg shadow-black/20"
          activeOpacity={0.7}
          accessibilityLabel="Center on my location"
        >
          {/* Crosshair icon using unicode -- avoids importing an icon library */}
          <View className="w-5 h-5 items-center justify-center">
            <View className="absolute w-5 h-0.5 bg-gray-700" />
            <View className="absolute w-0.5 h-5 bg-gray-700" />
            <View className="w-2 h-2 bg-blue-500 rounded-full" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}
