import { View, Text } from "react-native";

export default function IncomingRide() {
  return (
    <View className="flex-1 bg-white items-center justify-center px-8">
      <Text className="text-6xl mb-4">🔔</Text>
      <Text className="text-2xl font-bold text-black mb-2">Incoming Ride</Text>
      <Text className="text-gray-500 text-center">
        New ride requests will appear here.
      </Text>
    </View>
  );
}
