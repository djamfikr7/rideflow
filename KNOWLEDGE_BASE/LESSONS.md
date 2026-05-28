# Lessons Learned

> Issues found during development, fixes applied, and patterns that worked well.

---

## Issues Found and Fixed

### NativeWind + SafeAreaView Incompatibility

**Problem:** NativeWind's `className` prop does not work on `react-native-safe-area-context` SafeAreaView component. Applying className causes a runtime error.

**Fix:** Use `<View className="flex-1 bg-white">` as a wrapper instead of SafeAreaView with className. Place `<StatusBar style="dark" />` inside the View.

**Lesson:** NativeWind className support is not universal across all React Native components. Always test className on new components before committing to the pattern.

### CSS Type Declarations Required

**Problem:** TypeScript errors when importing CSS files (`import "./global.css"`).

**Fix:** Add `types/declarations.d.ts` with `declare module "*.css"`.

**Lesson:** Any non-JS/TS file import needs a type declaration. Add it early in the project setup.

### Babel + Metro Config Ordering

**Problem:** NativeWind styles not applying if babel/metro config is incorrect.

**Fix:**
1. `babel.config.js` must include both `babel-preset-expo` with `jsxImportSource: "nativewind"` AND `"nativewind/babel"` preset.
2. `metro.config.js` must wrap Expo's default config with `withNativeWind(config, { input: "./global.css" })`.
3. Reanimated plugin must be LAST in babel plugins array.

**Lesson:** Configuration order matters. Follow NativeWind docs exactly — small deviations cause silent failures.

### Clerk useAuth Name Conflict

**Problem:** Clerk's `useAuth` hook has the same name as the project's custom auth guard hook. Importing both causes naming collision.

**Fix:** Alias Clerk's hook as `useClerkAuth` in `lib/clerk.ts`:
```ts
import { useAuth as useClerkAuth } from "@clerk/clerk-expo";
```

**Lesson:** When using third-party SDKs with common hook names, alias imports at the configuration level to avoid conflicts throughout the codebase.

### Auth Guard Role-Based Redirect

**Problem:** Auth guard always redirects signed-in users to `(rider)` regardless of role. Drivers land on rider screens.

**Fix:** TODO — need to check `user.role` from useAuth store and redirect to `(driver)` if role is "driver".

**Lesson:** Role-based routing needs to be implemented early. The current workaround (always redirect to rider) works for demo but is not production-ready.

### Geocoding Timeout Handling

**Problem:** `ExpoLocation.geocodeAsync` can hang indefinitely on slow networks.

**Fix:** Wrap in `withTimeout()` helper with 5000ms limit. Use `Promise.allSettled` for batch reverse geocoding to handle partial failures.

**Lesson:** Always add timeouts to external API calls. Use Promise.allSettled instead of Promise.all when partial results are acceptable.

---

## Patterns That Worked Well

### One Store Per Domain

Separating state into `useAuth`, `useLocation`, `useRide`, `useDriver`, `useHistory` stores made each concern independently testable and easy to reason about. No store exceeds 60 lines.

**Recommendation:** Keep Zustand stores focused on a single domain. If a store exceeds 100 lines, consider splitting it.

### Multi-Step Screen Pattern

`request.tsx` uses internal state (`showRideTypes`) to switch between search -> preview -> ride type selection without extra routes. This keeps all booking logic in one screen and avoids route proliferation.

**Recommendation:** Use this pattern for wizard-like flows that don't need deep linking to individual steps.

### Status-Aware Component Behavior

`RideMap` accepts a `rideStatus` prop and renders different polylines based on status. This pattern allows a single component to adapt its visual behavior based on application state.

**Recommendation:** Use status-aware props for components that need to change behavior based on lifecycle state.

### Mock Data with Relative Dates

`useHistory` store uses a `daysAgo()` helper to generate ISO date strings relative to today. Mock data always looks realistic regardless of when the app is run.

**Recommendation:** Use relative date helpers for mock data instead of hardcoded dates.

### DriverInfoCard Extraction

Extracting `DriverInfoCard` as a standalone component early (before it was needed in multiple places) paid off when both `matching.tsx` and `active.tsx` needed driver info display.

**Recommendation:** Extract reusable components when you anticipate reuse, even if only one usage exists initially.

### Service-Based Backend Routing

Organizing backend code into service files (`auth.ts`, `ride.ts`, `matching.ts`, `payment.ts`) with Express Router keeps each service focused and testable. Services are mounted at `/api/*` in the gateway.

**Recommendation:** Start with service-based routing in a single process. Split into separate microservices only when scaling demands it.

### Fare Calculation Utility

Backend fare calculation in `utils/fare.ts` includes surge pricing (time-based multiplier) and minimum fares per vehicle type. The same haversine formula is used on both client and server.

**Recommendation:** Keep fare logic in a shared utility. Client-side for UI estimates, server-side for authoritative calculation.

---

## Testing Lessons

### React Native Mock for Vitest

Vitest's jsdom environment doesn't include React Native. A mock file at `__tests__/__mocks__/react-native.tsx` is required, aliased in `vitest.config.ts`:

```ts
resolve: {
  alias: {
    "react-native": path.resolve(__dirname, "__tests__/__mocks__/react-native.tsx"),
  },
},
```

### Store Testing Pattern

Zustand stores can be tested by calling actions directly and reading state:

```ts
const { result } = renderHook(() => useAuth());
act(() => result.current.setUser(mockUser));
expect(result.current.isSignedIn).toBe(true);
```

### Component Testing with Providers

Components that use stores need a render helper that provides store context. `__tests__/__mocks__/render-helper.tsx` wraps components with necessary providers.

---

## Known TODOs in Codebase

| File | TODO | Priority |
|------|------|----------|
| `lib/api.ts` | Auth token injection in request interceptor (needs Clerk token integration) | High |
| `lib/useAuth.ts` | Role-based redirect (rider vs driver) after login | High |
| `app/(rider)/index.tsx` | Navigate to actual location search screen (currently goes to request.tsx) | Medium |
| All screens | Backend integration needed for real matching, payment, history | High |
| `package.json` | Install @stripe/stripe-react-native for real payment processing | Medium |
| `app/(driver)/earnings.tsx` | Needs real earnings data from backend | Low |
| `store/useRide.ts` | AsyncStorage persistence middleware | Low |
