# Backend Service Reference

> All backend services, endpoints, models, and Socket.IO events.

---

## Overview

**Stack:** Node.js + Express 5.1 + Prisma 6.9 + PostgreSQL 16 + Socket.IO 4.8

**Gateway:** Single Express process (`backend/src/gateway.ts`) on port 3000 with service-based routing.

### Service Routing

| Route Prefix | Service | File |
|--------------|---------|------|
| `/api/auth/*` | Auth Service | `backend/src/services/auth.ts` |
| `/api/rides/*` | Ride Service | `backend/src/services/ride.ts` |
| `/api/matching/*` | Matching Service | `backend/src/services/matching.ts` |
| `/api/payments/*` | Payment Service | `backend/src/services/payment.ts` |
| `/api/fare-estimate` | Fare Estimate (inline) | `backend/src/gateway.ts` |
| `/health` | Health Check | `backend/src/gateway.ts` |

---

## Auth Service

**File:** `backend/src/services/auth.ts`

### Endpoints

#### POST /api/auth/register

Create a new user account.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | `string` | yes | Valid email format |
| `password` | `string` | yes | Min 6 characters |
| `fullName` | `string` | yes | Min 1 character |
| `phone` | `string` | no | — |
| `role` | `"RIDER" \| "DRIVER"` | no | Default: "RIDER" |

**Response (201):**
```json
{
  "data": {
    "user": { "id", "email", "fullName", "phone", "avatarUrl", "role", "createdAt" },
    "token": "jwt-token"
  },
  "message": "User registered successfully"
}
```

**Errors:** 409 (email already exists)

**Notes:** If role is "DRIVER", creates a DriverProfile placeholder with "Unknown" vehicle info.

#### POST /api/auth/login

Authenticate user and return JWT token.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | `string` | yes | Valid email format |
| `password` | `string` | yes | Min 1 character |

**Response (200):**
```json
{
  "data": {
    "user": { "id", "email", "fullName", "phone", "avatarUrl", "role", "driverProfile", "createdAt" },
    "token": "jwt-token"
  },
  "message": "Login successful"
}
```

**Errors:** 401 (invalid credentials)

#### GET /api/auth/me

Get current user profile. Requires authentication.

**Response (200):**
```json
{
  "data": { "id", "email", "fullName", "phone", "avatarUrl", "role", "driverProfile", "createdAt" }
}
```

**Errors:** 404 (user not found)

#### PUT /api/auth/profile

Update user profile. Requires authentication.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `fullName` | `string` | no | Min 1 character |
| `phone` | `string` | no | — |
| `avatarUrl` | `string` | no | Valid URL |

**Response (200):**
```json
{
  "data": { "id", "email", "fullName", "phone", "avatarUrl", "role", "createdAt" },
  "message": "Profile updated successfully"
}
```

#### POST /api/auth/driver-profile

Create or update driver profile. Requires authentication + DRIVER role.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `vehicleMake` | `string` | yes | Min 1 character |
| `vehicleModel` | `string` | yes | Min 1 character |
| `vehicleYear` | `number` | yes | 1990 to current year + 1 |
| `vehicleColor` | `string` | yes | Min 1 character |
| `licensePlate` | `string` | yes | Min 1 character |
| `vehicleType` | `"STANDARD" \| "COMFORT" \| "PREMIUM"` | no | Default: "STANDARD" |

**Response (200):**
```json
{
  "data": { "id", "userId", "vehicleMake", "vehicleModel", "vehicleYear", "vehicleColor", "licensePlate", "vehicleType" },
  "message": "Driver profile updated successfully"
}
```

#### GET /api/auth/driver-profile

Get current driver's profile. Requires authentication + DRIVER role.

**Response (200):**
```json
{
  "data": { "id", "userId", "vehicleMake", "vehicleModel", "vehicleYear", "vehicleColor", "licensePlate", "vehicleType", "isAvailable", "rating", "totalRides" }
}
```

