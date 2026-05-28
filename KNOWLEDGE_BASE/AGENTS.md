# Agent Context Summaries

> What each agent type needs to know when working on RideFlow.

---

## Frontend Agent

### File Structure

```
app/                    # Expo Router screens (file = route)
  _layout.tsx           # Root layout
  (auth)/               # Auth flow (Stack)
  (rider)/              # Rider tabs (Home, History, Profile)
  (driver)/             # Driver tabs (Dashboard, Earnings, Profile)
components/
  ui/                   # Reusable primitives (Button, Card, LoadingSpinner)
  map/                  # Map components (RideMap)
  ride/                 # Ride-specific (DriverInfoCard)
lib/                    # Shared utilities
store/                  # Zustand stores
types/                  # TypeScript interfaces
```

### Conventions

1. **Styling:** ALL styling via NativeWind `className` props. No StyleSheet.create unless NativeWind cannot achieve the effect.
2. **SafeAreaView workaround:** Use `<View className="flex-1 bg-white">` instead of SafeAreaView with className.
3. **Color palette:** Primary = black/white, Accent = blue-500, Success = green-500, Danger = red-500.
4. **Font:** Inter family (inter, inter-bold, inter-semibold, inter-medium, inter-light).
5. **Rounded elements:** `rounded-full` for buttons/pills, `rounded-2xl` for cards.
6. **Map-first design:** Map takes full screen; UI overlays use absolute positioning or bottom panels.
7. **Naming:** PascalCase for components/files, camelCase for functions/variables, UPPER_SNAKE for constants.
8. **Imports:** Relative paths (e.g., `../../store/useLocation`). No absolute imports configured.

### Code Patterns

- **Component structure:** Functional components with hooks. Props defined as interfaces above the component.
- **State management:** One Zustand store per domain. Import store directly, no context providers.
- **Navigation:** Expo Router file-based. Route groups in parentheses `(auth)`, `(rider)`, `(driver)`. Hidden routes use `href: null` in Tabs.Screen options.
- **Auth flow:** Clerk handles authentication. `useAuth()` in `lib/useAuth.ts` handles route protection.
- **Screen pattern:** Each screen is a default export function. Uses `useAuth()` hook for route protection.

### Key Files to Read First

1. `app/_layout.tsx` — Root layout, understand ClerkProvider wrapping
2. `lib/useAuth.ts` — Auth guard pattern
3. `store/useRide.ts` — Most complex store
4. `components/map/RideMap.tsx` — Most complex component
5. `lib/constants.ts` — All constants and configuration

---

## Backend Agent

### Architecture

Single Express gateway process with service-based routing:

```
backend/src/
  gateway.ts            # HTTP server + Socket.IO + route mounting
  services/
    auth.ts             # /api/auth/*
    ride.ts             # /api/rides/*
    matching.ts         # /api/matching/*
    payment.ts          # /api/payments/*
    notification.ts     # Socket.IO setup + event handlers
  middleware/
    auth.ts             # JWT authenticate + requireRole
    errorHandler.ts     # Global error handler
  utils/
    errors.ts           # Error classes (AppError, NotFound, etc.)
    fare.ts             # Fare calculation + haversine
    jwt.ts              # JWT sign/verify
    prisma.ts           # Prisma client singleton
```

### API Contracts

All endpoints return:
```json
{
  "data": { ... },
  "message": "Human-readable message"
}
```

Errors return:
```json
{
  "error": {
    "message": "Error description",
    "status": 400,
    "details": [] // Optional: validation errors
  }
}
```

### Database Schema

6 models: User, DriverProfile, Ride, Payment, Rating, Notification.

Key relationships:
- User 1:1 DriverProfile (driver only)
- User 1:N Ride (as rider or driver)
- Ride 1:N Payment
- Ride 1:N Rating

### Authentication

JWT-based with 7-day expiry. Token in `Authorization: Bearer <token>` header.

**Payload:**
```ts
interface JwtPayload {
  userId: string;
  email: string;
  role: string; // "RIDER" or "DRIVER"
}
```

### Socket.IO

Real-time events for ride tracking, driver matching, and payment notifications. See BACKEND.md for full event reference.

### Key Files to Read First

