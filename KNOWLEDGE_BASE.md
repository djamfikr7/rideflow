# RideFlow Knowledge Base

> Living document — updated after each milestone. Last updated: 2026-05-28 (M1, M2, M3 complete; 41/48 verified).

---

## 1. Project Overview

**RideFlow** is a ride-hailing mobile application (Uber clone) built as a practical learning project following the "Practical Vibe Coding" methodology. Riders request rides, get matched with nearby drivers, track drivers in real-time, and pay via Stripe. Drivers accept rides, navigate to pickup, complete trips, and track earnings.

- **Project root:** `/home/fi/Documents/trae_projects/rideflow`
- **Spec:** `UBER_CLONE_SPEC.md`
- **Agent instructions:** `AGENTS.md`
- **Requirements traceability:** `RTM.md`

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | React Native + Expo | 0.85.3 / SDK 56 | Cross-platform mobile (managed workflow) |
| Language | TypeScript | 6.0.3 | Type safety (strict mode) |
| Routing | Expo Router | 56.2.7 | File-based routing with typed routes |
| Styling | NativeWind | 4.2.4 | Tailwind CSS for React Native via `className` props |
| State | Zustand | 5.0.13 | Lightweight global state management |
| Auth | Clerk | 2.19.31 | Email/password + OAuth (Google, Apple) |
| Maps | react-native-maps | 1.27.2 | Google Maps rendering with markers |
| Location | expo-location | 56.0.14 | GPS access, reverse geocoding |
| HTTP | axios | 1.16.1 | API client with interceptors |
| Real-time | socket.io-client | 4.8.3 | WebSocket ride status + location updates |
| Animation | react-native-reanimated | 4.3.1 | High-performance animations |
| Gestures | react-native-gesture-handler | 2.31.1 | Touch gesture handling |
| Navigation | react-native-screens | 4.25.2 | Native navigation primitives |
| Safe Area | react-native-safe-area-context | 5.7.0 | Device notch/inset handling |
| CSS Engine | tailwindcss | 3.4.17 | Utility-first CSS (NativeWind backend) |
| Token Storage | expo-secure-store | 56.0.4 | Secure token caching for Clerk |

**Backend (planned, not yet built):** Node.js + Express microservices, PostgreSQL 16 (Prisma), Redis 7, Socket.IO, BullMQ, Docker Compose.

---

## 3. Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Expo managed workflow | Fastest path to working app; no native build config needed |
| NativeWind v5 | Write Tailwind classes directly in RN components; no StyleSheet boilerplate |
| Zustand over Redux | Minimal API, no providers/boilerplate, works perfectly with TypeScript |
| Clerk for auth | Drop-in OAuth + email auth; handles token refresh, session management |
| react-native-maps (Google provider) | Best map quality; required for Places Autocomplete and Directions API |
| Expo Router file-based routing | Convention over configuration; folder structure = navigation structure |
| Axios with interceptors | Centralized error handling, auth token injection, timeout config |
| Socket.IO for real-time | Auto-reconnection, room-based events, matches backend Socket.IO server |
| Separate stores per domain | `useAuth`, `useLocation`, `useRide`, `useDriver` — each store is focused and testable |
| `EXPO_PUBLIC_*` env vars | Only these are exposed to the client; secrets stay server-side |
| Haversine for distance | Client-side straight-line distance without API calls; good enough for fare estimates |
| expo-location geocoding | Built-in geocoding/reverse geocoding; no Places Autocomplete dependency needed |
| Simulated ride lifecycle | Mock driver matching (3-5s), movement simulation (15% per tick), status auto-progression for demo |
| Status-aware polylines | Different polyline colors/patterns per ride status (green=arriving, blue=in-progress, dashed=preview) |
| Multi-step ride request | Search -> route preview -> ride type selection -> confirm; avoids overwhelming user |

---

## 4. Folder Structure

