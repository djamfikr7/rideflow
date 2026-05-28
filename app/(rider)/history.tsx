import { View, Text } from "react-native";

export default function RideHistory() {
  return (
    <View className="flex-1 bg-white items-center justify-center px-8">
      <Text className="text-6xl mb-4">📋</Text>
      <Text className="text-2xl font-bold text-black mb-2">Ride History</Text>
      <Text className="text-gray-500 text-center">
        Your past rides will appear here.
      </Text>
    </View>
  );
}
