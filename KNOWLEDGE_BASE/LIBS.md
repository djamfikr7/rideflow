# Lib Module Reference

> All library modules in `lib/` — shared utilities and configuration.

---

## api.ts

**File:** `lib/api.ts`

**Purpose:** Axios HTTP client instance with base URL and interceptors.

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `default` | `AxiosInstance` | Configured Axios instance |

### Configuration

| Setting | Value |
|---------|-------|
| `baseURL` | `${API_URL}/api` (from constants) |
| `timeout` | 15000ms (15 seconds) |
| `Content-Type` | `application/json` |

### Interceptors

**Request interceptor:** Stub for auth token injection (TODO — needs Clerk token integration).

**Response interceptor:** Logs errors and re-throws. Extracts `error.response.data.detail` or `error.message` as error message.

### Usage Example

```tsx
import api from "../../lib/api";

// GET request
const response = await api.get("/rides/history");

// POST request
const response = await api.post("/rides", {
  pickupLat: 37.7749,
  pickupLng: -122.4194,
  pickupAddress: "123 Market St",
  destinationLat: 37.7849,
  destinationLng: -122.4094,
  destinationAddress: "456 Union Square",
  rideType: "STANDARD",
});
```

### Dependencies
- `axios`: HTTP client
- `lib/constants`: API_URL

---

## clerk.ts

**File:** `lib/clerk.ts`

**Purpose:** Clerk authentication SDK configuration and exports.

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `ClerkProvider` | `React.ComponentType` | Clerk context provider (wraps app) |
| `useClerkAuth` | `() => ClerkAuth` | Clerk's useAuth hook (aliased to avoid name conflict) |
| `publishableKey` | `string` | Clerk publishable key from `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` |
| `tokenCache` | `TokenCache` | Token cache using expo-secure-store |

### Token Cache

Uses `expo-secure-store` for encrypted token storage:

```ts
const tokenCache = {
  async getToken(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
  },
  async saveToken(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },
};
```

### Usage Example

```tsx
// In app/_layout.tsx
import { ClerkProvider, publishableKey, tokenCache } from "../../lib/clerk";

<ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
  <Stack />
</ClerkProvider>

// In any component
import { useClerkAuth } from "../../lib/clerk";
const { isSignedIn, isLoaded } = useClerkAuth();
```

### Dependencies
- `@clerk/clerk-expo`: ClerkProvider, useAuth
- `expo-secure-store`: getItemAsync, setItemAsync

---

## constants.ts

**File:** `lib/constants.ts`

**Purpose:** Application-wide constants — API URL, ride types, fare rates, colors.

### Exports

| Export | Type | Value | Description |
|--------|------|-------|-------------|
| `API_URL` | `string` | `process.env.EXPO_PUBLIC_API_URL \|\| "http://localhost:3000"` | Backend API base URL |
| `RIDE_TYPES` | `RideTypeConfig[]` | See below | Available ride types |
| `BASE_FARE` | `number` | `2.5` | Base fare in USD |
| `PER_KM_RATE` | `number` | `1.5` | Rate per km in USD |
| `PER_MINUTE_RATE` | `number` | `0.2` | Rate per minute in USD |
| `COLORS` | `ColorPalette` | See below | App color palette |

### RIDE_TYPES

| ID | Name | Multiplier | Icon | Description |
|----|------|------------|------|-------------|
| `"standard"` | Standard | 1.0 | 🚗 | Affordable, everyday rides |
| `"comfort"` | Comfort | 1.5 | 🚙 | Newer cars with extra legroom |
| `"premium"` | Premium | 2.0 | 🏎️ | Luxury cars, top-rated drivers |

### COLORS

| Key | Value | Usage |
|-----|-------|-------|
| `primary` | `#000000` | Primary brand color (black) |
| `accent` | `#3B82F6` | Accent color (blue-500) |
| `success` | `#22C55E` | Success state (green-500) |
| `danger` | `#EF4444` | Error/danger state (red-500) |
| `gray.50` - `gray.900` | Gray scale | Neutral colors |

### Fare Calculation Formula

```
fare = BASE_FARE + (distanceKm * PER_KM_RATE * multiplier) + (durationMinutes * PER_MINUTE_RATE)
```

### Usage Example

```tsx
import { RIDE_TYPES, BASE_FARE, PER_KM_RATE, PER_MINUTE_RATE, COLORS } from "../../lib/constants";

// Calculate fare for standard ride
const distance = 5.2; // km
const duration = 18; // minutes
const multiplier = 1.0; // standard
const fare = BASE_FARE + (distance * PER_KM_RATE * multiplier) + (duration * PER_MINUTE_RATE);
// = 2.5 + (5.2 * 1.5 * 1.0) + (18 * 0.2) = 2.5 + 7.8 + 3.6 = 13.9
```

### Dependencies
- None (pure constants)

---

## location.ts

**File:** `lib/location.ts`

**Purpose:** Location utilities — GPS access, geocoding, distance calculation, region computation.

### Exports

