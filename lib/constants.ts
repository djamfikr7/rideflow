export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export const RIDE_TYPES = [
  {
    id: "standard" as const,
    name: "Standard",
    description: "Affordable, everyday rides",
    multiplier: 1.0,
    icon: "🚗",
  },
  {
    id: "comfort" as const,
    name: "Comfort",
    description: "Newer cars with extra legroom",
    multiplier: 1.5,
    icon: "🚙",
  },
  {
    id: "premium" as const,
    name: "Premium",
    description: "Luxury cars, top-rated drivers",
    multiplier: 2.0,
    icon: "🏎️",
  },
];

export const BASE_FARE = 2.5; // USD
export const PER_KM_RATE = 1.5; // USD per km
export const PER_MINUTE_RATE = 0.2; // USD per minute

export const COLORS = {
  primary: "#000000",
  accent: "#3B82F6",
  success: "#22C55E",
  danger: "#EF4444",
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
};
