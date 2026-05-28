import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../../store/useLocation';
import { useRide } from '../../store/useRide';
import { useAuth } from '../../store/useAuth';
import { haversineDistance, estimateDurationMinutes } from '../../lib/location';
import { BASE_FARE, PER_KM_RATE, PER_MINUTE_RATE } from '../../lib/constants';
import api from '../../lib/api';
import type { DriverInfo } from '../../types/ride';

// Mock driver data for simulation
const MOCK_DRIVERS: DriverInfo[] = [
  {
    id: 'driver-001',
    fullName: 'Marcus Johnson',
    rating: 4.92,
    totalRides: 1247,
    vehicleMake: 'Toyota',
    vehicleModel: 'Camry',
    vehicleColor: 'White',
    licensePlate: '7ABC123',
    currentLat: 37.7760,
    currentLng: -122.4180,
  },
  {
    id: 'driver-002',
    fullName: 'Sarah Chen',
    rating: 4.88,
    totalRides: 892,
    vehicleMake: 'Honda',
    vehicleModel: 'Accord',
    vehicleColor: 'Black',
    licensePlate: '8XYZ789',
    currentLat: 37.7730,
    currentLng: -122.4210,
  },
  {
    id: 'driver-003',
    fullName: 'David Kim',
    rating: 4.95,
    totalRides: 2103,
    vehicleMake: 'Tesla',
    vehicleModel: 'Model 3',
    vehicleColor: 'Silver',
    licensePlate: '9EV2024',
    currentLat: 37.7780,
    currentLng: -122.4150,
  },
];

export default function RideMatchingPage() {
  const navigate = useNavigate();
  const { pickup, destination } = useLocation();
  const { setCurrentRide, setDriver, selectedRideType, fareEstimates, setIsMatching } = useRide();
  const { user } = useAuth();
  const [dots, setDots] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const hasNavigated = useRef(false);

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Elapsed time counter
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate matching (3-5 seconds)
  useEffect(() => {
    if (!pickup || !destination) {
      navigate('/ride/request', { replace: true });
      return;
    }

    setIsMatching(true);
    const matchDelay = 3000 + Math.random() * 2000; // 3-5 seconds

    const timer = setTimeout(async () => {
      if (hasNavigated.current) return;
      hasNavigated.current = true;

      // Pick a random mock driver
      const driver = MOCK_DRIVERS[Math.floor(Math.random() * MOCK_DRIVERS.length)];

      // Calculate fare
      const dist = haversineDistance(pickup, destination);
      const dur = estimateDurationMinutes(dist);
      const multiplier = selectedRideType === 'standard' ? 1 : selectedRideType === 'comfort' ? 1.5 : 2.0;
      const fare = Math.round((BASE_FARE + dist * PER_KM_RATE + dur * PER_MINUTE_RATE) * multiplier * 100) / 100;

      // Try to create ride via API
      let rideId = `ride-${Date.now()}`;
      try {
        const res = await api.post('/rides', {
          pickupLat: pickup.lat,
          pickupLng: pickup.lng,
          pickupAddress: pickup.address,
          destinationLat: destination.lat,
          destinationLng: destination.lng,
          destinationAddress: destination.address,
          rideType: selectedRideType.toUpperCase(),
        });
        rideId = res.data.data.id;
      } catch {
        // Backend not available — use local mock
      }

      const ride = {
        id: rideId,
        riderId: user?.id || 'rider-mock',
        driverId: driver.id,
        status: 'matched' as const,
        pickup,
        destination,
        rideType: selectedRideType,
        fareEstimate: fare,
        distanceKm: dist,
        durationMinutes: dur,
        requestedAt: new Date().toISOString(),
        matchedAt: new Date().toISOString(),
      };

      setCurrentRide(ride);
      setDriver(driver);
      setIsMatching(false);
      navigate('/ride/active', { replace: true });
    }, matchDelay);

    return () => clearTimeout(timer);
  }, [pickup, destination, navigate, setCurrentRide, setDriver, selectedRideType, setIsMatching, user]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      {/* Animated spinner */}
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-accent rounded-full animate-spin" />
        <div className="absolute inset-4 border-4 border-transparent border-b-gray-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl">🚗</span>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Finding your driver{dots}
      </h1>
      <p className="text-gray-500 text-center mb-6">
        This usually takes less than a minute
      </p>

      {/* Trip summary */}
      <div className="w-full max-w-sm bg-gray-50 rounded-xl p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center mt-1">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
            <div className="w-0.5 h-8 bg-gray-300" />
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-xs text-gray-500">Pickup</p>
              <p className="text-sm font-medium text-gray-900 line-clamp-1">{pickup?.address}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Destination</p>
              <p className="text-sm font-medium text-gray-900 line-clamp-1">{destination?.address}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
          <span className="text-gray-500">Ride type</span>
          <span className="font-medium capitalize">{selectedRideType}</span>
        </div>
        {fareEstimates.length > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Estimated fare</span>
            <span className="font-medium">
              ${fareEstimates.find((e) => e.rideType === selectedRideType)?.price.toFixed(2) || '—'}
            </span>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-6">
        {elapsed}s elapsed
      </p>

      <button
        onClick={() => {
          setIsMatching(false);
          navigate('/ride/request', { replace: true });
        }}
        className="mt-4 text-sm text-gray-500 underline"
      >
        Cancel
      </button>
    </div>
  );
}