```
rideflow/
  app/                        # Expo Router screens (file = route)
    _layout.tsx               # Root layout: ClerkProvider + Stack navigator
    (auth)/                   # Auth flow (Stack navigator)
      _layout.tsx             # Auth Stack layout
      index.tsx               # Onboarding/welcome screen
      login.tsx               # Email/password login (Clerk useSignIn)
      register.tsx            # Registration with role selection (Clerk useSignUp)
    (rider)/                  # Rider tab group (Tabs navigator)
      _layout.tsx             # Rider Tabs layout (Home, History, Profile)
      index.tsx               # Home: map + "Where to?" search bar
      history.tsx             # Ride history (placeholder)
      profile.tsx             # Profile + sign out
      ride/                   # Ride flow (hidden from tabs)
        request.tsx           # Location search, route preview, ride type selection, fare estimate, confirm
        matching.tsx          # Driver matching animation, cancel, mock driver assignment
        active.tsx            # Active ride: map with driver tracking, status stepper, DriverInfoCard
        complete.tsx          # Ride completion: star rating, comment, receipt view
    (driver)/                 # Driver tab group (Tabs navigator)
      _layout.tsx             # Driver Tabs layout (Dashboard, Earnings, Profile)
      index.tsx               # Dashboard: online toggle + stats
      earnings.tsx            # Earnings history (placeholder)
      profile.tsx             # Profile + sign out
      ride/                   # Driver ride flow (hidden from tabs)
        incoming.tsx          # Incoming ride request (placeholder)
  components/
    ui/                       # Reusable UI primitives
      Button.tsx              # 4 variants: primary, secondary, danger, ghost
      Card.tsx                # White card with border and rounded corners
      LoadingSpinner.tsx      # Centered ActivityIndicator with optional message
    map/
      RideMap.tsx             # Google Map with markers, polylines, driver tracking, crosshair button
    ride/
      DriverInfoCard.tsx      # Driver avatar, star rating, vehicle info, call/message buttons
  lib/
    api.ts                    # Axios instance (baseURL from constants, auth interceptor stub)
    clerk.ts                  # ClerkProvider, tokenCache (expo-secure-store), publishableKey
    constants.ts              # API_URL, RIDE_TYPES, fare constants (BASE_FARE, PER_KM_RATE, PER_MINUTE_RATE), COLORS
    location.ts               # getCurrentLocation, reverseGeocode, geocodeSearch, haversineDistance, formatDistance, estimateDurationMinutes, getRegionForCoordinates
    socket.ts                 # Socket.IO singleton (getSocket, connectSocket, disconnectSocket)
    useAuth.ts                # Auth guard hook (redirect logic based on Clerk state)
  store/
    useAuth.ts                # User state: user, isSignedIn, setRole, signOut
    useLocation.ts            # Location state: currentLocation, pickup, destination
    useRide.ts                # Ride state: currentRide, driver, fareEstimates, selectedRideType, isMatching, lastRating, updateDriverLocation, submitRating, clearRide
    useDriver.ts              # Driver mode state: isOnline, todayEarnings, todayRides, incomingRideId
  types/
    ride.ts                   # Ride, RideStatus, RideType, Location, FareEstimate, DriverInfo, RideRating
    user.ts                   # User, UserRole, DriverProfile
    api.ts                    # ApiResponse<T>, ApiError, PaginatedResponse<T>
    declarations.d.ts         # CSS module type declaration
  assets/
    images/                   # App icons, splash screen, favicon
  global.css                  # Tailwind base/components/utilities imports
  tailwind.config.js          # Custom colors (primary, accent, success, danger), Inter font family
  babel.config.js             # expo preset + nativewind/babel + reanimated plugin
  metro.config.js             # Expo metro config wrapped with NativeWind
  nativewind-env.d.ts         # NativeWind TypeScript types
  tsconfig.json               # Extends expo/tsconfig.base, strict mode
  app.json                    # Expo config (name, icons, plugins)
  AGENTS.md                   # Agent instructions for building the project
  UBER_CLONE_SPEC.md          # Full implementation specification
  RTM.md                      # Requirements Traceability Matrix
  CHANGELOG.md                # Release history
```

---

## 5. Conventions

