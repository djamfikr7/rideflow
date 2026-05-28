# Requirements Traceability Matrix — RideFlow

## Project: RideFlow (Uber Clone)
## Mode: AP-2 (Supervised)
## Started: 2026-05-27

---

## Milestone M1: Foundation

| REQ | Description | Status | Tasks | Artifacts | Verified |
|-----|-------------|--------|-------|-----------|----------|
| REQ-1.1 | Expo app initialized with TypeScript | VERIFIED | TASK-1.1 | package.json, tsconfig.json, app.json | 2026-05-27 |
| REQ-1.2 | NativeWind v5 configured | VERIFIED | TASK-1.1 | tailwind.config.js, metro.config.js, babel.config.js, global.css | 2026-05-27 |
| REQ-1.3 | Expo Router with tab navigation | VERIFIED | TASK-1.1 | app/_layout.tsx, app/(rider)/_layout.tsx, app/(driver)/_layout.tsx | 2026-05-27 |
| REQ-1.4 | Project folder structure per AGENTS.md | VERIFIED | TASK-1.1 | app/, components/, lib/, store/, types/ | 2026-05-27 |
| REQ-1.5 | TypeScript types defined | VERIFIED | TASK-1.1 | types/ride.ts, types/user.ts, types/api.ts | 2026-05-27 |
| REQ-1.6 | Zustand stores created | VERIFIED | TASK-1.1 | store/useAuth.ts, store/useLocation.ts, store/useRide.ts, store/useDriver.ts | 2026-05-27 |
| REQ-1.7 | API client configured | VERIFIED | TASK-1.1 | lib/api.ts, lib/constants.ts, lib/socket.ts | 2026-05-27 |
| REQ-1.8 | Reusable UI components | VERIFIED | TASK-1.1 | components/ui/Button.tsx, Card.tsx, LoadingSpinner.tsx | 2026-05-27 |
| REQ-1.9 | Onboarding screen | VERIFIED | TASK-1.2 | app/(auth)/index.tsx | 2026-05-27 |
| REQ-1.10 | Login screen | VERIFIED | TASK-1.2 | app/(auth)/login.tsx | 2026-05-27 |
| REQ-1.11 | Register screen with role selection | VERIFIED | TASK-1.2 | app/(auth)/register.tsx | 2026-05-27 |
| REQ-1.12 | Auth layout | VERIFIED | TASK-1.2 | app/(auth)/_layout.tsx | 2026-05-27 |
| REQ-1.13 | Rider home screen with map placeholder | VERIFIED | TASK-1.3 | app/(rider)/index.tsx | 2026-05-27 |
| REQ-1.14 | Rider history screen | VERIFIED | TASK-1.3 | app/(rider)/history.tsx | 2026-05-27 |
| REQ-1.15 | Rider profile screen | VERIFIED | TASK-1.3 | app/(rider)/profile.tsx | 2026-05-27 |
| REQ-1.16 | Driver dashboard screen | VERIFIED | TASK-1.3 | app/(driver)/index.tsx | 2026-05-27 |
| REQ-1.17 | Driver earnings screen | VERIFIED | TASK-1.3 | app/(driver)/earnings.tsx | 2026-05-27 |
| REQ-1.18 | Driver profile screen | VERIFIED | TASK-1.3 | app/(driver)/profile.tsx | 2026-05-27 |
| REQ-1.19 | TypeScript passes with zero errors | VERIFIED | TASK-1.1 | npx tsc --noEmit passes | 2026-05-27 |
| REQ-1.20 | Clerk SDK integrated | VERIFIED | TASK-1.2 | lib/clerk.ts, @clerk/clerk-expo installed | 2026-05-27 |
| REQ-1.21 | ClerkProvider wraps app | VERIFIED | TASK-1.2 | app/_layout.tsx | 2026-05-27 |
| REQ-1.22 | Auth guard redirects unauthenticated users | VERIFIED | TASK-1.2 | lib/useAuth.ts | 2026-05-27 |
| REQ-1.23 | Login uses Clerk useSignIn | VERIFIED | TASK-1.2 | app/(auth)/login.tsx | 2026-05-27 |
| REQ-1.24 | Register uses Clerk useSignUp with role metadata | VERIFIED | TASK-1.2 | app/(auth)/register.tsx | 2026-05-27 |
| REQ-1.25 | Sign out uses Clerk signOut | VERIFIED | TASK-1.2 | app/(rider)/profile.tsx, app/(driver)/profile.tsx | 2026-05-27 |
| REQ-1.26 | Google Maps installed | VERIFIED | TASK-1.3 | react-native-maps in package.json | 2026-05-27 |
| REQ-1.27 | Location permissions requested | VERIFIED | TASK-1.3 | lib/location.ts | 2026-05-27 |
| REQ-1.28 | Map component created | VERIFIED | TASK-1.3 | components/map/RideMap.tsx | 2026-05-27 |
| REQ-1.29 | Current location on map | VERIFIED | TASK-1.3 | app/(rider)/index.tsx loads location on mount | 2026-05-27 |
| REQ-1.30 | "Where to?" search bar | VERIFIED | TASK-1.3 | app/(rider)/index.tsx bottom panel | 2026-05-27 |

