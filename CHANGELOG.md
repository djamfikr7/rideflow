# Changelog

All notable changes to RideFlow are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/).

---

## v0.3.0 — M3: Active Ride (2026-05-28)

### Added
- **Active ride screen** (`app/(rider)/ride/active.tsx`) — full-screen map with real-time driver tracking, 4-step status stepper (matched -> driver_arriving -> in_progress -> completed), trip details card, cancel/rate buttons
- **Ride completion screen** (`app/(rider)/ride/complete.tsx`) — 5-star rating with descriptive labels (Terrible/Poor/Okay/Good/Excellent), optional comment input, receipt view with route/driver/fare/rating summary
- **Driver info card** (`components/ride/DriverInfoCard.tsx`) — avatar with initial, star rating display (half-star support), ride count, vehicle details, license plate badge, call/message action buttons
- **Driver location tracking** — simulated driver movement (15% interpolation per 2s tick toward target), driver marker on map synced to store
- **Status-aware polylines** in `RideMap.tsx` — green polyline for driver_arriving (driver->pickup), blue for in_progress (pickup->destination), dashed blue for route preview
- **Ride status auto-progression** — demo simulation advances through statuses on timers (3s/8s/15s) with final fare variation
- **RideRating type** (`types/ride.ts`) — stars (1-5), optional comment, submittedAt timestamp
- **Store actions** — `updateDriverLocation(lat, lng)`, `submitRating(stars, comment?)`, `clearRide()` added to `useRide`

### Requirements Verified
- REQ-3.1: Real-time driver location tracking (TASK-11)
- REQ-3.2: Driver info card (TASK-12)
- REQ-3.3: Active ride route display with status-aware polylines (TASK-14)
- REQ-3.4: Ride completion + rating (TASK-13)

---

## v0.2.0 — M2: Ride Booking (2026-05-28)

### Added
- **Ride request screen** (`app/(rider)/ride/request.tsx`) — multi-step flow: location search -> route preview -> ride type selection -> confirm. Dual input fields (pickup/destination) with vertical dot-line connector, debounced geocoding search (500ms), fare calculation per ride type
- **Driver matching screen** (`app/(rider)/ride/matching.tsx`) — pulsing circle animation, "Searching for drivers..." with animated dots, cancel button, mock driver assignment after 3-5s delay, driver info reveal, "View Ride Details" navigation
- **Geocoding search** (`geocodeSearch()` in `lib/location.ts`) — forward-geocode query then reverse-geocode each result for human-readable addresses, 5s timeout, up to 5 results
- **Distance/duration helpers** — `haversineDistance()` (straight-line km), `formatDistance()` (km/m formatting), `estimateDurationMinutes()` (30 km/h urban average)
- **Fare estimation** — `BASE_FARE + distance * PER_KM_RATE * multiplier + duration * PER_MINUTE_RATE` for each ride type (Standard 1x, Comfort 1.5x, Premium 2x)
- **RideMap enhancements** — auto-fit region when markers change, "My Location" crosshair button, pickup/destination markers with distinct colors
- **Store additions** — `fareEstimates`, `selectedRideType`, `setSelectedRideType`, `setFareEstimates`, `setIsMatching` in `useRide`
- **Fare constants** (`lib/constants.ts`) — `BASE_FARE` ($2.50), `PER_KM_RATE` ($1.50/km), `PER_MINUTE_RATE` ($0.20/min)

### Changed
- `app/(rider)/index.tsx` — "Where to?" search bar now navigates to `/ride/request` instead of placeholder
- `components/map/RideMap.tsx` — added `driverPosition`, `rideStatus` props, polyline rendering, auto-fit logic
- `store/useRide.ts` — expanded with fare/matching state and actions
- `types/ride.ts` — added `fareFinal`, `distanceKm`, `durationMinutes`, `matchedAt`, `startedAt`, `completedAt` fields to Ride

### Requirements Verified
- REQ-2.1: Google Maps integration (TASK-8)
- REQ-2.2: Location search with geocoding (TASK-9)
- REQ-2.3: Route display with polyline + distance (TASK-6)
- REQ-2.4: Ride type selection + fare estimate (TASK-7)
- REQ-2.5: Fare estimate calculation (TASK-7)
- REQ-2.6: Ride request + matching flow (TASK-10)

---

## v0.1.0 — M1: Foundation (2026-05-27)

### Added
- **Project scaffolding** — Expo SDK 56, TypeScript strict mode, NativeWind v5, Expo Router file-based routing
- **Folder structure** — `app/`, `components/`, `lib/`, `store/`, `types/`, `assets/`
- **TypeScript types** — `Ride`, `RideStatus`, `RideType`, `Location`, `FareEstimate`, `DriverInfo`, `User`, `UserRole`, `ApiResponse<T>`
- **Zustand stores** — `useAuth`, `useLocation`, `useRide`, `useDriver`
- **API client** — Axios instance with base URL, Socket.IO singleton, constants (API_URL, RIDE_TYPES, COLORS)
- **UI components** — Button (4 variants), Card, LoadingSpinner
- **Auth flow** — Clerk integration, onboarding screen, login (email/password), registration with role selection (rider/driver), auth guard with route protection
- **Rider home screen** — full-screen Google Map, location permissions, current location marker, "Where to?" search bar overlay
- **Rider screens** — history (placeholder), profile with sign out
- **Driver screens** — dashboard with online toggle + stats, earnings (placeholder), profile with sign out
- **Map component** (`RideMap.tsx`) — Google Maps provider, pickup/destination markers, auto-centers on current location
- **Location helpers** (`lib/location.ts`) — getCurrentLocation, reverseGeocode, searchPlaces, getRegionForCoordinates
- **Configuration** — tailwind.config.js (custom colors, Inter font), babel.config.js (NativeWind + Reanimated), metro.config.js (NativeWind wrapper)

### Requirements Verified
- REQ-1.1 through REQ-1.30 (31 requirements across TASK-1.1, TASK-1.2, TASK-1.3)
