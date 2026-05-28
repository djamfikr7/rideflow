import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRide } from "../../../store/useRide";
import { RIDE_TYPES } from "../../../lib/constants";
import { formatDistance } from "../../../lib/location";
import type { PaymentMethod } from "../../../types/ride";

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; icon: string; description: string }[] = [
  { id: "card", label: "Credit Card", icon: "\uD83D\uDCB3", description: "Visa, Mastercard, Amex" },
  { id: "wallet", label: "Digital Wallet", icon: "\uD83D\uDCF1", description: "Apple Pay, Google Pay" },
  { id: "cash", label: "Cash", icon: "\uD83D\uDCB5", description: "Pay the driver directly" },
];

export default function Payment() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentRide, paymentMethod, setPaymentMethod } = useRide();

  const [isProcessing, setIsProcessing] = useState(false);

  const rideTypeInfo = currentRide
    ? RIDE_TYPES.find((rt) => rt.id === currentRide.rideType)
    : null;

  const fareDisplay = currentRide?.fareFinal?.toFixed(2)
    ?? currentRide?.fareEstimate?.toFixed(2)
    ?? "0.00";

  const handlePay = useCallback(() => {
    if (!currentRide) return;

    setIsProcessing(true);
    // Simulate 1-second payment processing
    setTimeout(() => {
      setIsProcessing(false);
      router.replace("/(rider)/ride/complete");
    }, 1000);
  }, [currentRide, router]);

  // Redirect if no current ride
  if (!currentRide) {
    return (
      <View className="flex-1 bg-white items-center justify-center" style={{ paddingTop: insets.top }}>
        <Text className="text-gray-500 text-base mb-4">No ride to pay for</Text>
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
        <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center" hitSlop={8}>
          <Text className="text-2xl text-gray-800">&larr;</Text>
        </Pressable>
        <Text className="text-xl font-bold text-gray-900 ml-3">Payment</Text>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        {/* Fare summary card */}
        <View className="bg-gray-50 rounded-2xl p-5 mb-6 mt-2">
          <Text className="text-xs font-semibold text-gray-400 uppercase mb-4">Fare Summary</Text>

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

          {/* Ride details */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Text className="text-lg mr-2">{rideTypeInfo?.icon ?? "\uD83D\uDE97"}</Text>
              <View>
                <Text className="text-sm font-semibold text-gray-900">{rideTypeInfo?.name ?? "Ride"}</Text>
                <Text className="text-xs text-gray-500">
                  {currentRide.distanceKm ? formatDistance(currentRide.distanceKm) : ""}{" "}
                  {currentRide.durationMinutes ? `\u00b7 ~${currentRide.durationMinutes} min` : ""}
                </Text>
              </View>
            </View>
          </View>

          {/* Divider */}
          <View className="h-px bg-gray-200 mb-4" />

          {/* Total fare */}
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-gray-900">Total</Text>
            <Text className="text-3xl font-bold text-gray-900">${fareDisplay}</Text>
          </View>
        </View>

        {/* Payment method selector */}
        <Text className="text-sm font-semibold text-gray-700 mb-3">Payment Method</Text>
        {PAYMENT_OPTIONS.map((option) => {
          const isSelected = paymentMethod === option.id;
          return (
            <Pressable
              key={option.id}
              onPress={() => setPaymentMethod(option.id)}
              className={`flex-row items-center p-4 rounded-xl mb-3 border-2 ${
                isSelected ? "border-black bg-gray-50" : "border-gray-200 bg-white"
              }`}
            >
              <Text className="text-2xl mr-4">{option.icon}</Text>
              <View className="flex-1">
                <Text className={`text-base font-semibold ${isSelected ? "text-gray-900" : "text-gray-700"}`}>
                  {option.label}
                </Text>
                <Text className="text-xs text-gray-400 mt-0.5">{option.description}</Text>
              </View>
              <View
                className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                  isSelected ? "border-black" : "border-gray-300"
                }`}
              >
                {isSelected && <View className="w-2.5 h-2.5 rounded-full bg-black" />}
              </View>
            </Pressable>
          );
        })}

        {/* Simulated card details for card method */}
        {paymentMethod === "card" && (
          <View className="bg-gray-50 rounded-xl p-4 mt-1 mb-3">
            <Text className="text-xs font-semibold text-gray-400 uppercase mb-3">Card Details</Text>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-gray-500">Card Number</Text>
              <Text className="text-sm font-mono text-gray-900">**** **** **** 4242</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-500">Expiry</Text>
              <Text className="text-sm font-mono text-gray-900">12/28</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Pay button */}
      <View className="px-6 pb-6" style={{ paddingBottom: insets.bottom + 24 }}>
        <Pressable
          onPress={handlePay}
          disabled={isProcessing}
          className="bg-black rounded-full py-4 items-center justify-center active:opacity-80"
          style={{ opacity: isProcessing ? 0.7 : 1 }}
        >
          {isProcessing ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="white" size="small" style={{ marginRight: 8 }} />
              <Text className="text-white text-lg font-semibold">Processing...</Text>
            </View>
          ) : (
            <Text className="text-white text-lg font-semibold">Pay ${fareDisplay}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
