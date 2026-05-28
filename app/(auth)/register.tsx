import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useSignUp } from "@clerk/clerk-expo";

export default function Register() {
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"rider" | "driver">("rider");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!isLoaded) return;
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const result = await signUp.create({
        emailAddress: email.trim(),
        password,
        firstName: fullName.trim().split(" ")[0],
        lastName: fullName.trim().split(" ").slice(1).join(" ") || undefined,
      });

      // Store role in metadata
      await signUp.update({
        unsafeMetadata: { role },
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace(role === "driver" ? "/(driver)" : "/(rider)");
      } else if (result.status === "missing_requirements") {
        // Need email verification
        Alert.alert("Verify Email", "Please check your email to verify your account.");
      } else {
        Alert.alert("Error", "Sign up incomplete. Please try again.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-8 py-16 justify-between">
      <View>
        <Text className="text-3xl font-bold text-black mb-2">Create account</Text>
        <Text className="text-gray-500 mb-8">Join RideFlow today</Text>

        <View className="gap-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">Full Name</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3.5 text-base"
              placeholder="John Doe"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3.5 text-base"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">Password</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3.5 text-base"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Role selection */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-3">I want to</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`flex-1 py-4 rounded-xl border ${
                  role === "rider"
                    ? "bg-black border-black"
                    : "bg-white border-gray-300"
                }`}
                onPress={() => setRole("rider")}
              >
                <Text
                  className={`text-center font-semibold ${
                    role === "rider" ? "text-white" : "text-black"
                  }`}
                >
                  🚗 Get Rides
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 py-4 rounded-xl border ${
                  role === "driver"
                    ? "bg-black border-black"
                    : "bg-white border-gray-300"
                }`}
                onPress={() => setRole("driver")}
              >
                <Text
                  className={`text-center font-semibold ${
                    role === "driver" ? "text-white" : "text-black"
                  }`}
                >
                  🚙 Drive
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <View className="gap-4">
        <TouchableOpacity
          className={`bg-black py-4 rounded-full ${loading ? "opacity-50" : ""}`}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text className="text-white text-center text-lg font-semibold">
            {loading ? "Creating account..." : "Create Account"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text className="text-gray-500 text-center">
            Already have an account? <Text className="text-black font-semibold">Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