### Styling
- **ALL styling via NativeWind `className` props** — no `StyleSheet.create` unless NativeWind cannot achieve the effect.
- **SafeAreaView workaround:** Use `<View className="flex-1 bg-white">` instead of SafeAreaView with className (NativeWind limitation).
- **Color palette:** Primary = black/white, Accent = blue-500, Success = green-500, Danger = red-500, Neutral = gray-100/gray-500.
- **Font:** Inter family (inter, inter-bold, inter-semibold, inter-medium, inter-light) defined in tailwind.config.js.
- **Rounded elements:** `rounded-full` for buttons/pills, `rounded-2xl` for cards.
- **Map-first design:** Map takes full screen; UI overlays use absolute positioning or bottom panels.

### Code Patterns
- **State management:** One Zustand store per domain (auth, location, ride, driver). No middleware yet (AsyncStorage persistence planned for future).
- **Auth flow:** Clerk handles authentication; `useAuth()` hook in `lib/useAuth.ts` handles route protection via `useSegments` + `useEffect`.
- **Component structure:** Functional components with hooks. Props defined as interfaces above the component.
- **Navigation:** Expo Router file-based. Route groups in parentheses `(auth)`, `(rider)`, `(driver)`. Hidden routes use `href: null` in Tabs.Screen options.
- **Naming:** PascalCase for components/files, camelCase for functions/variables, UPPER_SNAKE for constants.
- **Imports:** Absolute imports not configured; use relative paths (e.g., `../../store/useLocation`).

### Prompt Structure (for AI agents)
Every prompt must follow the 4-part structure:
1. "Read the AGENTS.md file first and follow it strictly."
2. ONE task — what to build right now
3. Constraints — what already works that must not change
4. Optional — design reference or documentation

---

## 6. Current State

### Milestone Progress

| Milestone | Requirements | Verified | Status |
|-----------|-------------|----------|--------|
| M1: Foundation | 31 | 31 | **COMPLETE** |
| M2: Ride Booking | 6 | 0 | **IN PROGRESS** (REQ-2.1 assigned to Frontend Agent) |
| M3: Active Ride | 4 | 0 | Not started |
| M4: Driver Mode | 4 | 0 | Not started |
| M5: Payments & Polish | 3 | 0 | Not started |
| **Total** | **48** | **31** | **64.6% verified** |

### M1 Completion Summary (31/31 verified on 2026-05-27)
All foundation requirements verified in a single session across three task groups:
- **TASK-1.1:** Project scaffolding, NativeWind, Expo Router, types, stores, API client, UI components (REQ-1.1 through REQ-1.8, REQ-1.19)
- **TASK-1.2:** Clerk authentication — onboarding, login, register, role selection, auth guard (REQ-1.9 through REQ-1.12, REQ-1.20 through REQ-1.25)
- **TASK-1.3:** Rider home screen with map, location permissions, current location marker, "Where to?" bar (REQ-1.13 through REQ-1.18, REQ-1.26 through REQ-1.30)

### M2 Status
- **REQ-2.1 (Google Maps integration):** Assigned to Frontend Agent — `app/(rider)/ride/request.tsx` is currently a placeholder screen. Needs Places Autocomplete, route polyline, distance/time estimation.
- Screens `history.tsx`, `earnings.tsx`, `incoming.tsx` are still placeholder shells.

### TypeScript Status
- `npx tsc --noEmit` passes with **zero errors** (verified 2026-05-28).

### Git Status
- Single commit: `3aa962d Initial commit` on branch `master`.
- Working tree has uncommitted changes (new files from M1 work).

---

## 7. Key Files

### Configuration (must not change without careful consideration)
| File | Purpose |
|------|---------|
| `AGENTS.md` | Agent behavior rules, folder structure, styling rules, constraints |
| `UBER_CLONE_SPEC.md` | Full spec: architecture, DB schema, API endpoints, Socket.IO events |
| `RTM.md` | Requirements traceability — tracks all 48 requirements across 5 milestones |
| `tailwind.config.js` | Custom color tokens + Inter font family |
| `babel.config.js` | NativeWind + Reanimated babel plugins |
| `metro.config.js` | NativeWind metro integration |
| `app.json` | Expo app config (icons, plugins, orientation) |
| `package.json` | Dependencies and scripts |

