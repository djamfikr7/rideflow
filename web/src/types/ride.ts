export type RideStatus =
  | 'requested'
  | 'matched'
  | 'driver_arriving'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type RideType = 'standard' | 'comfort' | 'premium';

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface FareEstimate {
  rideType: RideType;
  distance: number;
  duration: number;
  price: number;
  currency: string;
}

export interface Ride {
  id: string;
  riderId: string;
  driverId?: string;
  status: RideStatus;
  pickup: Location;
  destination: Location;
  rideType: RideType;
  fareEstimate?: number;
  fareFinal?: number;
  distanceKm?: number;
  durationMinutes?: number;
  requestedAt: string;
  matchedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface DriverInfo {
  id: string;
  fullName: string;
  avatarUrl?: string;
  rating: number;
  totalRides: number;
  vehicleMake: string;
  vehicleModel: string;
  vehicleColor: string;
  licensePlate: string;
  currentLat: number;
  currentLng: number;
}

export type PaymentMethod = 'card' | 'cash' | 'wallet';

export interface RideRating {
  stars: number;
  comment?: string;
  submittedAt: string;
}
