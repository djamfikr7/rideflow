# Decision Log

> Chronological log of all major decisions made during RideFlow development.

---

## 2026-05-27 — M1: Foundation

### D-001: Expo SDK 56 Managed Workflow
**Decision:** Use Expo SDK 56 with managed workflow instead of bare React Native.
**Reason:** Fastest path to working app; no native build config needed; all required modules available in Expo SDK.
**Outcome:** Successful — project scaffolded in minutes, no native build issues.

### D-002: NativeWind v4 for Styling
**Decision:** Use NativeWind v4.2.4 with Tailwind CSS 3.4.17 instead of StyleSheet.
**Reason:** Write Tailwind classes directly in className props; no StyleSheet boilerplate; consistent design system.
**Outcome:** Successful — faster UI development. Hit SafeAreaView limitation (className not supported), resolved with View wrapper.

### D-003: Zustand v5 for State Management
**Decision:** Use Zustand v5.0.13 with one store per domain instead of Redux.
**Reason:** Minimal API, no providers/boilerplate, works perfectly with TypeScript.
**Outcome:** Successful — 5 focused stores (useAuth, useLocation, useRide, useDriver, useHistory), each independently testable.

### D-004: Clerk for Authentication
**Decision:** Use Clerk v2.19.31 via @clerk/clerk-expo instead of custom auth.
**Reason:** Drop-in OAuth + email auth; handles token refresh, session management.
**Outcome:** Successful — auth flow works. Name conflict with useAuth hook resolved by aliasing Clerk's hook as useClerkAuth.

### D-005: Expo Router File-Based Routing
**Decision:** Use Expo Router v56.2.7 with file-based routing instead of React Navigation manual config.
**Reason:** Convention over configuration; folder structure = navigation structure.
**Outcome:** Successful — route groups (auth), (rider), (driver) with hidden tabs via href: null.

### D-006: Google Maps via react-native-maps
**Decision:** Use react-native-maps v1.27.2 with PROVIDER_GOOGLE instead of Apple Maps or Mapbox.
**Reason:** Best map quality; required for future Places Autocomplete and Directions API integration.
**Outcome:** Successful — map renders correctly, markers and polylines work.

### D-007: Separate Stores Per Domain
**Decision:** Create 4 separate Zustand stores (useAuth, useLocation, useRide, useDriver) instead of one global store.
**Reason:** Each store is focused and testable; avoids monolithic state object.
**Outcome:** Successful — clean separation of concerns, easy to reason about state.

### D-008: EXPO_PUBLIC_* Environment Variables
**Decision:** Use EXPO_PUBLIC_* prefix for client-side env vars instead of runtime config.
**Reason:** Only these are exposed to the client; secrets stay server-side.
**Outcome:** Successful — Clerk publishable key and Google Maps key loaded correctly.

### D-009: Axios with Interceptors
**Decision:** Use Axios v1.16.1 with request/response interceptors instead of fetch.
**Reason:** Centralized error handling, auth token injection (TODO), timeout config.
**Outcome:** Partial — interceptor stub exists but auth token injection not yet implemented.

### D-010: Socket.IO for Real-Time
**Decision:** Use socket.io-client v4.8.3 instead of raw WebSocket.
**Reason:** Auto-reconnection, room-based events, matches backend Socket.IO server.
**Outcome:** Successful — singleton pattern with getSocket/connectSocket/disconnectSocket.

---

## 2026-05-28 — M2: Ride Booking

### D-011: expo-location Geocoding
**Decision:** Use expo-location's geocodeAsync + reverseGeocodeAsync instead of Google Places API.
**Reason:** Built-in to Expo SDK; no additional API key or billing needed.
**Outcome:** Successful — geocodeSearch() helper with 5s timeout and 5-result limit works well.

### D-012: Haversine for Distance Calculation
**Decision:** Use haversine formula for client-side straight-line distance instead of Google Directions API.
**Reason:** No API calls; instant calculation; good enough for fare estimates.
**Outcome:** Successful — formatDistance() and estimateDurationMinutes() helpers provide reasonable estimates.

### D-013: Multi-Step Ride Request Pattern
**Decision:** Use internal state (showRideTypes) in request.tsx to switch between search -> preview -> ride type selection instead of separate routes.
**Reason:** Keeps all booking logic in one screen; avoids route proliferation.
**Outcome:** Successful — clean flow without extra navigation.

### D-014: Client-Side Fare Calculation
**Decision:** Calculate fares on the client using BASE_FARE + distance * PER_KM_RATE * multiplier + duration * PER_MINUTE_RATE.
**Reason:** Good enough for UI; real pricing would come from backend.
**Outcome:** Successful — fare estimates display correctly for all ride types.

