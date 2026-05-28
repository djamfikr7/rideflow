import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriver } from '../../store/useDriver';
import { useRide } from '../../store/useRide';
import { useAuth } from '../../store/useAuth';
import api from '../../lib/api';
import type { Ride, DriverInfo } from '../../types/ride';

const COUNTDOWN_SECONDS = 15;

// Mock ride request for when backend isn't available
const MOCK_RIDE_REQUEST: Ride = {
  id: 'ride-incoming-001',
  riderId: 'rider-mock-001',
  status: 'requested',
  pickup: {
    lat: 37.7749,
    lng: -122.4194,
    address: '123 Market Street, San Francisco',
  },
  destination: {
    lat: 37.7849,
    lng: -122.4094,
    address: '456 Mission Street, San Francisco',
  },
  rideType: 'standard',
  fareEstimate: 12.50,
  distanceKm: 3.2,
  durationMinutes: 8,
  requestedAt: new Date().toISOString(),
};

export default function IncomingRidePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { incomingRideId, setIncomingRide } = useDriver();
  const { setCurrentRide, setDriver } = useRide();
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [rideRequest, setRideRequest] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const countdownRef = useRef<ReturnType<typeof setInterval>>();
  const hasResponded = useRef(false);

  // Load ride request
  useEffect(() => {
    loadRideRequest();

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!loading && rideRequest) {
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            if (!hasResponded.current) handleReject();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [loading, rideRequest]);

  const loadRideRequest = async () => {
    setLoading(true);
    try {
      if (incomingRideId) {
        const res = await api.get(`/rides/${incomingRideId}`);
        setRideRequest(res.data.data || res.data);
      } else {
        // Use mock
        setRideRequest(MOCK_RIDE_REQUEST);
      }
    } catch {
      // Backend unavailable — use mock
      setRideRequest(MOCK_RIDE_REQUEST);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (hasResponded.current) return;
    hasResponded.current = true;
    if (countdownRef.current) clearInterval(countdownRef.current);

    try {
      await api.post(`/rides/${rideRequest?.id}/accept`);
    } catch {
      // Backend unavailable — proceed locally
    }

    if (rideRequest) {
      setCurrentRide({ ...rideRequest, status: 'matched', driverId: user?.id });
      // Create a mock driver info for self
      const driverInfo: DriverInfo = {
        id: user?.id || 'driver-self',
        fullName: user?.fullName || 'Driver',
        rating: 4.9,
        totalRides: 100,
        vehicleMake: 'Toyota',
        vehicleModel: 'Camry',
        vehicleColor: 'White',
        licensePlate: 'ABC1234',
        currentLat: 37.7749,
        currentLng: -122.4194,
      };
      setDriver(driverInfo);
    }

    setIncomingRide(null);
    navigate('/driver/ride', { replace: true });
  };

  const handleReject = () => {
    if (hasResponded.current) return;
    hasResponded.current = true;
    if (countdownRef.current) clearInterval(countdownRef.current);

    try {
      if (rideRequest) {
        api.post(`/rides/${rideRequest.id}/reject`).catch(() => {});
      }
    } catch {
      // Ignore
    }

    setIncomingRide(null);
    navigate('/driver', { replace: true });
  };

  if (loading || !rideRequest) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-accent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 mt-3">Loading ride request...</p>
        </div>
      </div>
    );
  }

  const fare = rideRequest.fareEstimate ?? 0;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with countdown */}
      <div className="bg-accent text-white px-6 py-4 text-center">
        <p className="text-sm font-medium opacity-80">New Ride Request</p>
        <p className="text-4xl font-bold mt-1">{countdown}s</p>
        <p className="text-xs opacity-60 mt-1">Auto-decline in {countdown} seconds</p>
      </div>

      {/* Ride details */}
      <div className="flex-1 px-6 py-6">
        <div className="max-w-sm mx-auto space-y-6">
          {/* Fare */}
          <div className="text-center">
            <p className="text-sm text-gray-500">Estimated Fare</p>
            <p className="text-4xl font-bold text-gray-900">${fare.toFixed(2)}</p>
          </div>

          {/* Route */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-2">
              <div className="flex flex-col items-center mt-1">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                <div className="w-0.5 h-8 bg-gray-300" />
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Pickup</p>
                  <p className="text-sm font-medium text-gray-900">{rideRequest.pickup.address}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Destination</p>
                  <p className="text-sm font-medium text-gray-900">{rideRequest.destination.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trip info */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Distance</p>
              <p className="font-bold text-gray-900">
                {rideRequest.distanceKm ? `${rideRequest.distanceKm.toFixed(1)} km` : '—'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Duration</p>
              <p className="font-bold text-gray-900">
                {rideRequest.durationMinutes ? `${rideRequest.durationMinutes} min` : '—'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Type</p>
              <p className="font-bold text-gray-900 capitalize">{rideRequest.rideType}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleReject}
              className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-colors"
            >
              Reject
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 bg-green-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-600 transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