### Core Architecture
| File | Purpose |
|------|---------|
| `app/_layout.tsx` | Root layout — imports global.css, wraps app in ClerkProvider, defines Stack |
| `lib/useAuth.ts` | Auth guard — redirects unauthenticated users to (auth), signed-in users to (rider) |
| `lib/clerk.ts` | Clerk config — publishableKey from env, tokenCache via expo-secure-store |
| `lib/constants.ts` | API_URL, RIDE_TYPES array, fare rate constants, COLORS object |
| `lib/api.ts` | Axios instance with base URL, auth token interceptor (TODO), error interceptor |
| `lib/location.ts` | Location helpers: getCurrentLocation, reverseGeocode, searchPlaces, getRegionForCoordinates |
| `lib/socket.ts` | Socket.IO singleton: getSocket, connectSocket(userId), disconnectSocket |

### State Management
| File | Purpose |
|------|---------|
| `store/useAuth.ts` | User auth state (user, isSignedIn, setRole, signOut) |
| `store/useLocation.ts` | Location state (currentLocation, pickup, destination) |
| `store/useRide.ts` | Ride state (currentRide, driver, fareEstimates, selectedRideType, isMatching) |
| `store/useDriver.ts` | Driver mode state (isOnline, todayEarnings, todayRides, incomingRideId) |

### UI Components
| File | Purpose |
|------|---------|
| `components/ui/Button.tsx` | Reusable button with 4 variants (primary, secondary, danger, ghost) |
| `components/ui/Card.tsx` | White card container with border |
| `components/ui/LoadingSpinner.tsx` | Centered loading indicator with message |
| `components/map/RideMap.tsx` | Google Map with pickup/destination markers, auto-centers on current location |

### Screens (working)
| File | Purpose |
|------|---------|
| `app/(auth)/index.tsx` | Onboarding — logo, tagline, "Get Started" + "I already have an account" |
| `app/(auth)/login.tsx` | Login — email/password with Clerk useSignIn |
| `app/(auth)/register.tsx` | Register — name/email/password + rider/driver role selection |
| `app/(rider)/index.tsx` | Rider home — full-screen map + "Where to?" bar + current location |
| `app/(rider)/profile.tsx` | Rider profile — avatar, menu items, sign out |
| `app/(driver)/index.tsx` | Driver dashboard — online toggle + earnings/rides/rating stats |
| `app/(driver)/profile.tsx` | Driver profile — avatar, menu items, sign out |

### Screens (placeholder — need implementation)
| File | Current State | Next Milestone |
|------|--------------|----------------|
| `app/(rider)/ride/request.tsx` | Placeholder text | M2 — ride type selection + fare estimate |
| `app/(rider)/history.tsx` | Placeholder text | M5 — ride history list |
| `app/(driver)/earnings.tsx` | Placeholder text | M5 — earnings history |
| `app/(driver)/ride/incoming.tsx` | Placeholder text | M4 — incoming ride request UI |

---

## 8. Dependencies

### Production Dependencies
| Package | Role |
|---------|------|
| `@clerk/clerk-expo` | Authentication SDK (email, OAuth, session management) |
| `axios` | HTTP client with interceptors for API calls |
| `expo` | Core Expo SDK (managed workflow runtime) |
| `expo-constants` | Access to app constants and config |
| `expo-linking` | Deep linking support |
| `expo-location` | GPS access, geocoding, reverse geocoding |
| `expo-router` | File-based routing for Expo apps |
| `expo-secure-store` | Encrypted key-value storage (Clerk token cache) |
| `expo-status-bar` | Status bar styling control |
| `nativewind` | Tailwind CSS for React Native (className props) |
| `react` | Core React (v19.2.3) |
| `react-native` | Core React Native (v0.85.3) |
| `react-native-gesture-handler` | Native touch gesture handling |
| `react-native-maps` | Google Maps / Apple Maps component |
| `react-native-reanimated` | High-performance UI thread animations |
| `react-native-safe-area-context` | Safe area insets for notched devices |
| `react-native-screens` | Native screen containers for navigation |
| `socket.io-client` | Real-time WebSocket communication |
| `tailwindcss` | Utility-first CSS engine (NativeWind backend) |
| `zustand` | Lightweight state management |

### Dev Dependencies
| Package | Role |
|---------|------|
| `@types/react` | TypeScript types for React |
| `typescript` | TypeScript compiler (strict mode) |