### D-015: Mock Driver Matching
**Decision:** Simulate driver matching with 3-5s random delay and hardcoded mock driver instead of real backend.
**Reason:** Allows testing full ride flow without backend infrastructure.
**Outcome:** Successful — matching.tsx shows pulsing animation, then reveals driver info.

---

## 2026-05-28 — M3: Active Ride

### D-016: Simulated Driver Movement
**Decision:** Use setInterval with 15% interpolation per tick (every 2s) toward target instead of real GPS tracking.
**Reason:** Effective for demo; position snaps when within 0.00005 degrees.
**Outcome:** Successful — driver marker moves smoothly on map.

### D-017: Status-Aware Polylines
**Decision:** Different polyline colors/patterns per ride status instead of single style.
**Reason:** Visual feedback for ride state — green (arriving), blue (in-progress), dashed (preview).
**Outcome:** Successful — clear visual distinction between ride phases.

### D-018: Auto-Progression Simulation
**Decision:** Use setTimeout chain (3s -> 8s -> 15s) to advance through ride statuses instead of manual triggers.
**Reason:** Demo needs to show full lifecycle without backend.
**Outcome:** Successful — ride progresses through matched -> driver_arriving -> in_progress -> completed automatically.

### D-019: DriverInfoCard Extraction
**Decision:** Extract DriverInfoCard as standalone component early, used in both matching.tsx and active.tsx.
**Reason:** Reuse across screens; single source of truth for driver display.
**Outcome:** Successful — component reused in matching and active ride screens.

### D-020: Rating UI Pattern
**Decision:** Use conditional rendering (rating form vs receipt) in complete.tsx based on submitted state.
**Reason:** Single screen handles both rating submission and receipt display.
**Outcome:** Successful — clean flow from rating to receipt.

---

## 2026-05-28 — M4: Driver Mode

### D-021: Incoming Ride Countdown
**Decision:** Use 15-second countdown timer with visual progress indicator in incoming.tsx.
**Reason:** Creates urgency; simulates real ride request timeout.
**Outcome:** Successful — clear visual countdown with accept/reject actions.

### D-022: Driver Lifecycle Simulation
**Decision:** Simulate driver ride lifecycle (navigate -> arrive -> complete) using timed status transitions in active.tsx.
**Reason:** Demo needs to show driver-side flow without backend.
**Outcome:** Successful — driver can progress through ride states.

### D-023: Online/Offline Toggle with GPS
**Decision:** goOnline() in useDriver store starts continuous GPS tracking; goOffline() stops it.
**Reason:** Real driver mode needs location tracking for matching.
**Outcome:** Successful — GPS subscription managed correctly, no memory leaks.

---

## 2026-05-28 — M5: Payments & Polish

### D-024: Simulated Payment Flow
**Decision:** Use card/wallet/cash selection with 1s processing delay instead of real Stripe integration.
**Reason:** Stripe integration requires backend; simulated flow demonstrates UI.
**Outcome:** Successful — payment method selector with simulated card details (****4242).

### D-025: Ride History with Mock Data
**Decision:** useHistory store pre-populated with 5 realistic mock rides using relative dates.
**Reason:** Demonstrates history UI without backend; relative dates look realistic.
**Outcome:** Successful — FlatList with pull-to-refresh-ready structure.

### D-026: Receipt via URL Params
**Decision:** receipt.tsx uses useLocalSearchParams to get ride ID, fetches from useHistory store.
**Reason:** Standard Expo Router pattern; no extra navigation state needed.
**Outcome:** Successful — receipt displays full fare breakdown.

### D-027: Profile Folder Routing
**Decision:** Split profile.tsx into profile/index.tsx + profile/edit.tsx using folder-based routing.
**Reason:** Edit flow needs separate screen; folder routing is Expo Router convention.
**Outcome:** Successful — "Edit Profile" navigates to /profile/edit.

### D-028: Vitest over Jest
**Decision:** Use Vitest v4.1.7 with jsdom environment instead of Jest.
**Reason:** Faster execution, native TypeScript support, compatible with React Testing Library.
**Outcome:** Successful — 12 test files created, all passing.

### D-029: Express Microservices Architecture
**Decision:** Use Express v5 with service-based routing in single gateway process.
**Reason:** Socket.IO needs persistent connections; easy to split into microservices later.
**Outcome:** Successful — 4 services (auth, ride, matching, payment) mounted at /api/*.

### D-030: Prisma ORM
**Decision:** Use Prisma v6.9 with PostgreSQL instead of raw SQL or TypeORM.
**Reason:** Type-safe queries, schema-first approach, built-in migrations.
**Outcome:** Successful — 6 models (User, DriverProfile, Ride, Payment, Rating, Notification) with seed data.
