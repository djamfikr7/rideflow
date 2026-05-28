# RideFlow Knowledge Base

> Structured wiki for the RideFlow Uber clone project. Last updated: 2026-05-28 (ALL MILESTONES COMPLETE; 48/48 verified).

---

## Wiki Structure

This knowledge base is split into focused, self-contained sections for easier querying:

| Section | File | Description |
|---------|------|-------------|
| **Master Index** | [KNOWLEDGE_BASE/INDEX.md](KNOWLEDGE_BASE/INDEX.md) | Quick reference table for every file, store, component, and lib module |
| **Architecture Decisions** | [KNOWLEDGE_BASE/ADRS.md](KNOWLEDGE_BASE/ADRS.md) | 10 Architecture Decision Records (ADRs) |
| **Store API Reference** | [KNOWLEDGE_BASE/STORES.md](KNOWLEDGE_BASE/STORES.md) | Zustand store state, actions, and usage examples |
| **Component API Reference** | [KNOWLEDGE_BASE/COMPONENTS.md](KNOWLEDGE_BASE/COMPONENTS.md) | Component props, usage, and dependencies |
| **Lib Module Reference** | [KNOWLEDGE_BASE/LIBS.md](KNOWLEDGE_BASE/LIBS.md) | Library module exports, signatures, and types |
| **Backend Service Reference** | [KNOWLEDGE_BASE/BACKEND.md](KNOWLEDGE_BASE/BACKEND.md) | Express endpoints, Socket.IO events, database models |
| **Decision Log** | [KNOWLEDGE_BASE/DECISIONS.md](KNOWLEDGE_BASE/DECISIONS.md) | Chronological log of 30 development decisions |
| **Lessons Learned** | [KNOWLEDGE_BASE/LESSONS.md](KNOWLEDGE_BASE/LESSONS.md) | Issues found, fixes applied, patterns that worked |
| **Agent Context Summaries** | [KNOWLEDGE_BASE/AGENTS.md](KNOWLEDGE_BASE/AGENTS.md) | What each agent type needs to know |

---

## 1. Project Overview

**RideFlow** is a ride-hailing mobile application (Uber clone) built as a practical learning project following the "Practical Vibe Coding" methodology. Riders request rides, get matched with nearby drivers, track drivers in real-time, and pay via simulated Stripe. Drivers accept rides, navigate to pickup, complete trips, and track earnings.

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

**Backend:** Node.js 20+ / Express 5.1 / Prisma 6.9 / PostgreSQL 16 / Socket.IO 4.8 / Zod 3.25 / bcryptjs / jsonwebtoken

---

## 3. Project Statistics

| Metric | Count |
|--------|-------|
| Frontend source files (.ts/.tsx) | 42 |
| Backend source files (.ts) | 12 |
| Zustand stores | 5 |
| Screens | 15 |
| UI components | 5 |
| Type definition files | 4 |
| Library modules | 6 |
| Backend services | 4 |
| Database models | 6 |
| Test files | 12 |
| Milestones completed | 5/5 |
| Frontend requirements verified | 48/48 |
| TypeScript errors | 0 |

---

## 4. Milestone Progress

| Milestone | Requirements | Verified | Status |
|-----------|-------------|----------|--------|
| M1: Foundation | 31 | 31 | **COMPLETE** |
| M2: Ride Booking | 6 | 6 | **COMPLETE** |
| M3: Active Ride | 4 | 4 | **COMPLETE** |
| M4: Driver Mode | 4 | 4 | **COMPLETE** |
| M5: Payments & Polish | 3 | 3 | **COMPLETE** |
| **Total** | **48** | **48** | **100% verified** |

---

