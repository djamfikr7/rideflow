# Store API Reference

> All Zustand stores in the RideFlow frontend. Each store manages a single domain.

---

## useAuth Store

**File:** `store/useAuth.ts`

**Purpose:** Manages user authentication state and profile.

### State

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `user` | `User \| null` | `null` | Current user object |
| `isSignedIn` | `boolean` | `false` | Whether user is authenticated |
| `isLoading` | `boolean` | `false` | Loading state for auth operations |

### Actions

| Action | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `setUser` | `user: User \| null` | `void` | Set user and update isSignedIn |
| `setRole` | `role: UserRole` | `void` | Update user's role ("rider" or "driver") |
| `updateProfile` | `updates: Pick<User, "fullName"> & Partial<Pick<User, "phone">>` | `void` | Merge updates into user object |
| `signOut` | — | `void` | Clear user and set isSignedIn to false |

### Usage Example

```tsx
import { useAuth } from "../../store/useAuth";

const { user, isSignedIn, setRole, updateProfile, signOut } = useAuth();
setRole("driver");
updateProfile({ fullName: "New Name", phone: "+1234567890" });
signOut();
```

---

## useLocation Store

**File:** `store/useLocation.ts`

**Purpose:** Manages location state for current position, pickup, and destination.

### State

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `currentLocation` | `Location \| null` | `null` | User's current GPS position |
| `pickup` | `Location \| null` | `null` | Selected pickup location |
| `destination` | `Location \| null` | `null` | Selected destination location |

### Actions

| Action | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `setCurrentLocation` | `location: Location` | `void` | Update current GPS position |
| `setPickup` | `location: Location \| null` | `void` | Set or clear pickup location |
| `setDestination` | `location: Location \| null` | `void` | Set or clear destination location |
| `clearLocations` | — | `void` | Clear pickup and destination (keeps currentLocation) |

### Usage Example

```tsx
import { useLocation } from "../../store/useLocation";

const { currentLocation, pickup, destination, setPickup, setDestination, clearLocations } = useLocation();
setPickup({ lat: 37.7749, lng: -122.4194, address: "123 Market St" });
setDestination({ lat: 37.7849, lng: -122.4094, address: "456 Union Square" });
clearLocations();
```

---

## useRide Store

**File:** `store/useRide.ts`

**Purpose:** Manages ride lifecycle state — from request through completion.

### State

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `currentRide` | `Ride \| null` | `null` | Active ride object |
| `driver` | `DriverInfo \| null` | `null` | Matched driver info |
| `fareEstimates` | `FareEstimate[]` | `[]` | Fare estimates for each ride type |
| `selectedRideType` | `RideType` | `"standard"` | Selected ride type |
| `isMatching` | `boolean` | `false` | Whether driver matching is in progress |
| `lastRating` | `RideRating \| null` | `null` | Last submitted rating |
| `paymentMethod` | `PaymentMethod` | `"card"` | Selected payment method |

### Actions

| Action | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `setCurrentRide` | `ride: Ride \| null` | `void` | Set or clear current ride |
| `setDriver` | `driver: DriverInfo \| null` | `void` | Set or clear matched driver |
| `setFareEstimates` | `estimates: FareEstimate[]` | `void` | Set fare estimates |
| `setSelectedRideType` | `type: RideType` | `void` | Set selected ride type |
| `setIsMatching` | `matching: boolean` | `void` | Set matching state |
| `updateDriverLocation` | `lat: number, lng: number` | `void` | Update driver's current position |
| `submitRating` | `stars: number, comment?: string` | `void` | Submit ride rating |
| `setPaymentMethod` | `method: PaymentMethod` | `void` | Set payment method |
| `clearRide` | — | `void` | Reset all ride state to defaults |

### Usage Example

