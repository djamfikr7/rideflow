import { View, Text } from "react-native";

export default function DriverEarnings() {
  return (
    <View className="flex-1 bg-white items-center justify-center px-8">
      <Text className="text-6xl mb-4">💰</Text>
      <Text className="text-2xl font-bold text-black mb-2">Earnings</Text>
      <Text className="text-gray-500 text-center">
        Your earnings history will appear here.
      </Text>
    </View>
  );
}