## 5. Folder Structure

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
      history.tsx             # Ride history list with 5 mock rides
      profile/
        index.tsx             # Profile view + "Edit Profile" link + sign out
        edit.tsx              # Profile editing: full name + phone number fields
      ride/                   # Ride flow (hidden from tabs)
        request.tsx           # Location search, route preview, ride type selection
        matching.tsx          # Driver matching animation, cancel, mock driver assignment
        active.tsx            # Active ride: map with driver tracking, status stepper
        payment.tsx           # Payment: fare summary, card/wallet/cash selection
        complete.tsx          # Ride completion: star rating, comment, receipt view
        receipt.tsx           # Historical receipt: route, driver, fare breakdown
    (driver)/                 # Driver tab group (Tabs navigator)
      _layout.tsx             # Driver Tabs layout (Dashboard, Earnings, Profile)
      index.tsx               # Dashboard: online toggle + stats
      earnings.tsx            # Earnings history (daily/weekly stats)
      profile.tsx             # Profile + sign out
      ride/                   # Driver ride flow (hidden from tabs)
        incoming.tsx          # Incoming ride request (15s countdown, accept/reject)
        active.tsx            # Driver active ride (navigate -> arrive -> complete)
  components/
    ui/                       # Reusable UI primitives
      Button.tsx              # 4 variants: primary, secondary, danger, ghost
      Card.tsx                # White card with border and rounded corners
      LoadingSpinner.tsx      # Centered ActivityIndicator with optional message
    map/
      RideMap.tsx             # Google Map with markers, polylines, driver tracking
    ride/
      DriverInfoCard.tsx      # Driver avatar, star rating, vehicle info, call/message
  lib/
    api.ts                    # Axios instance (baseURL from constants, auth interceptor stub)
    clerk.ts                  # ClerkProvider, tokenCache (expo-secure-store), publishableKey
    constants.ts              # API_URL, RIDE_TYPES, fare constants, COLORS
    location.ts               # getCurrentLocation, reverseGeocode, geocodeSearch, haversineDistance
    socket.ts                 # Socket.IO singleton (getSocket, connectSocket, disconnectSocket)
    useAuth.ts                # Auth guard hook (redirect logic based on Clerk state)
  store/
    useAuth.ts                # User state: user, isSignedIn, setRole, updateProfile, signOut
    useLocation.ts            # Location state: currentLocation, pickup, destination
    useRide.ts                # Ride state: currentRide, driver, fareEstimates, matching, payment
    useDriver.ts              # Driver mode state: isOnline, todayEarnings, goOnline/goOffline
    useHistory.ts             # Ride history: rides array with 5 mock rides
  types/
    ride.ts                   # Ride, RideStatus, RideType, Location, FareEstimate, DriverInfo
    user.ts                   # User, UserRole, DriverProfile
    api.ts                    # ApiResponse<T>, ApiError, PaginatedResponse<T>
    declarations.d.ts         # CSS module type declaration
  __tests__/                  # Vitest tests
    components/               # Component tests (Button, Card, DriverInfoCard, LoadingSpinner)
    lib/                      # Lib tests (constants, location)
    store/                    # Store tests (useAuth, useDriver, useHistory, useLocation, useRide)
    __mocks__/                # React Native mock + render helper
  backend/
    src/
      gateway.ts              # Express API gateway + Socket.IO
      services/
        auth.ts               # Auth endpoints (register, login, me, profile)
        ride.ts               # Ride endpoints (create, get, status, history, cancel, rate)
        matching.ts           # Matching endpoints (find-driver, accept, reject, location)
        payment.ts            # Payment endpoints (process, history, get)
        notification.ts       # Socket.IO setup + event handlers
      middleware/
        auth.ts               # JWT authenticate + requireRole
        errorHandler.ts       # Global error handler
      utils/
        errors.ts             # Error classes (AppError, NotFound, etc.)
        fare.ts               # Fare calculation + haversine + surge pricing
        jwt.ts                # JWT sign/verify/extract
        prisma.ts             # Prisma client singleton
    prisma/
      seed.ts                 # Database seed (2 riders, 3 drivers, 3 rides)
    package.json              # Backend dependencies
  KNOWLEDGE_BASE/             # Split wiki files (this directory)
  tailwind.config.js          # Custom colors + Inter font family
  babel.config.js             # expo preset + nativewind/babel + reanimated plugin
  metro.config.js             # Expo metro config wrapped with NativeWind
  vitest.config.ts            # Vitest config: jsdom, react-native mock, v8 coverage
  tsconfig.json               # Extends expo/tsconfig.base, strict mode
  app.json                    # Expo config (name, icons, plugins)
  package.json                # Frontend dependencies
