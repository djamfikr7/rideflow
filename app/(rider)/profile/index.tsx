import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useClerkAuth } from "../../../lib/clerk";
import { useAuth } from "../../../store/useAuth";

export default function RiderProfile() {
  const router = useRouter();
  const { signOut } = useClerkAuth();
  const user = useAuth((s) => s.user);

  const displayName = user?.fullName || "Rider";
  const displayEmail = user?.email || "rider@rideflow.com";
  const displayPhone = user?.phone;
  const avatarInitial = displayName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)");
  };

  const menuItems = [
    { label: "Edit Profile", action: () => router.push("/(rider)/profile/edit") },
    { label: "Payment Methods", action: () => {} },
    { label: "Saved Places", action: () => {} },
    { label: "Notifications", action: () => {} },
    { label: "Help & Support", action: () => {} },
    { label: "Settings", action: () => {} },
  ];

  return (
    <View className="flex-1 bg-white px-6 py-16">
      {/* Avatar */}
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center mb-4">
          <Text className="text-4xl font-bold text-gray-500">{avatarInitial}</Text>
        </View>
        <Text className="text-2xl font-bold text-black">{displayName}</Text>
        <Text className="text-gray-500">{displayEmail}</Text>
        {displayPhone ? (
          <Text className="text-gray-400 mt-1">{displayPhone}</Text>
        ) : null}
      </View>

      {/* Menu items */}
      <View className="gap-3">
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            className="flex-row items-center justify-between py-4 border-b border-gray-100"
            onPress={item.action}
          >
            <Text className="text-base text-black">{item.label}</Text>
            <Text className="text-gray-400">→</Text>
          </TouchableOpacity>
        ))}
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
