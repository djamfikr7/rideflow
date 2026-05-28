# Architecture Decision Records (ADRs)

> Each ADR documents a major technical decision made during RideFlow development.

---

## ADR-001: Expo Managed Workflow

**Status:** Accepted

**Context:** The project needed a cross-platform mobile framework that would allow rapid prototyping without native build configuration. The team wanted to focus on business logic rather than platform-specific setup.

**Decision:** Use Expo SDK 56 with managed workflow (no ejected native code).

**Consequences:**
- (+) Fastest path to working app — no Xcode/Android Studio setup needed
- (+) OTA updates via Expo EAS
- (+) All native modules available via Expo SDK (location, secure-store, etc.)
- (-) Limited to Expo-compatible libraries
- (-) Cannot use native modules not in Expo SDK without custom dev client
- (-) App binary size includes all Expo SDK modules

---

## ADR-002: NativeWind over StyleSheet

**Status:** Accepted

**Context:** React Native's built-in `StyleSheet.create` requires verbose object definitions. The team wanted utility-first CSS similar to Tailwind for faster UI development.

**Decision:** Use NativeWind v4.2.4 with Tailwind CSS 3.4.17 for all styling.

**Consequences:**
- (+) Write Tailwind classes directly in `className` props
- (+) Consistent design system via tailwind.config.js tokens
- (+) Faster prototyping — no StyleSheet boilerplate
- (-) SafeAreaView does not support `className` prop (workaround: use View wrapper)
- (-) Requires babel + metro config changes
- (-) Need CSS type declarations (`types/declarations.d.ts`)

---

## ADR-003: Zustand over Redux

**Status:** Accepted

**Context:** The project needed global state management for auth, location, ride, and driver state. Redux requires significant boilerplate (actions, reducers, slices, middleware). The team wanted a minimal API.

**Decision:** Use Zustand v5.0.13 with one store per domain.

**Consequences:**
- (+) Minimal API — no providers, no boilerplate
- (+) Works perfectly with TypeScript (type inference)
- (+) Each store is focused and independently testable
- (+) No middleware needed for basic async operations
- (-) No built-in devtools (though zustand/middleware can add it)
- (-) No persistence middleware yet (AsyncStorage planned for future)

---

## ADR-004: Clerk for Auth

**Status:** Accepted

**Context:** The project needed authentication with email/password and OAuth (Google, Apple). Building custom auth with JWT + OAuth flows would take significant time.

**Decision:** Use Clerk v2.19.31 for authentication via `@clerk/clerk-expo`.

**Consequences:**
- (+) Drop-in OAuth + email auth — handles token refresh, session management
- (+) Built-in UI components for sign-in/sign-up
- (+) expo-secure-store integration for token caching
- (-) Name conflicts with project's custom `useAuth` hook (aliased as `useClerkAuth`)
- (-) Requires Clerk account and publishable key
- (-) Role-based redirect is TODO (always redirects to rider)

---

## ADR-005: expo-location Geocoding over Google Places API

**Status:** Accepted

**Context:** The ride request flow needs location search (forward geocoding) and address display (reverse geocoding). Google Places Autocomplete provides richer results but requires additional API key and billing.

**Decision:** Use expo-location's built-in `geocodeAsync` and `reverseGeocodeAsync` for place search.

**Consequences:**
- (+) No additional API key or billing needed
- (+) Built into Expo SDK — no extra dependency
- (+) `geocodeSearch()` helper with timeout and limit handles the flow
- (-) Less accurate than Google Places Autocomplete
- (-) No autocomplete/typeahead — user must type full query
- (-) Results may vary by platform (iOS vs Android)

---

## ADR-006: Haversine over Google Directions

**Status:** Accepted

**Context:** Fare estimation requires distance calculation between pickup and destination. Google Directions API provides real driving distance but requires API calls and billing.

**Decision:** Use haversine formula for client-side straight-line distance calculation.

**Consequences:**
- (+) No API calls — works offline
- (+) Instant calculation — no network latency
- (+) Good enough for fare estimates (actual fare comes from backend)
- (-) Straight-line distance underestimates actual driving distance
- (-) Duration estimate is rough (assumes 30 km/h urban average)
- (-) Real production app would use Google Directions API

---

## ADR-007: Simulated Matching over Real Backend

**Status:** Accepted (temporary)

**Context:** The ride matching flow needs driver assignment. A real backend with driver location tracking and matching algorithm would take significant time to build.

**Decision:** Simulate driver matching with 3-5 second random delay and hardcoded mock driver.

**Consequences:**
- (+) Allows testing full ride flow without backend
- (+) Mock driver has realistic data (name, rating, vehicle info)
- (+) Status auto-progression simulates real ride lifecycle
- (-) No real driver matching algorithm
- (-) Cannot test edge cases (no drivers available, driver cancels)
- (-) Backend integration needed for production

---

## ADR-008: Vitest over Jest

**Status:** Accepted

**Context:** The project needed a test runner. Jest is the default for React Native but requires significant configuration for Expo + TypeScript. Vitest offers faster execution and better TypeScript support.

**Decision:** Use Vitest v4.1.7 with jsdom environment and v8 coverage.

**Consequences:**
- (+) Faster test execution than Jest
- (+) Native TypeScript support — no transform config needed
- (+) Compatible with React Testing Library
- (+) v8 coverage provider with text + JSON summary reporters
- (-) Need react-native mock (`__tests__/__mocks__/react-native.tsx`)
- (-) Some Jest-specific libraries may not be compatible

---

## ADR-009: Express Microservices over Serverless

**Status:** Accepted

**Context:** The backend needs to handle real-time WebSocket connections (Socket.IO for ride tracking), which is difficult with serverless functions. The team wanted a traditional server architecture.

**Decision:** Use Express v5.1 with Socket.IO v4.8 in a single gateway process with service-based routing.

**Consequences:**
- (+) Full control over server lifecycle
- (+) Socket.IO works natively — no adapter needed
- (+) Service-based routing keeps code organized
- (+) Easy to split into separate microservices later
- (-) Requires server management (not auto-scaling)
- (-) Single process — all services share memory
- (-) Need Docker for production deployment

---

## ADR-010: Prisma over Raw SQL

**Status:** Accepted

**Context:** The backend needs a database ORM for PostgreSQL. Raw SQL is powerful but error-prone. TypeORM and Prisma are the main contenders for TypeScript projects.

**Decision:** Use Prisma v6.9 with PostgreSQL 16.

**Consequences:**
- (+) Type-safe database queries — auto-generated TypeScript types
- (+) Schema-first approach — clear data model definition
- (+) Built-in migrations (`prisma migrate dev`)
- (+) Seed script support for test data
- (-) Learning curve for Prisma schema language
- (-) Some complex queries harder to express than raw SQL
- (-) Requires `prisma generate` step after schema changes
