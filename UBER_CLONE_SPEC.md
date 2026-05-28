# RideFlow — Uber Clone Implementation Specification

## Philosophy: Practical Vibe Coding

> "Speed without direction always lands in spaghetti code. Days of planning without a single screen lands nowhere. The middle ground is: keep the speed of AI, add just enough structure so AI knows what it's working on, and build feature by feature."

This project follows the **Practical Vibe Coding** workflow:
- One `AGENTS.md` file at the root tells AI how the project works
- Every prompt has 4 parts: Read AGENTS.md → One task → Constraints → Design reference
- Build one feature at a time, verify it, then move on
- Don't over-engineer — build the smallest useful version first
- Don't vibe-code blindly — structure prevents spaghetti code
- When something breaks: one problem, one fix, one verification

---

## 1. Project Overview

**Name:** RideFlow
**Description:** A ride-hailing mobile application (Uber clone) with real-time location tracking, ride matching, fare calculation, and payment processing. Built with React Native + Expo, powered by a microservices backend.

**Target:** Production-quality MVP that demonstrates a real ride-hailing workflow — not a toy project.

---

## 2. Technology Stack

### Frontend (Mobile)
| Technology | Purpose |
|---|---|
| **React Native + Expo** | Cross-platform mobile framework (iOS + Android) |
| **TypeScript** | Type safety, better AI code generation |
| **Expo Router** | File-based routing |
| **NativeWind v5** | Tailwind CSS for React Native styling |
| **Zustand** | Lightweight state management |
| **React Native Maps** | Google Maps integration |
| **Clerk** | Authentication (email, Google, Apple OAuth) |
| **Stripe React Native** | Payment processing |
| **Expo Location** | Device GPS access |

### Backend (Microservices)
| Technology | Purpose |
|---|---|
| **Node.js + Express** | API Gateway and individual services |
| **PostgreSQL** | Primary database (via Prisma ORM) |
| **Redis** | Caching, pub/sub for real-time events, session store |
| **Socket.IO** | Real-time bidirectional communication |
| **Bull MQ** | Job queue for async tasks (notifications, matching) |
| **Docker + Docker Compose** | Containerization and local orchestration |
| **Google Maps API** | Directions, geocoding, distance matrix |
| **Stripe API** | Payment intents, webhooks |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Docker Compose** | Local development orchestration |
| **Nginx** | API Gateway reverse proxy |
| **PostgreSQL 16** | Database |
| **Redis 7** | Cache + pub/sub |

---

## 3. Microservices Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE APP (React Native)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Rider UI │ │ Driver UI│ │  Auth    │ │ Payments │       │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘       │
└───────┼─────────────┼─────────────┼─────────────┼────────────┘
        │             │             │             │
        ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY (:3000)                     │
│            Nginx + Express middleware                        │
│         Auth verification, rate limiting, routing            │
└──┬──────────┬──────────┬──────────┬──────────┬──────────────┘
   │          │          │          │          │
   ▼          ▼          ▼          ▼          ▼
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ Auth │ │ Ride │ │ Match│ │ Pay  │ │Notify│
│  :3001│ │ :3002│ │ :3003│ │ :3004│ │ :3005│
└──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘
   │        │        │        │        │
   ▼        ▼        ▼        ▼        ▼
┌─────────────────────────────────────────────────────────────┐
│  PostgreSQL (:5432)  │  Redis (:6379)  │  Socket.IO (ws)    │
└─────────────────────────────────────────────────────────────┘
```

### Service Breakdown

#### Auth Service (:3001)
- User registration and login (rider + driver roles)
- JWT token issuance and validation
- Profile management (name, phone, avatar)
- Clerk webhook integration for OAuth

#### Ride Service (:3002)
- Create ride requests (origin, destination, ride type)
- Ride status management (requested → matched → driver-arriving → in-progress → completed → rated)
- Fare calculation (distance + time + surge pricing)
- Ride history for riders and drivers

#### Matching Service (:3003)
- Find nearby available drivers (geospatial queries)
- Match rider to optimal driver (distance, rating, acceptance rate)
- Handle driver acceptance/rejection with timeout
- Real-time driver location updates via Redis pub/sub

#### Payment Service (:3004)
- Stripe payment intent creation
- Payment processing after ride completion
- Refund handling for cancelled rides
- Payment history and receipts
- Stripe webhook verification

#### Notification Service (:3005)
- Push notifications (Expo Push Notifications)
- Real-time status updates via Socket.IO
- Email notifications for receipts
- SMS for ride confirmation (optional)

---

## 4. Database Schema (Core Tables)

```sql
-- Users (riders and drivers)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'rider', -- rider, driver
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Driver profiles
CREATE TABLE driver_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    vehicle_make VARCHAR(100),
    vehicle_model VARCHAR(100),
    vehicle_year INTEGER,
    vehicle_color VARCHAR(50),
    license_plate VARCHAR(20),
    vehicle_type VARCHAR(20) DEFAULT 'standard', -- standard, comfort, premium
    is_available BOOLEAN DEFAULT false,
    current_lat DOUBLE PRECISION,
    current_lng DOUBLE PRECISION,
    rating DECIMAL(3,2) DEFAULT 5.00,
    total_rides INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Rides