---

## Ride Service

**File:** `backend/src/services/ride.ts`

### Endpoints

#### POST /api/rides

Create a new ride request. Requires authentication + RIDER role.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `pickupLat` | `number` | yes | -90 to 90 |
| `pickupLng` | `number` | yes | -180 to 180 |
| `pickupAddress` | `string` | yes | Min 1 character |
| `destinationLat` | `number` | yes | -90 to 90 |
| `destinationLng` | `number` | yes | -180 to 180 |
| `destinationAddress` | `string` | yes | Min 1 character |
| `rideType` | `"STANDARD" \| "COMFORT" \| "PREMIUM"` | no | Default: "STANDARD" |

**Response (201):**
```json
{
  "data": {
    "id", "riderId", "driverId", "status",
    "pickup": { "lat", "lng", "address" },
    "destination": { "lat", "lng", "address" },
    "rideType", "fareEstimate", "distanceKm", "durationMinutes", "requestedAt"
  },
  "message": "Ride requested successfully"
}
```

**Errors:** 400 (already has active ride)

**Socket Event:** Emits `ride-requested` globally with ride details.

#### GET /api/rides/:id

Get ride details. Requires authentication (rider or driver of the ride).

**Response (200):**
```json
{
  "data": {
    "id", "riderId", "driverId", "status",
    "pickup", "destination", "rideType",
    "fareEstimate", "fareFinal", "distanceKm", "durationMinutes",
    "requestedAt", "matchedAt", "startedAt", "completedAt", "cancelledAt",
    "cancellationReason", "driver", "ratings"
  }
}
```

**Errors:** 403 (not authorized), 404 (not found)

#### PUT /api/rides/:id/status

Update ride status. Requires authentication + DRIVER role.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `status` | `"DRIVER_ARRIVING" \| "IN_PROGRESS" \| "COMPLETED"` | yes | Valid transition only |

**Valid Status Transitions:**
- `MATCHED` -> `DRIVER_ARRIVING`
- `DRIVER_ARRIVING` -> `IN_PROGRESS`
- `IN_PROGRESS` -> `COMPLETED`

**Response (200):**
```json
{
  "data": { "id", "status", "startedAt", "completedAt", "fareFinal" },
  "message": "Ride status updated to IN_PROGRESS"
}
```

**Socket Event:** Emits `ride-status-update` globally.

#### GET /api/rides/history/list

Get ride history. Requires authentication. Paginated.

| Query Param | Type | Default | Description |
|-------------|------|---------|-------------|
| `page` | `number` | 1 | Page number |
| `limit` | `number` | 10 | Items per page |

**Response (200):**
```json
{
  "data": [/* ride objects */],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

#### POST /api/rides/:id/cancel

Cancel a ride. Requires authentication (rider or driver).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reason` | `string` | no | Cancellation reason |

**Response (200):**
```json
{
  "data": { "id", "status", "cancelledAt", "cancellationReason" },
  "message": "Ride cancelled"
}
```

**Errors:** 400 (already completed/cancelled)

**Socket Event:** Emits `ride-status-update` with status "CANCELLED".

#### POST /api/rides/:id/rate

Rate a completed ride. Requires authentication (rider or driver).

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `score` | `number` | yes | 1-5 integer |
| `comment` | `string` | no | — |

**Response (201):**
```json
{
  "data": { "id", "rideId", "fromUserId", "toUserId", "score", "comment", "createdAt" },
  "message": "Rating submitted successfully"
}
```

**Errors:** 400 (not completed, already rated)

**Notes:** If rider rates driver, updates driver's average rating in DriverProfile.

---

## Matching Service

**File:** `backend/src/services/matching.ts`

### Endpoints

#### POST /api/matching/find-driver

Find nearby available drivers. Requires authentication + RIDER role.

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `rideId` | `string` (UUID) | yes | — |
| `maxRadiusKm` | `number` | no | 10 |