| Function | Signature | Return | Description |
|----------|-----------|--------|-------------|
| `requestLocationPermission` | `() => Promise<boolean>` | `boolean` | Request foreground location permission |
| `getCurrentLocation` | `() => Promise<Location \| null>` | `Location \| null` | Get current GPS position |
| `reverseGeocode` | `(lat: number, lng: number) => Promise<string>` | `string` | Convert coordinates to address |
| `searchPlaces` | `(query: string) => Promise<Location[]>` | `Location[]` | Forward geocode query string |
| `geocodeSearch` | `(query: string, limit?: number) => Promise<Location[]>` | `Location[]` | Forward geocode + reverse geocode each result |
| `haversineDistance` | `(from: {lat, lng}, to: {lat, lng}) => number` | `number` | Straight-line distance in km |
| `formatDistance` | `(km: number) => string` | `string` | Format km to "3.2 km" or "500 m" |
| `estimateDurationMinutes` | `(distanceKm: number) => number` | `number` | Estimate minutes at 30 km/h |
| `getRegionForCoordinates` | `(coordinates: Array<{lat, lng}>, paddingFactor?: number) => Region` | `Region` | Compute map region to fit coordinates |

### geocodeSearch Details

Forward-geocodes a query, then reverse-geocodes each result for human-readable addresses. Uses `Promise.allSettled` to handle partial failures gracefully.

- **Timeout:** 5000ms (5 seconds)
- **Default limit:** 5 results
- **Fallback:** Returns `query` as address if reverse geocoding fails

### haversineDistance Details

Uses the haversine formula to compute straight-line distance between two points on Earth.

- **Earth radius:** 6371 km
- **Returns:** Distance in kilometers

### getRegionForCoordinates Details

Computes a `Region` object that fits all given coordinates with padding.

- **Empty coordinates:** Returns San Francisco default (37.7749, -122.4194)
- **Single coordinate:** Returns 0.01 delta region
- **Multiple coordinates:** Returns bounding box with `paddingFactor` (default 1.5)
- **Minimum delta:** 0.01 (prevents over-zoom)

### Usage Example

```tsx
import {
  getCurrentLocation,
  geocodeSearch,
  haversineDistance,
  formatDistance,
  estimateDurationMinutes,
  getRegionForCoordinates,
} from "../../lib/location";

// Get current location
const location = await getCurrentLocation();
// { lat: 37.7749, lng: -122.4194, address: "Current Location" }

// Search for places
const results = await geocodeSearch("Golden Gate Park", 3);
// [{ lat: 37.7694, lng: -122.4862, address: "Golden Gate Park, San Francisco, CA, USA" }]

// Calculate distance
const km = haversineDistance(
  { lat: 37.7749, lng: -122.4194 },
  { lat: 37.7849, lng: -122.4094 }
);
// 1.41 km

// Format distance
formatDistance(0.85); // "850 m"
formatDistance(5.2);  // "5.2 km"

// Estimate duration
estimateDurationMinutes(5.2); // 10 minutes (at 30 km/h)

// Get map region
const region = getRegionForCoordinates([
  { lat: 37.7749, lng: -122.4194 },
  { lat: 37.7849, lng: -122.4094 },
]);
```

### Dependencies
- `expo-location`: requestForegroundPermissionsAsync, getCurrentPositionAsync, geocodeAsync, reverseGeocodeAsync
- `types/ride`: Location
- `react-native-maps`: Region type

---

## socket.ts

**File:** `lib/socket.ts`

**Purpose:** Socket.IO client singleton for real-time communication.

### Exports

| Function | Signature | Return | Description |
|----------|-----------|--------|-------------|
| `getSocket` | `() => Socket` | `Socket` | Get or create Socket.IO instance |
| `connectSocket` | `(userId: string) => Socket` | `Socket` | Connect with userId in auth |
| `disconnectSocket` | `() => void` | — | Disconnect and clear instance |

### Configuration

| Setting | Value |
|---------|-------|
| `autoConnect` | `false` (manual connect) |
| `transports` | `["websocket"]` |
| `auth` | `{ userId }` (set on connect) |

### Usage Example

```tsx
import { connectSocket, disconnectSocket, getSocket } from "../../lib/socket";

// Connect
const socket = connectSocket("user-123");

// Listen for events
socket.on("driver-location", (data) => {
  console.log("Driver at:", data.lat, data.lng);
});

// Disconnect on unmount
disconnectSocket();
```

### Dependencies
- `socket.io-client`: io, Socket
- `lib/constants`: API_URL

---

## useAuth.ts (Auth Guard Hook)

**File:** `lib/useAuth.ts`

**Purpose:** Route protection hook — redirects users based on authentication state.

### Exports

| Function | Signature | Return | Description |
|----------|-----------|--------|-------------|
| `useAuth` | `() => { isSignedIn: boolean; isLoaded: boolean }` | Auth state | Route protection hook |

### Behavior

1. Checks if Clerk has loaded (`isLoaded`)
2. Detects if user is in `(auth)` route group via `useSegments()`
3. If not signed in and not in auth group -> redirect to `/(auth)`
4. If signed in and in auth group -> redirect to `/(rider)` (TODO: role-based redirect)

### Usage Example

```tsx
import { useAuth } from "../../lib/useAuth";

export default function SomeScreen() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <LoadingSpinner />;

  // User is authenticated and in correct route group
  return <View>...</View>;
}
```

### Dependencies
- `lib/clerk`: useClerkAuth
- `expo-router`: useRouter, useSegments
- `react`: useEffect

### Known TODOs
- Role-based redirect: currently always redirects to `(rider)` even for drivers
- Should check `user.role` from useAuth store and redirect to `(driver)` if needed