### Not Yet Installed (planned for future milestones)
| Package | Milestone | Purpose |
|---------|-----------|---------|
| `@stripe/stripe-react-native` | M5 | Payment processing |
| `react-native-google-places-autocomplete` | M2 | Places Autocomplete search |

---

## 9. Environment Variables

### Client-side (EXPO_PUBLIC_* — bundled in app)
| Variable | Purpose | Required For |
|----------|---------|-------------|
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk SDK authentication | Auth flow (M1) |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps SDK rendering | Map display (M1/M2) |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe SDK initialization | Payments (M5) |
| `EXPO_PUBLIC_API_URL` | Backend API base URL | API calls (default: `http://localhost:3000`) |
| `EXPO_PUBLIC_APP_NAME` | App display name | General |

### Server-side (never exposed to client)
| Variable | Purpose | Required For |
|----------|---------|-------------|
| `CLERK_SECRET_KEY` | Clerk admin API | Backend auth verification |
| `GOOGLE_MAPS_SERVER_KEY` | Google Maps server-side API | Directions, Distance Matrix |
| `STRIPE_SECRET_KEY` | Stripe payment processing | Backend payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification | Payment webhooks |
| `DATABASE_URL` | PostgreSQL connection string | Backend database |
| `REDIS_URL` | Redis connection string | Backend caching/pub-sub |

### Setup
1. Copy `.env.example` to `.env.local` (not tracked in git)
2. Get Clerk key from [dashboard.clerk.com](https://dashboard.clerk.com)
3. Get Google Maps key from [console.cloud.google.com](https://console.cloud.google.com) (enable Maps SDK for Android/iOS, Places API, Directions API)
4. Stripe keys from [dashboard.stripe.com](https://dashboard.stripe.com) (M5)

---

## 10. Lessons Learned

### NativeWind v5 + Expo Setup Quirks
- **SafeAreaView + className:** NativeWind `className` prop does NOT work on `react-native-safe-area-context` SafeAreaView. Workaround: use `<View className="flex-1 bg-white">` with `<StatusBar style="dark" />` inside.
- **CSS type declarations:** Need `types/declarations.d.ts` with `declare module "*.css"` to avoid TypeScript errors on CSS imports.
- **Babel config:** Must include both `babel-preset-expo` with `jsxImportSource: "nativewind"` AND `"nativewind/babel"` preset.
- **Metro config:** Must wrap Expo's default metro config with `withNativeWind(config, { input: "./global.css" })`.
- **Reanimated plugin:** Must be last in babel plugins array: `["react-native-reanimated/plugin"]`.

### Auth Flow Architecture
- Clerk's `useAuth` hook name conflicts with the project's custom auth guard. Solution: project imports Clerk as `useClerkAuth` (aliased in `lib/clerk.ts`), and the custom `useAuth()` in `lib/useAuth.ts` wraps it with route protection logic.
- Auth guard uses `useSegments()` to detect if user is in `(auth)` group, then redirects accordingly.
- Role-based routing (rider vs driver) is stored in Clerk's `unsafeMetadata` during registration. The auth guard currently always redirects to `(rider)` — role-based redirect is a TODO.

### TypeScript
- Extends `expo/tsconfig.base` with `strict: true` — all code must pass strict type checking.
- `npx tsc --noEmit` is the verification command (no emit, just type check).

### Map Integration
- `react-native-maps` uses `PROVIDER_GOOGLE` for Google Maps rendering.
- Default region falls back to San Francisco (37.7749, -122.4194) if no location available.
- `getRegionForCoordinates()` helper in `lib/location.ts` computes a bounding region for multiple coordinates with padding.

### Development Workflow
- **Practical Vibe Coding:** One feature at a time, verify it works, then move on.
- **Prompt structure:** Always 4 parts — Read AGENTS.md, one task, constraints, optional reference.
- **Verification checklist:** TypeScript passes, no console errors, existing features still work.
- **No library installs without approval:** Prevents dependency bloat and breaking changes.

### Known TODOs in Codebase
- `lib/api.ts`: Auth token injection in request interceptor (needs Clerk token integration)
- `lib/useAuth.ts`: Role-based redirect (rider vs driver) after login
- `app/(rider)/index.tsx`: Navigate to actual location search screen (currently goes to placeholder)
