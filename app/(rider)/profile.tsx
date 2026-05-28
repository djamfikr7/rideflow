import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useClerkAuth } from "../../lib/clerk";

export default function RiderProfile() {
  const router = useRouter();
  const { signOut } = useClerkAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)");
  };

  return (
    <View className="flex-1 bg-white px-6 py-16">
      {/* Avatar */}
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center mb-4">
          <Text className="text-4xl">👤</Text>
        </View>
        <Text className="text-2xl font-bold text-black">Rider</Text>
        <Text className="text-gray-500">rider@rideflow.com</Text>
      </View>

      {/* Menu items */}
      <View className="gap-3">
        {["Payment Methods", "Saved Places", "Notifications", "Help & Support", "Settings"].map(
          (item) => (
            <TouchableOpacity
              key={item}
              className="flex-row items-center justify-between py-4 border-b border-gray-100"
            >
              <Text className="text-base text-black">{item}</Text>
              <Text className="text-gray-400">→</Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* Sign out */}
      <TouchableOpacity
        className="mt-8 py-4 border border-red-500 rounded-xl"
        onPress={handleSignOut}
      >
        <Text className="text-red-500 text-center font-semibold">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