```tsx
import { useRide } from "../../store/useRide";

const { currentRide, driver, fareEstimates, selectedRideType, isMatching, paymentMethod } = useRide();
const { setCurrentRide, setDriver, setFareEstimates, setSelectedRideType, setIsMatching, updateDriverLocation, submitRating, setPaymentMethod, clearRide } = useRide();

// Set fare estimates
setFareEstimates([
  { rideType: "standard", distance: 5.2, duration: 18, price: 15.50, currency: "USD" },
  { rideType: "comfort", distance: 5.2, duration: 18, price: 23.25, currency: "USD" },
]);

// Update driver location during ride
updateDriverLocation(37.7750, -122.4180);

// Submit rating after ride
submitRating(5, "Great ride!");

// Reset ride state
clearRide();
```

---

## useDriver Store

**File:** `store/useDriver.ts`

**Purpose:** Manages driver mode state — online/offline toggle, earnings, GPS tracking.

### State

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `isOnline` | `boolean` | `false` | Whether driver is accepting rides |
| `todayEarnings` | `number` | `0` | Today's earnings in USD |
| `todayRides` | `number` | `0` | Number of rides completed today |
| `incomingRideId` | `string \| null` | `null` | ID of incoming ride request |
| `locationSubscription` | `ExpoLocation.LocationSubscription \| null` | `null` | GPS tracking subscription |

### Actions

| Action | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `setOnline` | `online: boolean` | `void` | Set online state |
| `setTodayEarnings` | `earnings: number` | `void` | Update today's earnings |
| `setTodayRides` | `rides: number` | `void` | Update today's ride count |
| `setIncomingRide` | `rideId: string \| null` | `void` | Set or clear incoming ride ID |
| `goOnline` | — | `Promise<void>` | Request location permission, get initial position, start continuous GPS tracking, set isOnline |
| `goOffline` | — | `void` | Stop GPS tracking, set isOnline to false |

### Usage Example

```tsx
import { useDriver } from "../../store/useDriver";

const { isOnline, todayEarnings, todayRides, goOnline, goOffline } = useDriver();

// Go online — starts GPS tracking
await goOnline();

// Go offline — stops GPS tracking
goOffline();
```

### Notes
- `goOnline()` calls `ExpoLocation.requestForegroundPermissionsAsync()` internally
- GPS tracking updates `useLocation.setCurrentLocation()` every 25 meters or 10 seconds
- `goOffline()` removes the location subscription to prevent memory leaks

---

## useHistory Store

**File:** `store/useHistory.ts`

**Purpose:** Manages ride history with mock data for demo purposes.

### State

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `rides` | `Ride[]` | `MOCK_RIDES` (5 rides) | Array of ride history |

### Actions

| Action | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `addRide` | `ride: Ride` | `void` | Prepend ride to history array |
| `getRideById` | `id: string` | `Ride \| undefined` | Find ride by ID |

### Mock Data

5 pre-populated rides with relative dates:

| ID | Status | Ride Type | Days Ago | Route |
|----|--------|-----------|----------|-------|
| `ride-hist-001` | completed | standard | 1 | Market St -> Union Square |
| `ride-hist-002` | completed | comfort | 3 | Union Square -> Fisherman's Wharf |
| `ride-hist-003` | completed | premium | 5 | Golden Gate Park -> Market St |
| `ride-hist-004` | cancelled | standard | 7 | Union Square -> Dolores Park |
| `ride-hist-005` | completed | comfort | 10 | Market St -> North Beach |

### Usage Example

```tsx
import { useHistory } from "../../store/useHistory";

const { rides, addRide, getRideById } = useHistory();

// Get ride by ID for receipt screen
const ride = getRideById("ride-hist-001");

// Add new ride to history
addRide({
  id: "ride-new-001",
  riderId: "rider-123",
  status: "completed",
  pickup: { lat: 37.7749, lng: -122.4194, address: "123 Market St" },
  destination: { lat: 37.7849, lng: -122.4094, address: "456 Union Square" },
  rideType: "standard",
  fareEstimate: 12.50,
  fareFinal: 13.20,
  requestedAt: new Date().toISOString(),
  completedAt: new Date().toISOString(),
});
```

### Notes
- `daysAgo(days, hours, minutes)` helper generates ISO date strings relative to today
- Mock rides use San Francisco coordinates
- `getRideById` uses `Array.find()` — returns `undefined` if not found
