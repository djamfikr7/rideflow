import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAuth } from "../../../store/useAuth";

export default function EditProfile() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const updateProfile = useAuth((s) => s.updateProfile);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const avatarInitial = fullName.charAt(0).toUpperCase() || "R";

  const handleSave = () => {
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      Alert.alert("Validation", "Full name is required.");
      return;
    }
    updateProfile({
      fullName: trimmedName,
      phone: phone.trim() || undefined,
    });
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-white px-6 py-16">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-8">
        <TouchableOpacity onPress={handleCancel}>
          <Text className="text-base text-gray-500">Cancel</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-black">Edit Profile</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text className="text-base font-semibold text-black">Save</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar placeholder */}
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center">
          <Text className="text-4xl font-bold text-gray-500">{avatarInitial}</Text>
        </View>
      </View>

      {/* Form */}
      <View className="gap-5">
        <View>
          <Text className="text-sm font-semibold text-gray-600 mb-2">Full Name</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base text-black"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
          />
        </View>

        <View>
          <Text className="text-sm font-semibold text-gray-600 mb-2">Phone Number</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base text-black"
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* Save button */}
      <TouchableOpacity
        className="mt-10 bg-black py-4 rounded-xl"
        onPress={handleSave}
      >
        <Text className="text-white text-center font-semibold text-base">
          Save Changes
        </Text>
      </TouchableOpacity>
    </View>
  );
}