**Response (200):**
```json
{
  "data": {
    "drivers": [
      {
        "id", "fullName", "avatarUrl", "rating", "totalRides",
        "vehicleMake", "vehicleModel", "vehicleColor", "licensePlate",
        "currentLat", "currentLng", "distanceKm"
      }
    ],
    "count": 3
  },
  "message": "Found 3 nearby drivers"
}
```

**Matching Algorithm:**
1. Query all available drivers with location
2. Filter by distance (within `maxRadiusKm`)
3. Sort by composite score: `rating * 2 - distanceKm`
4. Return top 5 drivers

**Socket Event:** Emits `ride-request-available` to each nearby driver's room.

#### POST /api/matching/accept

Driver accepts a ride. Requires authentication + DRIVER role.

| Field | Type | Required |
|-------|------|----------|
| `rideId` | `string` (UUID) | yes |

**Response (200):**
```json
{
  "data": { "id", "status", "matchedAt", "driverId" },
  "message": "Ride accepted successfully"
}
```

**Socket Events:**
- Emits `driver-matched` to rider's room with driver info
- Emits `ride-taken` globally to notify other drivers

#### POST /api/matching/reject

Driver rejects a ride. Requires authentication + DRIVER role.

| Field | Type | Required |
|-------|------|----------|
| `rideId` | `string` (UUID) | yes |
| `reason` | `string` | no |

**Response (200):**
```json
{
  "data": { "rideId", "driverId", "rejected": true },
  "message": "Ride rejected"
}
```

**Notes:** Ride remains in REQUESTED status — matching service continues looking.

#### PUT /api/matching/driver-location

Update driver's current location. Requires authentication + DRIVER role.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `lat` | `number` | yes | -90 to 90 |
| `lng` | `number` | yes | -180 to 180 |

**Response (200):**
```json
{
  "data": { "lat", "lng" },
  "message": "Location updated"
}
```

**Socket Event:** If driver has active ride, emits `driver-location` to rider's room.

#### PUT /api/matching/driver-availability

Toggle driver availability. Requires authentication + DRIVER role.

| Field | Type | Required |
|-------|------|----------|
| `isAvailable` | `boolean` | yes |

**Response (200):**
```json
{
  "data": { "isAvailable": true },
  "message": "Driver is now available"
}
```

---

## Payment Service

**File:** `backend/src/services/payment.ts`

### Endpoints

#### POST /api/payments/process

Process payment for a completed ride. Requires authentication.

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `rideId` | `string` (UUID) | yes | — |
| `paymentMethod` | `"card" \| "cash" \| "wallet"` | no | "card" |

**Response (200):**
```json
{
  "data": {
    "paymentId", "rideId", "amount", "currency", "status",
    "paymentIntentId", "createdAt"
  },
  "message": "Payment processed successfully"
}
```

**Errors:** 400 (not completed, already paid), 402 (payment failed), 403 (not rider), 404 (not found)

**Simulated Stripe:** 95% success rate, 500ms processing delay, generates fake `pi_simulated_*` payment intent IDs.

**Socket Event:** Emits `payment-processed` to rider and driver rooms.

#### GET /api/payments/history

Get payment history. Requires authentication. Paginated.

| Query Param | Type | Default |
|-------------|------|---------|
| `page` | `number` | 1 |
| `limit` | `number` | 10 |

**Response (200):**
```json
{
  "data": [
    {
      "id", "rideId", "amount", "currency", "status",
      "paymentIntentId", "createdAt",
      "ride": { "id", "pickupAddress", "destinationAddress", "completedAt" }
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10
}
```

#### GET /api/payments/:id

Get payment details. Requires authentication.

**Response (200):**
```json
{
  "data": {
    "id", "rideId", "amount", "currency", "status",
    "paymentIntentId", "createdAt",
    "ride": { "id", "pickupAddress", "destinationAddress", "fareEstimate", "fareFinal", "completedAt" }
  }
}
```