CREATE TABLE rides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rider_id UUID REFERENCES users(id),
    driver_id UUID REFERENCES users(id),
    status VARCHAR(30) NOT NULL DEFAULT 'requested',
    -- requested, matched, driver_arriving, in_progress, completed, cancelled
    pickup_lat DOUBLE PRECISION NOT NULL,
    pickup_lng DOUBLE PRECISION NOT NULL,
    pickup_address TEXT NOT NULL,
    destination_lat DOUBLE PRECISION NOT NULL,
    destination_lng DOUBLE PRECISION NOT NULL,
    destination_address TEXT NOT NULL,
    ride_type VARCHAR(20) DEFAULT 'standard',
    fare_estimate DECIMAL(10,2),
    fare_final DECIMAL(10,2),
    distance_km DECIMAL(10,2),
    duration_minutes INTEGER,
    stripe_payment_intent_id VARCHAR(255),
    requested_at TIMESTAMP DEFAULT NOW(),
    matched_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Ratings
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID REFERENCES rides(id),
    from_user_id UUID REFERENCES users(id),
    to_user_id UUID REFERENCES users(id),
    score INTEGER CHECK (score >= 1 AND score <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID REFERENCES rides(id),
    user_id UUID REFERENCES users(id),
    stripe_payment_intent_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending', -- pending, succeeded, failed, refunded
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5. Feature Breakdown (Build Order)

### Phase 1: Foundation (Milestone M1)

#### Feature 1.1: Project Setup
- Initialize Expo app with TypeScript
- Setup NativeWind v5 with Tailwind config
- Setup Expo Router with tab navigation
- Create AGENTS.md file
- Setup environment variables (.env)

#### Feature 1.2: Authentication
- Clerk integration (email + Google OAuth)
- Onboarding screens (welcome, sign up, sign in)
- Role selection (Rider / Driver)
- Protected routes (redirect to auth if not logged in)

#### Feature 1.3: Rider Home Screen
- Map view with current location
- "Where to?" search bar
- Recent locations
- Current location marker

### Phase 2: Ride Booking (Milestone M2)

#### Feature 2.1: Location Search
- Google Places Autocomplete integration
- Search origin and destination
- Display route on map with polyline
- Show estimated distance and time

#### Feature 2.2: Ride Request
- Ride type selection (Standard, Comfort, Premium)
- Fare estimate display
- Confirm ride button
- Create ride request API call

#### Feature 2.3: Driver Matching
- Matching service finds nearby drivers
- Loading animation while matching
- Driver matched notification with driver info
- Driver ETA display

### Phase 3: Active Ride (Milestone M3)

#### Feature 3.1: Driver Arriving
- Real-time driver location on map
- Driver info card (name, photo, vehicle, rating)
- Contact driver (call/message)
- Cancel ride option

#### Feature 3.2: In-Progress Ride
- Real-time route tracking
- Turn-by-turn display (simplified)
- ETA to destination
- Ride status updates

#### Feature 3.3: Ride Completion
- Fare summary screen
- Rating system (1-5 stars + comment)
- Payment processing via Stripe
- Receipt display

### Phase 4: Driver Mode (Milestone M4)

#### Feature 4.1: Driver Dashboard
- Toggle online/offline status
- Current earnings display
- Today's ride count
- Rating display

#### Feature 4.2: Driver Ride Flow
- Incoming ride request notification
- Accept/reject with timeout
- Navigation to pickup
- Start ride / End ride controls

### Phase 5: Payments & Polish (Milestone M5)

#### Feature 5.1: Payment Integration
- Stripe setup with payment methods
- Add/remove payment cards
- Automatic payment after ride
- Payment history

#### Feature 5.2: Ride History
- Rider ride history list
- Driver earnings history
- Ride details with receipt

#### Feature 5.3: Profile & Settings
- Edit profile (name, phone, photo)
- Notification preferences
- Help & support links

---

## 6. AGENTS.md Template

```markdown
# AGENTS.md — RideFlow

## Role
You are an expert React Native + Expo engineer. You write clean, simple TypeScript code. You prioritize clarity over abstraction. Think like a senior mobile developer building a production ride-hailing app.

## Overview
RideFlow is an Uber-like ride-hailing mobile app. Riders request rides, get matched with nearby drivers, track in real-time, and pay via Stripe. Drivers accept rides, navigate to pickup, and complete trips.

## Stack
- React Native + Expo (managed workflow)
- TypeScript (strict mode)
- Expo Router (file-based routing)
- NativeWind v5 (Tailwind CSS classes)
- Zustand (state management)
- Clerk (authentication)
- Google Maps (map, places, directions)
- Stripe (payments)
- Socket.IO client (real-time updates)

## Development Philosophy
- Build one feature at a time, verify it works, then move on
- Smallest useful version first — don't over-engineer
- Readable code over clever code
- If something is unclear, ask before implementing
- Do NOT install new libraries without user approval

## Folder Structure
```
app/
  (auth)/          — Auth screens (login, register, onboarding)
  (rider)/         — Rider tab screens
    index.tsx      — Home (map + search)
    ride/          — Ride flow screens
    history.tsx    — Ride history
    profile.tsx    — Profile
  (driver)/        — Driver tab screens
    index.tsx      — Driver dashboard
    ride/          — Driver ride flow
    earnings.tsx   — Earnings history
  _layout.tsx      — Root layout with auth check
components/
  ui/              — Reusable UI components (Button, Card, Input)
  map/             — Map-related components
  ride/            — Ride flow components
lib/
  api.ts           — API client (Axios)
  clerk.ts         — Clerk config
  stripe.ts        — Stripe config
  maps.ts          — Google Maps helpers
  socket.ts        — Socket.IO client
store/
  useAuth.ts       — Auth state
  useLocation.ts   — Location state
  useRide.ts       — Current ride state
types/
  ride.ts          — Ride types
  user.ts          — User types
  driver.ts        — Driver types
```

## Styling Rules
- Use NativeWind className props for all styling
- Do NOT use StyleSheet.create unless NativeWind can't achieve it
- Color palette: primary (#000000 black, #FFFFFF white), accent (#3B82F6 blue), success (#22C55E green), danger (#EF4444 red)
- Font: Inter (loaded via expo-font)
- SafeAreaView: use View with className="flex-1 bg-white" — NativeWind doesn't work with SafeAreaView className

## Constraints (for every prompt)
- Do not change existing screens that are already working
- Preserve existing navigation structure
- Do not expose API keys or secrets in the mobile app
- Use environment variables (EXPO_PUBLIC_*) for client-side config
- If anything is unclear, ask before implementing
```

---

## 7. Prompt Template (4-Part Structure)

Every prompt used to build this app follows this structure:

```
Read the AGENTS.md file first and follow it strictly.

[ONE TASK — what you're building right now]

[CONSTRAINTS — what already works that must not change]

[OPTIONAL — design reference image or documentation paste]
```

### Example Prompts

**Example 1: Setup NativeWind**
```
Read the AGENTS.md file first and follow it strictly.

Setup NativeWind v5 in the Expo app. Install dependencies, configure
babel.config.js, metro.config.js, global.css, and TypeScript types.
Import global.css in the root layout.

Do not change the existing app structure. Use the NativeWind v5 docs
provided below.

[paste NativeWind v5 installation docs]
```

**Example 2: Build Home Screen**
```
Read the AGENTS.md file first and follow it strictly.

Build the Rider Home screen (app/(rider)/index.tsx). It should show:
- A full-screen Google Map centered on the user's current location
- A "Where to?" search bar at the bottom
- Current location marker (blue dot)

Do not change the auth flow or navigation structure. Do not add any
new libraries. Keep the map simple — no routes or markers yet.

[attach design screenshot]
```

**Example 3: Add Ride Request**
```
Read the AGENTS.md file first and follow it strictly.

Implement the ride request flow. After the user selects origin and
destination:
- Show ride type options (Standard, Comfort, Premium)
- Display fare estimate
- "Confirm Ride" button creates a ride request via API

Preserve the existing map and search functionality. Do not change the
Home screen layout. Keep the current Zustand store structure.
```

---

## 8. API Endpoints

### Auth Service
```
POST   /api/auth/register          — Register new user
POST   /api/auth/login             — Login
GET    /api/auth/me                — Get current user
PUT    /api/auth/profile           — Update profile
POST   /api/auth/webhook/clerk     — Clerk webhook
```

### Ride Service
```
POST   /api/rides                  — Create ride request
GET    /api/rides/:id              — Get ride details
PUT    /api/rides/:id/status       — Update ride status
GET    /api/rides/history          — Get ride history
POST   /api/rides/:id/cancel       — Cancel ride
GET    /api/rides/:id/fare-estimate — Get fare estimate
```

### Matching Service
```
POST   /api/matching/find-driver   — Find nearby drivers
POST   /api/matching/accept        — Driver accepts ride
POST   /api/matching/reject        — Driver rejects ride
PUT    /api/matching/driver-location — Update driver location
GET    /api/matching/nearby-rides   — Get nearby ride requests (driver)
```

### Payment Service
```
POST   /api/payments/intent        — Create payment intent
POST   /api/payments/confirm       — Confirm payment
POST   /api/payments/webhook       — Stripe webhook
GET    /api/payments/history        — Payment history
POST   /api/payments/refund         — Process refund
```

---

## 9. Real-Time Events (Socket.IO)

```
// Rider events
rider:ride-requested     — Rider requests a ride
rider:driver-matched     — Driver assigned to ride
rider:driver-arriving    — Driver is on the way
rider:driver-arrived     — Driver at pickup
rider:ride-started       — Ride in progress
rider:ride-completed     — Ride finished
rider:driver-location    — Driver location update

// Driver events
driver:ride-available    — New ride request nearby
driver:ride-accepted     — Ride accepted by driver
driver:ride-cancelled    — Ride cancelled by rider
driver:navigate-to-pickup — Navigate to pickup location
```

---

## 10. Environment Variables

```env
# Clerk
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Google Maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
GOOGLE_MAPS_SERVER_KEY=AIza...

# Stripe
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Backend
EXPO_PUBLIC_API_URL=http://localhost:3000
DATABASE_URL=postgresql://user:pass@localhost:5432/rideflow
REDIS_URL=redis://localhost:6379

# Expo
EXPO_PUBLIC_APP_NAME=RideFlow
```

---

## 11. Non-Goals (What We're NOT Building)

To keep scope manageable and avoid over-engineering:

- ❌ Surge pricing algorithm (use simple multiplier)
- ❌ Driver background checks
- ❌ In-app chat (use phone call link)
- ❌ Multi-stop rides
- ❌ Scheduled rides
- ❌ Split fare
- ❌ Loyalty program
- ❌ Admin dashboard (separate project)
- ❌ Complex routing algorithm (use Google Directions API)

---

## 12. Verification Checklist

After each feature, verify:
- [ ] Feature works on both iOS and Android (or at least one)
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Existing features still work (regression check)
- [ ] State persists correctly (app restart)
- [ ] Loading and error states are handled

---

## 13. Reference Repositories

| Repository | What to Learn |
|---|---|
| [adrianhajdin/uber](https://github.com/adrianhajdin/uber) | Full-stack Uber clone with Expo, Clerk, Stripe, Google Maps |
| [JasonTM17/Crab_Mobile_Flutter](https://github.com/JasonTM17/Crab_Mobile_Flutter) | Microservices architecture with NestJS, 9 services |
| [khasawn2-dotcom/doz-app](https://github.com/khasawn2-dotcom/doz-app) | Go microservices backend, Flutter frontend |
| [AmanuelYirgalem21/Local-Uber-App](https://github.com/AmanuelYirgalem21/Local-Uber-App) | NestJS + PostgreSQL + Prisma microservices |

---

## 14. Source

This specification is informed by:
- **Video:** "How to Actually Build Mobile Apps with AI in 2026" (youtube.com/watch?v=Q7AYc2kECDI)
- **Workflow:** Practical Vibe Coding — structured AI-assisted development
- **Framework:** Multi-Agent Development Framework (MULTI_AGENT_FRAMEWORK.md)
- **Research:** GitHub repositories for ride-hailing microservices architectures
