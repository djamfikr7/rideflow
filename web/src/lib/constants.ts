export const API_URL = 'http://localhost:3010';

export const MOCK_OTP = '123456';

export const RIDE_TYPES = [
  {
    id: 'standard' as const,
    name: 'Standard',
    description: 'Affordable, everyday rides',
    multiplier: 1.0,
    icon: '🚗',
  },
  {
    id: 'comfort' as const,
    name: 'Comfort',
    description: 'Newer cars with extra legroom',
    multiplier: 1.5,
    icon: '🚙',
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    description: 'Luxury cars, top-rated drivers',
    multiplier: 2.0,
    icon: '🏎️',
  },
];

export const BASE_FARE = 2.5;
export const PER_KM_RATE = 1.5;
export const PER_MINUTE_RATE = 0.2;

export const DEFAULT_CENTER: [number, number] = [37.7749, -122.4194]; // San Francisco
