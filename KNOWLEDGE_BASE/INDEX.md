# RideFlow Knowledge Base — Master Index

> Structured wiki for the RideFlow Uber clone project. Last updated: 2026-05-28.

---

## How to Use This Wiki

Each section is self-contained and can be read independently. Use this index to navigate to the relevant section.

| Section | File | Description |
|---------|------|-------------|
| Quick Reference | [INDEX.md](INDEX.md#quick-reference) | One-line summary of every file, store, component, and lib module |
| ADRs | [ADRS.md](ADRS.md) | Architecture Decision Records (10 decisions) |
| Store API Reference | [STORES.md](STORES.md) | Zustand store state, actions, and usage examples |
| Component API Reference | [COMPONENTS.md](COMPONENTS.md) | Component props, usage, and dependencies |
| Lib Module Reference | [LIBS.md](LIBS.md) | Library module exports, signatures, and types |
| Backend Service Reference | [BACKEND.md](BACKEND.md) | Express service endpoints, models, and Socket.IO events |
| Decision Log | [DECISIONS.md](DECISIONS.md) | Chronological log of all development decisions |
| Lessons Learned | [LESSONS.md](LESSONS.md) | Issues found, fixes applied, patterns that worked |
| Agent Context Summaries | [AGENTS.md](AGENTS.md) | What each agent type needs to know |

---

## Project Summary

**RideFlow** is a ride-hailing mobile application (Uber clone) built with React Native + Expo (frontend) and Node.js + Express + Prisma (backend). Riders request rides, get matched with drivers, track drivers in real-time, and pay via simulated Stripe. Drivers accept rides, navigate to pickup, complete trips, and track earnings.

| Metric | Value |
|--------|-------|
| Source files (.ts/.tsx) | 42 frontend + 12 backend |
| Zustand stores | 5 |
| Screens | 15 |
| UI components | 5 |
| Type definition files | 4 |
| Library modules | 6 |
| Backend services | 4 (auth, ride, matching, payment) |
| Milestones completed | 5/5 |
| Frontend requirements verified | 48/48 |
| TypeScript errors | 0 |

---

## Quick Reference

### Frontend Files

| File | Purpose |
|------|---------|
| `app/_layout.tsx` | Root layout: imports global.css, wraps in ClerkProvider, defines Stack |
| `app/(auth)/_layout.tsx` | Auth Stack navigator layout |
| `app/(auth)/index.tsx` | Onboarding screen: logo, tagline, Get Started + Sign In buttons |
| `app/(auth)/login.tsx` | Login: email/password with Clerk useSignIn |
| `app/(auth)/register.tsx` | Registration: name/email/password + rider/driver role selection |
| `app/(rider)/_layout.tsx` | Rider Tabs layout (Home, History, Profile) |
| `app/(rider)/index.tsx` | Rider home: full-screen map + "Where to?" search bar |
| `app/(rider)/history.tsx` | Ride history list: 5 mock rides, status badges, tap for receipt |
| `app/(rider)/profile/index.tsx` | Profile view: avatar, menu items, Edit Profile link, sign out |
| `app/(rider)/profile/edit.tsx` | Profile editing: full name + phone number fields, save/cancel |
| `app/(rider)/ride/request.tsx` | Multi-step ride request: search -> preview -> ride type -> confirm |
| `app/(rider)/ride/matching.tsx` | Driver matching: pulsing animation, cancel, mock driver assignment |
| `app/(rider)/ride/active.tsx` | Active ride: map with driver tracking, status stepper, DriverInfoCard |
| `app/(rider)/ride/payment.tsx` | Payment: fare summary, card/wallet/cash selector, 1s processing |
| `app/(rider)/ride/complete.tsx` | Ride completion: 5-star rating, comment, receipt view |
| `app/(rider)/ride/receipt.tsx` | Historical receipt: route, driver, fare breakdown, status badge |
| `app/(driver)/_layout.tsx` | Driver Tabs layout (Dashboard, Earnings, Profile) |
| `app/(driver)/index.tsx` | Driver dashboard: online toggle + stats |
| `app/(driver)/earnings.tsx` | Earnings history: daily/weekly stats |
| `app/(driver)/profile.tsx` | Driver profile: avatar, menu items, sign out |
| `app/(driver)/ride/incoming.tsx` | Incoming ride request: 15s countdown, accept/reject |
| `app/(driver)/ride/active.tsx` | Driver active ride: navigate -> arrive -> complete lifecycle |

### Components

| File | Purpose |
|------|---------|
| `components/ui/Button.tsx` | Reusable button: 4 variants (primary, secondary, danger, ghost) |
| `components/ui/Card.tsx` | White card container with border and rounded corners |
| `components/ui/LoadingSpinner.tsx` | Centered ActivityIndicator with optional message |
| `components/map/RideMap.tsx` | Google Map with markers, polylines, driver tracking, crosshair button |
| `components/ride/DriverInfoCard.tsx` | Driver avatar, star rating, vehicle info, call/message buttons |

### Stores

| File | Purpose |
|------|---------|
| `store/useAuth.ts` | User auth state: user, isSignedIn, setRole, updateProfile, signOut |
| `store/useLocation.ts` | Location state: currentLocation, pickup, destination |
| `store/useRide.ts` | Ride state: currentRide, driver, fareEstimates, matching, payment |
| `store/useDriver.ts` | Driver mode: isOnline, todayEarnings, goOnline/goOffline with GPS tracking |
| `store/useHistory.ts` | Ride history: rides array with 5 mock rides, addRide, getRideById |

### Library Modules

| File | Purpose |
|------|---------|
| `lib/api.ts` | Axios instance: baseURL from constants, auth interceptor stub, error interceptor |
| `lib/clerk.ts` | Clerk config: ClerkProvider, tokenCache (expo-secure-store), publishableKey |
| `lib/constants.ts` | API_URL, RIDE_TYPES array, fare constants (BASE_FARE, PER_KM_RATE, PER_MINUTE_RATE), COLORS |
| `lib/location.ts` | Location helpers: getCurrentLocation, reverseGeocode, geocodeSearch, haversineDistance, formatDistance, estimateDurationMinutes, getRegionForCoordinates |
| `lib/socket.ts` | Socket.IO singleton: getSocket, connectSocket(userId), disconnectSocket |
| `lib/useAuth.ts` | Auth guard hook: redirects based on Clerk state + route segments |

### Type Definitions

| File | Purpose |
|------|---------|
| `types/ride.ts` | Ride, RideStatus, RideType, Location, FareEstimate, DriverInfo, PaymentMethod, RideRating |
| `types/user.ts` | User, UserRole, DriverProfile |
| `types/api.ts` | ApiResponse<T>, ApiError, PaginatedResponse<T> |
| `types/declarations.d.ts` | CSS module type declaration for NativeWind |

### Backend Files

| File | Purpose |
|------|---------|
| `backend/src/gateway.ts` | Express API gateway: HTTP server, Socket.IO, route mounting, health check |
| `backend/src/services/auth.ts` | Auth service: register, login, me, profile update, driver profile CRUD |
| `backend/src/services/ride.ts` | Ride service: create ride, get ride, update status, history, cancel, rate |
| `backend/src/services/matching.ts` | Matching service: find drivers, accept/reject ride, driver location/availability |
| `backend/src/services/payment.ts` | Payment service: process payment (simulated), history, get payment details |
| `backend/src/services/notification.ts` | Socket.IO setup: auth middleware, driver online/offline, location updates, ride rooms |
| `backend/src/middleware/auth.ts` | JWT authentication middleware + role-based authorization |
| `backend/src/middleware/errorHandler.ts` | Global error handler: AppError, Zod, Prisma errors |
| `backend/src/utils/errors.ts` | Error classes: AppError, NotFoundError, UnauthorizedError, ForbiddenError, BadRequestError, ConflictError |
| `backend/src/utils/fare.ts` | Fare calculation: calculateFare, haversineDistance, estimateDuration, surge pricing |
| `backend/src/utils/jwt.ts` | JWT utilities: signToken, verifyToken, extractTokenFromHeader |
| `backend/src/utils/prisma.ts` | Prisma client singleton |
| `backend/prisma/seed.ts` | Database seed: 2 riders, 3 drivers, 3 rides, 2 ratings, 1 payment, 2 notifications |

### Configuration Files

| File | Purpose |
|------|---------|
| `app.json` | Expo app config (name, icons, plugins, orientation) |
| `package.json` | Frontend dependencies and scripts |
| `backend/package.json` | Backend dependencies and scripts |
| `tailwind.config.js` | Custom colors (primary, accent, success, danger), Inter font family |
| `babel.config.js` | expo preset + nativewind/babel + reanimated plugin |
| `metro.config.js` | Expo metro config wrapped with NativeWind |
| `tsconfig.json` | Extends expo/tsconfig.base, strict mode |
| `vitest.config.ts` | Vitest config: jsdom environment, react-native mock alias, v8 coverage |
| `AGENTS.md` | Agent instructions for building the project |
| `UBER_CLONE_SPEC.md` | Full implementation specification |
| `RTM.md` | Requirements Traceability Matrix (48 requirements) |
| `CHANGELOG.md` | Release history (v0.1.0 through v0.5.0) |

### Test Files

| File | Purpose |
|------|---------|
| `__tests__/components/Button.test.tsx` | Button component tests |
| `__tests__/components/Card.test.tsx` | Card component tests |
| `__tests__/components/DriverInfoCard.test.tsx` | DriverInfoCard component tests |
| `__tests__/components/LoadingSpinner.test.tsx` | LoadingSpinner component tests |
| `__tests__/lib/constants.test.ts` | Constants module tests |
| `__tests__/lib/location.test.ts` | Location module tests |
| `__tests__/store/useAuth.test.ts` | Auth store tests |
| `__tests__/store/useDriver.test.ts` | Driver store tests |
| `__tests__/store/useHistory.test.ts` | History store tests |
| `__tests__/store/useLocation.test.ts` | Location store tests |
| `__tests__/store/useRide.test.ts` | Ride store tests |
| `__tests__/__mocks__/react-native.tsx` | React Native mock for Vitest |
| `__tests__/__mocks__/render-helper.tsx` | Test render helper with providers |

---

## Query Index

Alphabetical index of key terms with file references.

| Term | Location |
|------|----------|
| `addRide` | `store/useHistory.ts` |
| `ApiResponse<T>` | `types/api.ts` |
| `authenticate` | `backend/src/middleware/auth.ts` |
| `BASE_FARE` | `lib/constants.ts`, `backend/src/utils/fare.ts` |
| `Button` | `components/ui/Button.tsx` |
| `calculateFare` | `backend/src/utils/fare.ts` |
| `Card` | `components/ui/Card.tsx` |
| `clearRide` | `store/useRide.ts` |
| `ClerkProvider` | `lib/clerk.ts` |
| `COLORS` | `lib/constants.ts` |
| `connectSocket` | `lib/socket.ts` |
| `currentLocation` | `store/useLocation.ts` |
| `DriverInfo` | `types/ride.ts` |
| `DriverInfoCard` | `components/ride/DriverInfoCard.tsx` |
| `DriverProfile` | `types/user.ts` |
| `estimateDuration` | `backend/src/utils/fare.ts` |
| `estimateDurationMinutes` | `lib/location.ts` |
| `FareEstimate` | `types/ride.ts`, `backend/src/utils/fare.ts` |
| `formatDistance` | `lib/location.ts` |
| `geocodeSearch` | `lib/location.ts` |
| `getCurrentLocation` | `lib/location.ts` |
| `getRegionForCoordinates` | `lib/location.ts` |
| `getRideById` | `store/useHistory.ts` |
| `getSocket` | `lib/socket.ts` |
| `goOnline` | `store/useDriver.ts` |
| `goOffline` | `store/useDriver.ts` |
| `haversineDistance` | `lib/location.ts`, `backend/src/utils/fare.ts` |
| `HistoryState` | `store/useHistory.ts` |
| `isMatching` | `store/useRide.ts` |
| `isOnline` | `store/useDriver.ts` |
| `isSignedIn` | `store/useAuth.ts` |
| `Location` | `types/ride.ts` |
| `LoadingSpinner` | `components/ui/LoadingSpinner.tsx` |
| `LocationState` | `store/useLocation.ts` |
| `PaymentMethod` | `types/ride.ts` |
| `PER_KM_RATE` | `lib/constants.ts`, `backend/src/utils/fare.ts` |
| `PER_MINUTE_RATE` | `lib/constants.ts`, `backend/src/utils/fare.ts` |
| `Ride` | `types/ride.ts` |
| `RideMap` | `components/map/RideMap.tsx` |
| `RideRating` | `types/ride.ts` |
| `RideState` | `store/useRide.ts` |
| `RideStatus` | `types/ride.ts` |
| `RideType` | `types/ride.ts` |
| `RIDE_TYPES` | `lib/constants.ts` |
| `searchPlaces` | `lib/location.ts` |
| `reverseGeocode` | `lib/location.ts` |
| `setPaymentMethod` | `store/useRide.ts` |
| `setPickup` | `store/useLocation.ts` |
| `setDestination` | `store/useLocation.ts` |
| `setCurrentRide` | `store/useRide.ts` |
| `setUser` | `store/useAuth.ts` |
| `setRole` | `store/useAuth.ts` |
| `signOut` | `store/useAuth.ts` |
| `signToken` | `backend/src/utils/jwt.ts` |
| `submitRating` | `store/useRide.ts` |
| `updateDriverLocation` | `store/useRide.ts` |
| `updateProfile` | `store/useAuth.ts` |
| `useAuth` | `store/useAuth.ts`, `lib/useAuth.ts` |
| `useClerkAuth` | `lib/clerk.ts` |
| `useDriver` | `store/useDriver.ts` |
| `useHistory` | `store/useHistory.ts` |
| `useLocation` | `store/useLocation.ts` |
| `useRide` | `store/useRide.ts` |
| `User` | `types/user.ts` |
| `UserRole` | `types/user.ts` |
| `verifyToken` | `backend/src/utils/jwt.ts` |