---

## Milestone M2: Ride Booking (NOT STARTED)

| REQ | Description | Status | Tasks | Artifacts | Verified |
|-----|-------------|--------|-------|-----------|----------|
| REQ-2.1 | Google Maps integration | VERIFIED | TASK-8 | RideMap.tsx, location.ts, index.tsx | 2026-05-27 |
| REQ-2.2 | Location search with geocoding | VERIFIED | TASK-9 | request.tsx, geocodeSearch in location.ts | 2026-05-27 |
| REQ-2.3 | Route display with polyline + distance | VERIFIED | TASK-6 | RideMap.tsx Polyline, haversineDistance, formatDistance | 2026-05-27 |
| REQ-2.4 | Ride type selection + fare estimate | VERIFIED | TASK-7 | request.tsx ride type cards, fare calc | 2026-05-27 |
| REQ-2.5 | Fare estimate calculation | VERIFIED | TASK-7 | request.tsx fare calc with RIDE_TYPES | 2026-05-27 |
| REQ-2.6 | Ride request + matching flow | VERIFIED | TASK-10 | request.tsx confirm, matching.tsx, active.tsx | 2026-05-27 |
| REQ-2.6 | Ride request creation | NOT_STARTED | — | — | — |

---

## Milestone M3: Active Ride (NOT STARTED)

| REQ | Description | Status | Tasks | Artifacts | Verified |
|-----|-------------|--------|-------|-----------|----------|
| REQ-3.1 | Real-time driver location tracking | VERIFIED | TASK-11 | RideMap driver marker, active.tsx movement sim | 2026-05-27 |
| REQ-3.2 | Driver info card | VERIFIED | TASK-12 | components/ride/DriverInfoCard.tsx | 2026-05-27 |
| REQ-3.3 | Active ride route display (status-aware polylines) | VERIFIED | TASK-14 | RideMap driver_arriving/in_progress polylines | 2026-05-27 |
| REQ-3.4 | Ride completion + rating | VERIFIED | TASK-13 | complete.tsx stars+receipt, RideRating type, submitRating | 2026-05-27 |

---

## Milestone M4: Driver Mode (NOT STARTED)

| REQ | Description | Status | Tasks | Artifacts | Verified |
|-----|-------------|--------|-------|-----------|----------|
| REQ-4.1 | Driver online/offline toggle | NOT_STARTED | — | — | — |
| REQ-4.2 | Incoming ride request | NOT_STARTED | — | — | — |
| REQ-4.3 | Accept/reject ride flow | NOT_STARTED | — | — | — |
| REQ-4.4 | Driver ride lifecycle | NOT_STARTED | — | — | — |

---

## Milestone M5: Payments & Polish (NOT STARTED)

| REQ | Description | Status | Tasks | Artifacts | Verified |
|-----|-------------|--------|-------|-----------|----------|
| REQ-5.1 | Stripe payment integration | NOT_STARTED | — | — | — |
| REQ-5.2 | Ride history with receipts | NOT_STARTED | — | — | — |
| REQ-5.3 | Profile editing | NOT_STARTED | — | — | — |

---

## Summary

| Milestone | Total | Verified | In Progress | Not Started |
|-----------|-------|----------|-------------|-------------|
| M1: Foundation | 31 | 31 | 0 | 0 |
| M2: Ride Booking | 6 | 6 | 0 | 0 |
| M3: Active Ride | 4 | 4 | 0 | 0 |
| M4: Driver Mode | 4 | 0 | 0 | 4 |
| M5: Payments | 3 | 0 | 0 | 3 |
| **TOTAL** | **48** | **41** | **0** | **7** |