```

---

## 6. Conventions

### Styling
- **ALL styling via NativeWind `className` props** — no `StyleSheet.create` unless NativeWind cannot achieve the effect.
- **SafeAreaView workaround:** Use `<View className="flex-1 bg-white">` instead of SafeAreaView with className.
- **Color palette:** Primary = black/white, Accent = blue-500, Success = green-500, Danger = red-500, Neutral = gray-100/gray-500.
- **Font:** Inter family defined in tailwind.config.js.
- **Rounded elements:** `rounded-full` for buttons/pills, `rounded-2xl` for cards.
- **Map-first design:** Map takes full screen; UI overlays use absolute positioning or bottom panels.

### Code Patterns
- **State management:** One Zustand store per domain. No middleware yet.
- **Auth flow:** Clerk handles authentication; `useAuth()` in `lib/useAuth.ts` handles route protection.
- **Component structure:** Functional components with hooks. Props defined as interfaces above the component.
- **Navigation:** Expo Router file-based. Route groups in parentheses `(auth)`, `(rider)`, `(driver)`.
- **Naming:** PascalCase for components/files, camelCase for functions/variables, UPPER_SNAKE for constants.
- **Imports:** Relative paths (e.g., `../../store/useLocation`).

### Backend Patterns
- **Validation:** Zod schemas for all request bodies.
- **Error handling:** Custom error classes (AppError hierarchy) caught by global errorHandler middleware.
- **Authentication:** JWT with 7-day expiry. Token in Authorization header.
- **Authorization:** requireRole middleware checks user.role against allowed roles.
- **Real-time:** Socket.IO rooms for user/rider/driver/ride-specific events.

---

## 7. Environment Variables

### Client-side (EXPO_PUBLIC_*)

| Variable | Purpose | Required For |
|----------|---------|-------------|
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk SDK authentication | Auth flow |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps SDK rendering | Map display |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe SDK initialization | Payments (future) |
| `EXPO_PUBLIC_API_URL` | Backend API base URL | API calls (default: `http://localhost:3000`) |

### Server-side (never exposed to client)

| Variable | Purpose | Required For |
|----------|---------|-------------|
| `JWT_SECRET` | JWT signing secret | Backend auth |
| `DATABASE_URL` | PostgreSQL connection string | Backend database |
| `CLERK_SECRET_KEY` | Clerk admin API | Backend auth verification |
| `STRIPE_SECRET_KEY` | Stripe payment processing | Backend payments |
| `PORT` | Server port | Backend (default: 3000) |
| `CORS_ORIGIN` | Allowed CORS origins | Backend (default: localhost:5173,8000,19006) |

---

## 8. Key Commands

### Frontend

```bash
# From project root
npx expo start              # Start Expo dev server
npx tsc --noEmit            # TypeScript check (must pass with 0 errors)
npx vitest run              # Run all tests
npx vitest --watch          # Watch mode
npx vitest --coverage       # With coverage report
```

### Backend

```bash
# From backend/
npm run dev                 # Start dev server with tsx
npm run build               # Compile TypeScript
npm run start               # Start production server
npm run db:generate         # Generate Prisma client
npm run db:push             # Push schema to database
npm run db:migrate          # Create migration
npm run db:seed             # Seed database with test data
npm run db:reset            # Reset + reseed database
npm run typecheck           # TypeScript check
```

---

## 9. Quick Links

- **Spec:** `UBER_CLONE_SPEC.md`
- **Agent instructions:** `AGENTS.md`
- **Requirements traceability:** `RTM.md`
- **Changelog:** `CHANGELOG.md`
- **Full wiki index:** `KNOWLEDGE_BASE/INDEX.md`
