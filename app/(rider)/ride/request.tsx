import { View, Text, TextInput, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocation } from "../../../store/useLocation";
import { useRide } from "../../../store/useRide";
import { geocodeSearch, haversineDistance, formatDistance, estimateDurationMinutes } from "../../../lib/location";
import { RIDE_TYPES, BASE_FARE, PER_KM_RATE, PER_MINUTE_RATE } from "../../../lib/constants";
import type { Location, FareEstimate, RideType } from "../../../types/ride";

type ActiveField = "pickup" | "destination";

export default function RideRequest() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentLocation, pickup, destination, setPickup, setDestination } = useLocation();
  const { selectedRideType, setSelectedRideType, setFareEstimates, setCurrentRide, setIsMatching } = useRide();

  const [activeField, setActiveField] = useState<ActiveField>("destination");
  const [pickupQuery, setPickupQuery] = useState(pickup?.address ?? "");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [results, setResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showRideTypes, setShowRideTypes] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestQuery = useRef(destinationQuery);
  const latestField = useRef(activeField);

  useEffect(() => {
    latestQuery.current = activeField === "pickup" ? pickupQuery : destinationQuery;
    latestField.current = activeField;
  }, [activeField, pickupQuery, destinationQuery]);

  // Initialize pickup from current location if empty
  useEffect(() => {
    if (currentLocation && !pickup) {
      setPickup(currentLocation);
      setPickupQuery(currentLocation.address);
    }
  }, [currentLocation]);

  // Debounced search
  const performSearch = useCallback(async (query: string, field: ActiveField) => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const locations = await geocodeSearch(query.trim());
      // Only apply if the query and field still match
      if (latestQuery.current === query && latestField.current === field) {
        setResults(locations);
      }
    } catch {
      // Silent fail
    } finally {
      if (latestQuery.current === query && latestField.current === field) {
        setIsSearching(false);
      }
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const query = activeField === "pickup" ? pickupQuery : destinationQuery;
    if (query.trim().length >= 2) {
      setIsSearching(true);
      debounceRef.current = setTimeout(() => {
        performSearch(query, activeField);
      }, 500);
    } else {
      setResults([]);
      setIsSearching(false);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [pickupQuery, destinationQuery, activeField, performSearch]);

  // --- Handlers ---

  const handleSelectLocation = useCallback(
    (location: Location) => {
      if (activeField === "pickup") {
        setPickup(location);
        setPickupQuery(location.address);
      } else {
        setDestination(location);
        setDestinationQuery(location.address);
      }
      setResults([]);
    },
    [activeField, setPickup, setDestination]
  );

  const handleClearPickup = useCallback(() => {
    setPickup(null);
    setPickupQuery("");
    setActiveField("pickup");
    setResults([]);
  }, [setPickup]);

  const handleClearDestination = useCallback(() => {
    setDestination(null);
    setDestinationQuery("");
    setActiveField("destination");
    setResults([]);
  }, [setDestination]);

  const handlePickupQueryChange = useCallback(
    (text: string) => {
      setPickupQuery(text);
      if (pickup) setPickup(null);
    },
    [pickup, setPickup]
  );

  const handleDestinationQueryChange = useCallback(
    (text: string) => {
      setDestinationQuery(text);
      if (destination) setDestination(null);
    },
    [destination, setDestination]
  );

  // Compute fare estimates when both locations are set
  const { distanceKm, durationMin, fareEstimates } = useMemo(() => {
    if (!pickup || !destination) {
      return { distanceKm: 0, durationMin: 0, fareEstimates: [] as FareEstimate[] };
    }
    const km = haversineDistance(pickup, destination);
    const mins = estimateDurationMinutes(km);
    const estimates: FareEstimate[] = RIDE_TYPES.map((rt) => ({
      rideType: rt.id as RideType,
      distance: km,
      duration: mins,
      price: BASE_FARE + km * PER_KM_RATE * rt.multiplier + mins * PER_MINUTE_RATE,
      currency: "USD",
    }));
    return { distanceKm: km, durationMin: mins, fareEstimates: estimates };
  }, [pickup, destination]);

  // Sync fare estimates to the ride store
  useEffect(() => {
    if (fareEstimates.length > 0) {
      setFareEstimates(fareEstimates);
    }
  }, [fareEstimates, setFareEstimates]);

  const selectedFare = fareEstimates.find((f) => f.rideType === selectedRideType);

  const handleConfirmLocations = useCallback(() => {
    setShowRideTypes(true);
  }, []);

  const handleConfirmRide = useCallback(() => {
    if (!pickup || !destination || !selectedFare) return;

    const rideId = `ride_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const ride: import("../../../types/ride").Ride = {
      id: rideId,
      riderId: "rider_mock_001",
      status: "requested",
      pickup,
      destination,
      rideType: selectedRideType,
      fareEstimate: selectedFare.price,
      distanceKm: selectedFare.distance,
      durationMinutes: selectedFare.duration,
      requestedAt: new Date().toISOString(),
    };

    setCurrentRide(ride);
    setIsMatching(true);
    router.push("/(rider)/ride/matching");
  }, [pickup, destination, selectedFare, selectedRideType, setCurrentRide, setIsMatching, router]);

  const handleBack = useCallback(() => {
    if (showRideTypes) {
      setShowRideTypes(false);
    } else {
      router.back();
    }
  }, [showRideTypes, router]);

  // --- Field config ---

  const fieldConfig = {
    pickup: {
      query: pickupQuery,
      location: pickup,
      color: "black" as const,
      dotBg: "bg-gray-800",
      borderActive: "border-gray-800",
      onChange: handlePickupQueryChange,
      onClear: handleClearPickup,
    },
    destination: {
      query: destinationQuery,
      location: destination,
      color: "blue" as const,
      dotBg: "bg-blue-500",
      borderActive: "border-blue-500",
      onChange: handleDestinationQueryChange,
      onClear: handleClearDestination,
    },
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={handleBack} className="w-10 h-10 items-center justify-center" hitSlop={8}>
          <Text className="text-2xl text-gray-800">&larr;</Text>
        </Pressable>
        <Text className="text-xl font-bold text-gray-900 ml-3">Plan your ride</Text>
      </View>

      {/* Input fields */}
      <View className="px-5 pt-2 pb-3">
        <View className="flex-row items-start">
          {/* Vertical line connecting dots */}
          <View className="items-center mr-3 mt-4">
            <View className={`w-3 h-3 rounded-full ${fieldConfig.pickup.dotBg}`} />
            <View className="w-0.5 h-8 bg-gray-300 my-1" />
            <View className={`w-3 h-3 rounded-full ${fieldConfig.destination.dotBg}`} />
          </View>

          {/* Input fields column */}
          <View className="flex-1 gap-y-3">
            {(Object.keys(fieldConfig) as ActiveField[]).map((field) => {
              const config = fieldConfig[field];
              const isActive = activeField === field;
              return (
                <View key={field}>
                  <Text className="text-xs font-semibold text-gray-400 uppercase mb-1">
                    {field === "pickup" ? "Pickup" : "Destination"}
                  </Text>
                  <View
                    className={`flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border-2 ${
                      isActive ? config.borderActive : "border-transparent"
                    }`}
                  >
                    <TextInput
                      className="flex-1 text-base text-gray-900"
                      placeholder={field === "pickup" ? "Current location" : "Where are you going?"}
                      placeholderTextColor="#9CA3AF"
                      value={config.query}
                      onChangeText={config.onChange}
                      onFocus={() => setActiveField(field)}
                      returnKeyType="search"
                      autoCorrect={false}
                    />
                    {(config.query.length > 0 || config.location) && (
                      <Pressable onPress={config.onClear} hitSlop={8} className="ml-2">
                        <Text className="text-gray-400 text-lg font-medium">&times;</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Divider */}
      <View className="h-px bg-gray-200" />

      {/* Search results / content area */}
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {isSearching && (
          <View className="flex-row items-center px-6 py-4">
            <View className="w-2 h-2 bg-gray-400 rounded-full mr-3" />
            <Text className="text-gray-400 text-sm">Searching...</Text>
          </View>
        )}

        {!isSearching && results.length > 0 && (
          <View className="py-2">
            {results.map((loc, idx) => (
              <Pressable
                key={`${loc.lat}-${loc.lng}-${idx}`}
                onPress={() => handleSelectLocation(loc)}
                className="flex-row items-start px-6 py-3 active:bg-gray-50"
              >
                <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mr-3 mt-0.5">
                  <Text className="text-gray-500 text-sm">P</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-900" numberOfLines={1}>
                    {loc.address.split(",")[0]}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={2}>
                    {loc.address}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {!isSearching &&
          results.length === 0 &&
          activeField === "destination" &&
          destinationQuery.trim().length < 2 && (
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-5xl mb-4">?</Text>
              <Text className="text-base font-medium text-gray-700 mb-1">Enter a destination</Text>
              <Text className="text-sm text-gray-400 text-center px-8">
                Search for a place name, address, or landmark
              </Text>
            </View>
          )}

        {!isSearching &&
          results.length === 0 &&
          activeField === "pickup" &&
          pickupQuery.trim().length < 2 && (
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-5xl mb-4">P</Text>
              <Text className="text-base font-medium text-gray-700 mb-1">Set pickup location</Text>
              <Text className="text-sm text-gray-400 text-center px-8">
                Search for a place name, address, or landmark
              </Text>
            </View>
          )}

        {/* Route preview when both locations are set — location confirmation step */}
        {pickup && destination && !isSearching && results.length === 0 && !showRideTypes && (
          <View className="px-5 pt-3 pb-4">
            {/* Pickup card */}
            <View className="flex-row items-center bg-gray-50 rounded-xl p-4 mb-2">
              <View className="w-3 h-3 bg-gray-800 rounded-full mr-3" />
              <View className="flex-1">
                <Text className="text-xs text-gray-400 uppercase font-semibold">Pickup</Text>
                <Text className="text-sm font-medium text-gray-900 mt-0.5" numberOfLines={1}>
                  {pickup.address}
                </Text>
              </View>
            </View>

            {/* Destination card */}
            <View className="flex-row items-center bg-gray-50 rounded-xl p-4 mb-3">
              <View className="w-3 h-3 bg-blue-500 rounded-full mr-3" />
              <View className="flex-1">
                <Text className="text-xs text-gray-400 uppercase font-semibold">Destination</Text>
                <Text className="text-sm font-medium text-gray-900 mt-0.5" numberOfLines={1}>
                  {destination.address}
                </Text>
              </View>
            </View>

            {/* Distance / duration estimate */}
            <View className="flex-row items-center justify-center gap-x-4 mb-4 py-2">
              <Text className="text-sm text-gray-500">{formatDistance(distanceKm)} away</Text>
              <View className="w-1 h-1 bg-gray-300 rounded-full" />
              <Text className="text-sm text-gray-500">~{durationMin} min</Text>
            </View>

            {/* Confirm button */}
            <Pressable
              onPress={handleConfirmLocations}
              className="bg-black rounded-full py-4 items-center justify-center active:opacity-80"
            >
              <Text className="text-white text-lg font-semibold">Confirm Locations</Text>
            </Pressable>
          </View>
        )}

        {/* Ride type selection step */}
        {pickup && destination && showRideTypes && !isSearching && results.length === 0 && (
          <View className="px-5 pt-3 pb-4">
            {/* Compact route summary */}
            <Pressable
              onPress={() => setShowRideTypes(false)}
              className="flex-row items-center bg-gray-50 rounded-xl p-3 mb-4 active:bg-gray-100"
            >
              <View className="w-2.5 h-2.5 bg-gray-800 rounded-full mr-2" />
              <Text className="text-sm text-gray-900 flex-1" numberOfLines={1}>
                {pickup.address.split(",")[0]}
              </Text>
              <Text className="text-gray-400 mx-2">→</Text>
              <View className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-2" />
              <Text className="text-sm text-gray-900 flex-1" numberOfLines={1}>
                {destination.address.split(",")[0]}
              </Text>
              <Text className="text-gray-400 ml-2 text-xs">{formatDistance(distanceKm)}</Text>
            </Pressable>

            {/* Section header */}
            <Text className="text-lg font-bold text-gray-900 mb-3">Choose your ride</Text>

            {/* Ride type cards */}
            {fareEstimates.map((fare) => {
              const rt = RIDE_TYPES.find((t) => t.id === fare.rideType)!;
              const isSelected = selectedRideType === fare.rideType;
              return (
                <Pressable
                  key={rt.id}
                  onPress={() => setSelectedRideType(rt.id as RideType)}
                  className={`flex-row items-center rounded-xl p-4 mb-2 border-2 ${
                    isSelected ? "border-gray-900 bg-gray-50" : "border-gray-200 bg-white"
                  } active:bg-gray-50`}
                >
                  {/* Icon */}
                  <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mr-4">
                    <Text className="text-2xl">{rt.icon}</Text>
                  </View>

                  {/* Name & description */}
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">{rt.name}</Text>
                    <Text className="text-sm text-gray-500 mt-0.5">{rt.description}</Text>
                  </View>

                  {/* Price */}
                  <View className="items-end ml-3">
                    <Text className="text-lg font-bold text-gray-900">${fare.price.toFixed(2)}</Text>
                    {rt.multiplier > 1 && (
                      <Text className="text-xs text-gray-400 mt-0.5">{rt.multiplier}x rate</Text>
                    )}
                  </View>

                  {/* Selection indicator */}
                  <View
                    className={`w-5 h-5 rounded-full border-2 ml-3 items-center justify-center ${
                      isSelected ? "border-gray-900" : "border-gray-300"
                    }`}
                  >
                    {isSelected && <View className="w-2.5 h-2.5 bg-gray-900 rounded-full" />}
                  </View>
                </Pressable>
              );
            })}

            {/* Trip details */}
            <View className="flex-row items-center justify-center gap-x-4 mt-2 mb-4 py-2">
              <Text className="text-sm text-gray-500">{formatDistance(distanceKm)}</Text>
              <View className="w-1 h-1 bg-gray-300 rounded-full" />
              <Text className="text-sm text-gray-500">~{durationMin} min</Text>
            </View>

            {/* Confirm Ride button */}
            <Pressable
              onPress={handleConfirmRide}
              className="bg-black rounded-full py-4 items-center justify-center active:opacity-80"
            >
              <Text className="text-white text-lg font-semibold">
                Confirm {RIDE_TYPES.find((t) => t.id === selectedRideType)?.name} — ${selectedFare?.price.toFixed(2)}
              </Text>
            </Pressable>
          </View>
        )}

        {/* No results state */}
        {!isSearching &&
          !showRideTypes &&
          results.length === 0 &&
          ((activeField === "pickup" && pickupQuery.trim().length >= 2) ||
            (activeField === "destination" && destinationQuery.trim().length >= 2)) && (
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-base text-gray-500">No results found</Text>
              <Text className="text-sm text-gray-400 mt-1">Try a different search term</Text>
            </View>
          )}
      </ScrollView>
    </View>
  );
}
