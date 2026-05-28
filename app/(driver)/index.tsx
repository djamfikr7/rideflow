import { View, Text, TouchableOpacity } from "react-native";
import { useState } from "react";

export default function DriverDashboard() {
  const [isOnline, setIsOnline] = useState(false);

  return (
    <View className="flex-1 bg-white px-6 py-16">
      {/* Header */}
      <View className="items-center mb-8">
        <Text className="text-2xl font-bold text-black mb-1">Driver Dashboard</Text>
        <Text className="text-gray-500">Welcome back, Driver</Text>
      </View>

      {/* Online toggle */}
      <TouchableOpacity
        className={`py-5 rounded-2xl mb-8 ${isOnline ? "bg-green-500" : "bg-gray-200"}`}
        onPress={() => setIsOnline(!isOnline)}
      >
        <Text
          className={`text-center text-xl font-bold ${
            isOnline ? "text-white" : "text-gray-600"
          }`}
        >
          {isOnline ? "ONLINE — Looking for rides" : "OFFLINE — Tap to go online"}
        </Text>
      </TouchableOpacity>

      {/* Stats */}
      <View className="flex-row gap-4 mb-8">
        <View className="flex-1 bg-gray-50 rounded-2xl p-5 items-center">
          <Text className="text-3xl font-bold text-black">$0.00</Text>
          <Text className="text-gray-500 text-sm mt-1">Today's Earnings</Text>
        </View>
        <View className="flex-1 bg-gray-50 rounded-2xl p-5 items-center">
          <Text className="text-3xl font-bold text-black">0</Text>
          <Text className="text-gray-500 text-sm mt-1">Rides Today</Text>
        </View>
      </View>

      <View className="flex-row gap-4">
        <View className="flex-1 bg-gray-50 rounded-2xl p-5 items-center">
          <Text className="text-3xl font-bold text-black">5.0</Text>
          <Text className="text-gray-500 text-sm mt-1">Rating</Text>
        </View>
        <View className="flex-1 bg-gray-50 rounded-2xl p-5 items-center">
          <Text className="text-3xl font-bold text-black">0</Text>
          <Text className="text-gray-500 text-sm mt-1">Total Rides</Text>
        </View>
      </View>
    </View>
  );
}
