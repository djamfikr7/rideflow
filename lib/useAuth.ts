import { useClerkAuth } from "./clerk";
import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

export function useAuth() {
  const { isSignedIn, isLoaded } = useClerkAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isSignedIn && !inAuthGroup) {
      // Redirect to auth if not signed in and not already in auth group
      router.replace("/(auth)");
    } else if (isSignedIn && inAuthGroup) {
      // Redirect to rider home if signed in and in auth group
      // TODO: Check user role and redirect to driver if needed
      router.replace("/(rider)");
    }
  }, [isSignedIn, isLoaded, segments]);

  return { isSignedIn, isLoaded };
}
