import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Onboarding() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white justify-between px-8 py-16">
      {/* Top section */}
      <View className="flex-1 justify-center items-center">
        <View className="w-24 h-24 bg-black rounded-full items-center justify-center mb-8">
          <Text className="text-white text-4xl font-bold">R</Text>
        </View>
        <Text className="text-4xl font-bold text-black text-center mb-4">
          RideFlow
        </Text>
        <Text className="text-lg text-gray-500 text-center leading-7">
          Get a ride in minutes.{"\n"}
          Drive and earn on your schedule.
        </Text>
      </View>

      {/* Bottom section */}
      <View className="gap-4">
        <TouchableOpacity
          className="bg-black py-4 rounded-full"
          onPress={() => router.push("/(auth)/register")}
        >
          <Text className="text-white text-center text-lg font-semibold">
            Get Started
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="border border-gray-300 py-4 rounded-full"
          onPress={() => router.push("/(auth)/login")}
        >
          <Text className="text-black text-center text-lg font-semibold">
            I already have an account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
