import { View, Text, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRide } from "../../../store/useRide";
import { RIDE_TYPES } from "../../../lib/constants";
import { formatDistance } from "../../../lib/location";

const STAR_COUNT = 5;

const RATING_LABELS: Record<number, string> = {
  1: "Terrible",
  2: "Poor",
  3: "Okay",
  4: "Good",
  5: "Excellent",
};

export default function RideComplete() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentRide, driver, submitRating, clearRide } = useRide();

  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const rideTypeInfo = currentRide
    ? RIDE_TYPES.find((rt) => rt.id === currentRide.rideType)
    : null;

  const handleSubmit = useCallback(() => {
    submitRating(stars, comment);
    setSubmitted(true);
  }, [stars, comment, submitRating]);

  const handleDone = useCallback(() => {
    clearRide();
    router.replace("/(rider)/ride/request");
  }, [clearRide, router]);

  // Redirect if no current ride
  if (!currentRide) {
    return (
      <View className="flex-1 bg-white items-center justify-center" style={{ paddingTop: insets.top }}>
        <Text className="text-gray-500 text-base mb-4">No ride to complete</Text>
        <Pressable
          onPress={() => router.replace("/(rider)/ride/request")}
          className="bg-black rounded-full px-6 py-3"
        >
          <Text className="text-white font-semibold">Request a Ride</Text>
        </Pressable>
      </View>
    );
  }

  // Receipt view after rating is submitted
  if (submitted) {
    return (
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          {/* Success header */}
          <View className="items-center pt-8 pb-6">
            <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
              <Text className="text-4xl">&#10003;</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-1">Thanks for riding!</Text>
            <Text className="text-base text-gray-500">Your feedback helps improve rides for everyone</Text>
          </View>

          {/* Receipt card */}
          <View className="mx-5 bg-gray-50 rounded-2xl p-5 mb-6">
            <Text className="text-xs font-semibold text-gray-400 uppercase mb-4">Receipt</Text>

            {/* Route */}
            <View className="mb-4">
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

            {/* Divider */}
            <View className="h-px bg-gray-200 mb-4" />

            {/* Trip details */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Text className="text-lg mr-2">{rideTypeInfo?.icon ?? "\u{1F697}"}</Text>
                <Text className="text-sm font-medium text-gray-900">{rideTypeInfo?.name ?? "Ride"}</Text>
              </View>
              <Text className="text-sm text-gray-500">
                {currentRide.distanceKm ? formatDistance(currentRide.distanceKm) : ""}{" "}
                {currentRide.durationMinutes ? `\u00b7 ~${currentRide.durationMinutes} min` : ""}
              </Text>
            </View>

            {/* Driver */}
            {driver && (
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm text-gray-500">Driver</Text>
                <Text className="text-sm font-medium text-gray-900">{driver.fullName}</Text>
              </View>
            )}

            {/* Rating given */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm text-gray-500">Your rating</Text>
              <View className="flex-row items-center">
                {Array.from({ length: STAR_COUNT }, (_, i) => (
                  <Text key={i} className="text-sm" style={{ color: i < stars ? "#FBBF24" : "#D1D5DB" }}>
                    {"\u2605"}
                  </Text>
                ))}
              </View>
            </View>

            {/* Divider */}
            <View className="h-px bg-gray-200 mb-4" />

            {/* Total */}
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-900">Total</Text>
              <Text className="text-2xl font-bold text-gray-900">
                ${currentRide.fareFinal?.toFixed(2) ?? currentRide.fareEstimate?.toFixed(2) ?? "0.00"}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Done button */}
        <View className="px-6 pb-6" style={{ paddingBottom: insets.bottom + 24 }}>
          <Pressable
            onPress={handleDone}
            className="bg-black rounded-full py-4 items-center justify-center active:opacity-80"
          >
            <Text className="text-white text-lg font-semibold">Done</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Rating screen
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="items-center pt-8 pb-6">
            <Text className="text-2xl font-bold text-gray-900 mb-1">How was your ride?</Text>
            <Text className="text-base text-gray-500">
              {driver ? `with ${driver.fullName}` : "Rate your experience"}
            </Text>
          </View>

          {/* Driver avatar */}
          {driver && (
            <View className="items-center mb-6">
              <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center">
                <Text className="text-3xl font-bold text-gray-600">
                  {driver.fullName.charAt(0)}
                </Text>
              </View>
            </View>
          )}

          {/* Star rating */}
          <View className="items-center mb-3">
            <View className="flex-row items-center gap-x-3">
              {Array.from({ length: STAR_COUNT }, (_, i) => {
                const starIndex = i + 1;
                const isFilled = starIndex <= stars;
                return (
                  <Pressable
                    key={i}
                    onPress={() => setStars(starIndex)}
                    hitSlop={12}
                    className="active:opacity-70"
                  >
                    <Text
                      className="text-5xl"
                      style={{ color: isFilled ? "#FBBF24" : "#D1D5DB" }}
                    >
                      {"\u2605"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text className="text-base font-semibold text-gray-700 mt-2">
              {RATING_LABELS[stars] ?? ""}
            </Text>
          </View>

          {/* Fare summary */}
          <View className="mx-5 bg-gray-50 rounded-2xl p-4 mt-4 mb-4">
            <Text className="text-xs font-semibold text-gray-400 uppercase mb-3">Trip Summary</Text>
            <View className="flex-row items-center justify-between mb-2">
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
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-gray-900">Fare</Text>
              <Text className="text-xl font-bold text-gray-900">
                ${currentRide.fareFinal?.toFixed(2) ?? currentRide.fareEstimate?.toFixed(2) ?? "0.00"}
              </Text>
            </View>
          </View>

          {/* Comment input */}
          <View className="mx-5 mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Add a comment (optional)</Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-900 border border-gray-200"
              placeholder="Tell us about your ride..."
              placeholderTextColor="#9CA3AF"
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={500}
            />
          </View>
        </ScrollView>

        {/* Submit button */}
        <View className="px-6 pb-6" style={{ paddingBottom: insets.bottom + 24 }}>
          <Pressable
            onPress={handleSubmit}
            className="bg-black rounded-full py-4 items-center justify-center active:opacity-80"
          >
            <Text className="text-white text-lg font-semibold">Submit Rating</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
