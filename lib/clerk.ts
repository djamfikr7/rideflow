import { ClerkProvider, useAuth as useClerkAuth } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // silent fail
    }
  },
};

export { ClerkProvider, useClerkAuth, publishableKey, tokenCache };