1. `backend/src/gateway.ts` — Understand service mounting and Socket.IO setup
2. `backend/src/services/ride.ts` — Core ride lifecycle endpoints
3. `backend/src/services/matching.ts` — Driver matching algorithm
4. `backend/src/middleware/auth.ts` — Authentication + authorization pattern
5. `backend/prisma/seed.ts` — Test data structure

---

## Testing Agent

### Test Framework

- **Runner:** Vitest v4.1.7
- **Environment:** jsdom
- **Coverage:** v8 provider, includes `store/`, `lib/`, `types/`, `components/`
- **Config:** `vitest.config.ts`

### Test File Locations

```
__tests__/
  components/           # Component tests
    Button.test.tsx
    Card.test.tsx
    DriverInfoCard.test.tsx
    LoadingSpinner.test.tsx
  lib/                  # Library tests
    constants.test.ts
    location.test.ts
  store/                # Store tests
    useAuth.test.ts
    useDriver.test.ts
    useHistory.test.ts
    useLocation.test.ts
    useRide.test.ts
  __mocks__/
    react-native.tsx    # React Native mock
    render-helper.tsx   # Test render helper with providers
```

### Test Patterns

**Store testing:**
```ts
import { useAuth } from "../../store/useAuth";

beforeEach(() => {
  useAuth.setState({ user: null, isSignedIn: false });
});

test("setUser updates state", () => {
  const { result } = renderHook(() => useAuth());
  act(() => result.current.setUser(mockUser));
  expect(result.current.isSignedIn).toBe(true);
});
```

**Component testing:**
```ts
import { render, fireEvent } from "@testing-library/react-native";
import Button from "../../components/ui/Button";

test("calls onPress when pressed", () => {
  const onPress = vi.fn();
  const { getByText } = render(<Button title="Click" onPress={onPress} />);
  fireEvent.press(getByText("Click"));
  expect(onPress).toHaveBeenCalled();
});
```

### Mock Strategy

1. **React Native:** Mock at `__tests__/__mocks__/react-native.tsx` (aliased in vitest.config.ts)
2. **Expo modules:** Mock with `vi.mock("expo-location")` etc.
3. **Stores:** Reset state in `beforeEach` with `store.setState(defaultState)`
4. **Render helper:** Use `__tests__/__mocks__/render-helper.tsx` for components needing store context

### Running Tests

```bash
npx vitest              # Run all tests
npx vitest --watch      # Watch mode
npx vitest --coverage   # With coverage report
```

---

## Verification Agent

### Acceptance Criteria

1. **TypeScript:** `npx tsc --noEmit` must pass with zero errors
2. **Tests:** All test files must pass
3. **Screens:** Every screen must render without crashes
4. **Flows:** Complete user flows must work end-to-end:
   - Auth: onboarding -> login -> register -> role selection
   - Rider: home -> search -> request -> matching -> active -> payment -> complete -> rating
   - Driver: dashboard -> go online -> incoming ride -> accept -> active -> complete
5. **State:** Zustand stores must correctly manage state transitions
6. **Navigation:** All routes must be accessible and back navigation must work

### Quality Thresholds

| Metric | Threshold |
|--------|-----------|
| TypeScript errors | 0 |
| Test pass rate | 100% |
| Screen render errors | 0 |
| Store state consistency | All transitions correct |
| Navigation coverage | All routes accessible |

### Verification Commands

```bash
# TypeScript check
npx tsc --noEmit

# Run tests
npx vitest run

# Check for console errors (manual)
# Open app in Expo Go, navigate all screens
```

### Common Issues to Watch For

1. **NativeWind className errors:** Check if className is supported on the component
2. **Store state leaks:** Ensure stores are reset between test cases
3. **Navigation dead ends:** Every screen must have a way to go back
4. **Missing loading states:** Async operations should show loading indicators
5. **Error boundaries:** API failures should show error messages, not crashes

---

## Prompt Structure for AI Agents

Every prompt must follow the 4-part structure:

1. **"Read the AGENTS.md file first and follow it strictly."**
2. **ONE task** — what to build right now
3. **Constraints** — what already works that must not change
4. **Optional** — design reference or documentation

### Example Prompt

```
Read the AGENTS.md file first and follow it strictly.

Build the ride completion screen (app/(rider)/ride/complete.tsx).

Constraints:
- useRide store already has submitRating(stars, comment) action
- DriverInfoCard component already exists
- All styling via NativeWind className props

Reference: UBER_CLONE_SPEC.md section on ride completion
```
