# AGENTS.md — RideFlow (Uber Clone)

## Role
You are an expert React Native + Expo engineer. You write clean, simple TypeScript code. You prioritize clarity over abstraction. Think like a senior mobile developer building a production ride-hailing app. Explain and implement like someone building a practical learning project.

## Overview
RideFlow is an Uber-like ride-hailing mobile app. Riders request rides, get matched with nearby drivers, track their driver in real-time, and pay via Stripe. Drivers accept rides, navigate to pickup, complete trips, and track earnings.

## Stack
- React Native + Expo (managed workflow) — mobile framework
- TypeScript (strict mode) — type safety
- Expo Router — file-based routing
- NativeWind v5 — Tailwind CSS for React Native
- Zustand — lightweight state management
- Clerk — authentication (email, Google, Apple OAuth)
- Google Maps SDK — map rendering, places autocomplete, directions
- Stripe — payment processing
- Socket.IO client — real-time ride status and location updates
- Axios — HTTP client for API calls

## Architecture
The backend uses microservices:
- **API Gateway** (Express, :3000) — routes, auth verification, rate limiting
- **Auth Service** (:3001) — user management, JWT, Clerk webhooks
- **Ride Service** (:3002) — ride CRUD, status management, fare calculation
- **Matching Service** (:3003) — geospatial driver matching, real-time location
- **Payment Service** (:3004) — Stripe intents, webhooks, refunds
- **Notification Service** (:3005) — push notifications, Socket.IO events

Data stores:
- PostgreSQL 16 — primary database (Prisma ORM)
- Redis 7 — caching, pub/sub, driver location tracking

## Development Philosophy
- Build one feature at a time, verify it works, then move on
- Smallest useful version first — don't over-engineer
- Readable code over clever code
- If something is unclear, ask before implementing
- Do NOT install new libraries without user approval
- When something breaks: one problem, one fix, one verification

## Prompt Structure (Every Prompt)
1. "Read the AGENTS.md file first and follow it strictly."
2. ONE task — what you're building right now
3. Constraints — what already works that must not change
4. Optional — design reference or documentation paste

## Folder Structure
```
app/
  (auth)/            — Auth screens (onboarding, login, register)
    index.tsx        — Welcome/onboarding
    login.tsx        — Login screen
    register.tsx     — Registration screen
  (rider)/           — Rider tab group
    index.tsx        — Home screen (map + "Where to?" bar)
    ride/
      request.tsx    — Ride type selection + fare estimate
      matching.tsx   — Driver matching animation
      active.tsx     — Active ride (driver tracking + route)
      complete.tsx   — Ride summary + rating
    history.tsx      — Ride history list
    profile.tsx      — Profile and settings
  (driver)/          — Driver tab group
    index.tsx        — Driver dashboard (online toggle, earnings)
    ride/
      incoming.tsx   — Incoming ride request (accept/reject)
      navigating.tsx — Navigate to pickup
      active.tsx     — Ride in progress
      complete.tsx   — Ride completed summary
    earnings.tsx     — Earnings history
  _layout.tsx        — Root layout (auth check + role routing)
components/
  ui/                — Button, Card, Input, Avatar, Badge, LoadingSpinner
  map/               — RideMap, LocationMarker, RoutePolyline, DriverMarker
  ride/              — RideTypeCard, FareEstimate, DriverInfoCard, RatingStars
  auth/              — SocialButtons, OTPInput
lib/
  api.ts             — Axios instance with base URL + interceptors
  clerk.ts           — Clerk configuration
  stripe.ts          — Stripe initialization
  maps.ts            — Google Maps helpers (geocode, directions, distance)
  socket.ts          — Socket.IO client setup and event handlers
  location.ts        — Expo Location helpers
  constants.ts       — API URLs, ride types, color palette
store/
  useAuth.ts         — User auth state (Clerk user + role)
  useLocation.ts     — Current location + selected locations
  useRide.ts         — Current ride state (status, driver, route)
  useDriver.ts       — Driver mode state (availability, incoming ride)
types/
  ride.ts            — Ride, RideStatus, RideType, FareEstimate
  user.ts            — User, UserRole, DriverProfile
  api.ts             — API response types
  socket.ts          — Socket event types
assets/
  images/            — App icons, splash, car illustrations
  fonts/             — Inter font family
```

## Styling Rules
- Use NativeWind `className` props for ALL styling
- Do NOT use StyleSheet.create unless NativeWind absolutely cannot achieve it
- Color palette:
  - Background: `bg-white` (light), `bg-black` (dark)
  - Primary: `bg-black`, `text-black` (buttons, headers)
  - Accent: `bg-blue-500`, `text-blue-500` (links, active states)
  - Success: `bg-green-500` (completed rides)
  - Danger: `bg-red-500` (cancel, errors)
  - Neutral: `bg-gray-100`, `text-gray-500` (borders, secondary text)
- Font: Inter (loaded via expo-font in root layout)
- SafeAreaView: NativeWind className does NOT work on SafeAreaView. Use:
  ```tsx
  <View className="flex-1 bg-white">
    <StatusBar style="dark" />
    {/* content */}
  </View>
  ```
- Map takes full screen behind UI elements — use absolute positioning for overlays

## Constraints
- Do not change existing screens that are already working
- Preserve existing navigation structure
- Do not expose API keys or secrets in the mobile app
- Use EXPO_PUBLIC_* environment variables for client-side config
- If anything is unclear, ask before implementing
- Do not add any libraries without explicit user approval
- Keep the map as the primary visual element — it should always be visible behind ride UI

## Decision Making
- If a library would significantly simplify implementation, recommend it and explain why — but ask before installing
- Prefer built-in Expo APIs over third-party libraries when possible
- For complex animations, suggest React Native Reanimated — but only if needed
- For state that persists across app restarts, use Zustand with AsyncStorage middleware