---

## Fare Estimate Endpoint

**File:** `backend/src/gateway.ts`

#### POST /api/fare-estimate

Calculate fare estimates for all ride types. No authentication required.

| Field | Type | Required |
|-------|------|----------|
| `pickupLat` | `number` | yes |
| `pickupLng` | `number` | yes |
| `destinationLat` | `number` | yes |
| `destinationLng` | `number` | yes |

**Response (200):**
```json
{
  "data": [
    { "rideType": "standard", "distance", "duration", "price", "currency": "USD", "surgeMultiplier" },
    { "rideType": "comfort", ... },
    { "rideType": "premium", ... }
  ]
}
```

---

## Socket.IO Events

**File:** `backend/src/services/notification.ts`

### Authentication

Socket.IO connections require JWT token in `auth.token` or `query.token`. Token is verified against `JWT_SECRET`.

### Rooms

| Room Pattern | Description |
|--------------|-------------|
| `user-{userId}` | User-specific room |
| `rider-{userId}` | Rider-specific room |
| `driver-{userId}` | Driver-specific room |
| `ride-{rideId}` | Ride-specific room |
| `available-drivers` | All online drivers |

### Client -> Server Events

| Event | Data | Description |
|-------|------|-------------|
| `driver-online` | `{ lat, lng }` | Driver goes online, joins available-drivers room |
| `driver-offline` | — | Driver goes offline, leaves available-drivers room |
| `update-location` | `{ lat, lng }` | Driver updates location, notifies rider if active ride |
| `join-ride` | `{ rideId }` | Join ride room |
| `leave-ride` | `{ rideId }` | Leave ride room |
| `send-message` | `{ rideId, message }` | Send chat message to ride room |

### Server -> Client Events

| Event | Data | Emitted To | Description |
|-------|------|------------|-------------|
| `ride-requested` | `{ rideId, riderId, pickup, destination, rideType, fareEstimate }` | Global | New ride requested |
| `ride-request-available` | `{ rideId, pickup, destination, fareEstimate, distanceKm }` | Driver rooms | Ride available for driver |
| `driver-matched` | `{ rideId, driver }` | Rider room | Driver matched to ride |
| `ride-taken` | `{ rideId }` | Global | Ride taken by another driver |
| `ride-status-update` | `{ rideId, status, riderId, driverId }` | Global | Ride status changed |
| `driver-location` | `{ rideId, driverId, lat, lng }` | Rider room | Driver location update |
| `payment-processed` | `{ rideId, paymentId, status, amount }` | Rider + Driver rooms | Payment completed |
| `new-message` | `{ rideId, userId, message, timestamp }` | Ride room | Chat message |

---

## Database Models

### User

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `email` | String (unique) | User email |
| `password` | String | Bcrypt hashed password |
| `fullName` | String | Display name |
| `phone` | String? | Phone number |
| `avatarUrl` | String? | Avatar URL |
| `role` | Enum (RIDER, DRIVER) | User role |
| `createdAt` | DateTime | Account creation time |

### DriverProfile

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `userId` | UUID (FK -> User) | Owner user |
| `vehicleMake` | String | e.g., "Toyota" |
| `vehicleModel` | String | e.g., "Camry" |
| `vehicleYear` | Int | e.g., 2023 |
| `vehicleColor` | String | e.g., "Silver" |
| `licensePlate` | String | e.g., "ABC-1234" |
| `vehicleType` | Enum (STANDARD, COMFORT, PREMIUM) | Vehicle class |
| `isAvailable` | Boolean | Whether accepting rides |
| `currentLat` | Float? | Current latitude |
| `currentLng` | Float? | Current longitude |
| `rating` | Float | Average rating (0-5) |
| `totalRides` | Int | Total rides completed |

