export type UserRole = "rider" | "driver";

export interface User {
  id: string;
  clerkId: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
}

export interface DriverProfile {
  id: string;
  userId: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleColor: string;
  licensePlate: string;
  vehicleType: "standard" | "comfort" | "premium";
  isAvailable: boolean;
  currentLat?: number;
  currentLng?: number;
  rating: number;
  totalRides: number;
}
