# Component API Reference

> All reusable components in the RideFlow frontend.

---

## Button

**File:** `components/ui/Button.tsx`

**Purpose:** Reusable button with 4 visual variants, loading state, and disabled state.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | required | Button text |
| `onPress` | `() => void` | required | Press handler |
| `variant` | `"primary" \| "secondary" \| "danger" \| "ghost"` | `"primary"` | Visual style |
| `disabled` | `boolean` | `false` | Disable button (reduces opacity) |
| `loading` | `boolean` | `false` | Show ActivityIndicator instead of text |
| `className` | `string` | `""` | Additional NativeWind classes |

### Variant Styles

| Variant | Background | Text Color |
|---------|------------|------------|
| `primary` | `bg-black` | `text-white` |
| `secondary` | `bg-gray-100 border border-gray-300` | `text-black` |
| `danger` | `bg-red-500` | `text-white` |
| `ghost` | `bg-transparent` | `text-black` |

### Usage Example

```tsx
import Button from "../../components/ui/Button";

<Button title="Confirm Ride" onPress={handleConfirm} variant="primary" />
<Button title="Cancel" onPress={handleCancel} variant="ghost" />
<Button title="Delete" onPress={handleDelete} variant="danger" disabled={isLoading} />
<Button title="Loading..." onPress={() => {}} loading />
```

### Dependencies
- `react-native`: TouchableOpacity, Text, ActivityIndicator

---

## Card

**File:** `components/ui/Card.tsx`

**Purpose:** White card container with border and rounded corners.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | required | Card content |
| `className` | `string` | `""` | Additional NativeWind classes |

### Default Styles
- `bg-white rounded-2xl border border-gray-100 p-4`

### Usage Example

```tsx
import Card from "../../components/ui/Card";

<Card>
  <Text>Card content here</Text>
</Card>

<Card className="mb-4">
  <Text>Card with extra margin</Text>
</Card>
```

### Dependencies
- `react-native`: View

---

## LoadingSpinner

**File:** `components/ui/LoadingSpinner.tsx`

**Purpose:** Centered loading indicator with optional message text.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | `undefined` | Optional loading message |

### Usage Example

```tsx
import LoadingSpinner from "../../components/ui/LoadingSpinner";

<LoadingSpinner />
<LoadingSpinner message="Finding drivers..." />
```

### Dependencies
- `react-native`: View, ActivityIndicator, Text

---

## RideMap

**File:** `components/map/RideMap.tsx`

**Purpose:** Google Maps component with markers, polylines, driver tracking, and location button.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showPickup` | `boolean` | `true` | Show pickup marker (black pin) |
| `showDestination` | `boolean` | `true` | Show destination marker (blue pin) |
| `showMyLocationButton` | `boolean` | `true` | Show crosshair "my location" button |
| `onMyLocationPress` | `() => void` | `undefined` | Custom handler for location button |
| `driverPosition` | `{ lat: number; lng: number }` | `undefined` | Driver marker position (green pin) |
| `rideStatus` | `RideStatus` | `undefined` | Controls polyline style |

### Polyline Behavior

| `rideStatus` | Polyline | Color | Style |
|--------------|----------|-------|-------|
| `"driver_arriving"` | Driver -> Pickup | Green (`#10B981`) | Solid, 3px |
| `"in_progress"` | Pickup -> Destination | Blue (`#3B82F6`) | Solid, 3px |
| `undefined` (no active ride) | Pickup -> Destination | Blue (`#3B82F6`) | Dashed `[12, 6]` |
| Other statuses | None | — | — |

### Behavior
- Auto-fits map region to show all markers when they change (with 1.5x padding)
- Animates to current location on first load (if no pickup/destination set)
- Falls back to San Francisco (37.7749, -122.4194) if no location available
- Crosshair button uses unicode characters (no icon library dependency)

### Usage Example

```tsx
import RideMap from "../../components/map/RideMap";

// Basic map with pickup and destination
<RideMap showPickup showDestination />

// Active ride with driver tracking
<RideMap
  showPickup={false}
  showDestination
  driverPosition={{ lat: 37.7750, lng: -122.4180 }}
  rideStatus="in_progress"
/>

// Driver mode — just show current location
<RideMap showPickup={false} showDestination={false} />
```

### Dependencies
- `react-native`: View, TouchableOpacity
- `react-native-maps`: MapView, Marker, Polyline, PROVIDER_GOOGLE, Region
- `store/useLocation`: currentLocation, pickup, destination
- `lib/location`: getRegionForCoordinates

---

## DriverInfoCard

**File:** `components/ride/DriverInfoCard.tsx`

**Purpose:** Displays driver information with avatar, rating, vehicle details, and action buttons.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `driver` | `DriverInfo` | required | Driver information object |
| `onCall` | `() => void` | `undefined` | Call button handler |
| `onMessage` | `() => void` | `undefined` | Message button handler |

### DriverInfo Interface

```ts
interface DriverInfo {
  id: string;
  fullName: string;
  avatarUrl?: string;
  rating: number;
  totalRides: number;
  vehicleMake: string;
  vehicleModel: string;
  vehicleColor: string;
  licensePlate: string;
  currentLat: number;
  currentLng: number;
}
```

### Sub-components

**StarRating** (internal): Renders 5-star rating with half-star support using unicode characters.

### Usage Example

```tsx
import DriverInfoCard from "../../components/ride/DriverInfoCard";

<DriverInfoCard
  driver={{
    id: "driver-1",
    fullName: "Charlie Brown",
    rating: 4.85,
    totalRides: 150,
    vehicleMake: "Toyota",
    vehicleModel: "Camry",
    vehicleColor: "Silver",
    licensePlate: "ABC-1234",
    currentLat: 37.7750,
    currentLng: -122.4180,
  }}
  onCall={() => console.log("Call driver")}
  onMessage={() => console.log("Message driver")}
/>
```

### Dependencies
- `react-native`: View, Text, Pressable
- `types/ride`: DriverInfo
- `components/ui/Card`: Card