### Ride

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `riderId` | UUID (FK -> User) | Rider |
| `driverId` | UUID? (FK -> User) | Assigned driver |
| `status` | Enum | REQUESTED, MATCHED, DRIVER_ARRIVING, IN_PROGRESS, COMPLETED, CANCELLED |
| `pickupLat` | Float | Pickup latitude |
| `pickupLng` | Float | Pickup longitude |
| `pickupAddress` | String | Pickup address |
| `destinationLat` | Float | Destination latitude |
| `destinationLng` | Float | Destination longitude |
| `destinationAddress` | String | Destination address |
| `rideType` | Enum | STANDARD, COMFORT, PREMIUM |
| `fareEstimate` | Float | Estimated fare (USD) |
| `fareFinal` | Float? | Final fare (USD) |
| `distanceKm` | Float? | Distance in km |
| `durationMinutes` | Int? | Duration in minutes |
| `requestedAt` | DateTime | Request time |
| `matchedAt` | DateTime? | Match time |
| `startedAt` | DateTime? | Trip start time |
| `completedAt` | DateTime? | Trip end time |
| `cancelledAt` | DateTime? | Cancellation time |
| `cancellationReason` | String? | Cancellation reason |

### Payment

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `rideId` | UUID (FK -> Ride) | Associated ride |
| `userId` | UUID (FK -> User) | Payer |
| `stripePaymentIntentId` | String | Stripe payment intent ID |
| `amount` | Float | Amount in USD |
| `currency` | String | Currency code (USD) |
| `status` | Enum | PENDING, SUCCEEDED, FAILED, REFUNDED |
| `createdAt` | DateTime | Payment time |

### Rating

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `rideId` | UUID (FK -> Ride) | Associated ride |
| `fromUserId` | UUID (FK -> User) | Rater |
| `toUserId` | UUID (FK -> User) | Ratee |
| `score` | Int | 1-5 stars |
| `comment` | String? | Optional comment |
| `createdAt` | DateTime | Rating time |

### Notification

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `userId` | UUID (FK -> User) | Recipient |
| `type` | String | Notification type |
| `title` | String | Notification title |
| `message` | String | Notification body |
| `data` | JSON | Additional data |
| `read` | Boolean | Whether read |
| `createdAt` | DateTime | Creation time |

---

## Seed Data

**File:** `backend/prisma/seed.ts`

### Test Accounts

| Email | Password | Role | Name |
|-------|----------|------|------|
| `rider@example.com` | `password123` | RIDER | Alice Johnson |
| `rider2@example.com` | `password123` | RIDER | Bob Smith |
| `driver@example.com` | `password123` | DRIVER | Charlie Brown (Toyota Camry, Standard) |
| `driver2@example.com` | `password123` | DRIVER | Diana Prince (Honda Accord, Comfort) |
| `driver3@example.com` | `password123` | DRIVER | Edward Norton (Mercedes E-Class, Premium) |

### Sample Data
- 3 rides (1 completed, 1 in-progress, 1 requested)
- 2 ratings (both 5 stars for completed ride)
- 1 payment ($15.50 for completed ride)
- 2 notifications

---

## Error Handling

### Error Classes

| Class | Status Code | Usage |
|-------|-------------|-------|
| `AppError` | Custom | Base error class |
| `NotFoundError` | 404 | Resource not found |
| `UnauthorizedError` | 401 | Missing/invalid token |
| `ForbiddenError` | 403 | Insufficient permissions |
| `BadRequestError` | 400 | Invalid request data |
| `ConflictError` | 409 | Duplicate resource |

### Error Response Format

```json
{
  "error": {
    "message": "Human-readable error message",
    "status": 400,
    "details": [] // Optional: Zod validation errors
  }
}
```

### Middleware

- **authenticate:** Extracts JWT from `Authorization: Bearer <token>` header, verifies, attaches `req.user`
- **requireRole(...roles):** Checks `req.user.role` against allowed roles
- **errorHandler:** Catches AppError, ZodError, Prisma errors, returns appropriate HTTP responses
