import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../../components/map/Map';
import { useRide } from '../../store/useRide';
import { useLocation } from '../../store/useLocation';
import { useAuth } from '../../store/useAuth';
import { useDriver } from '../../store/useDriver';
import { getSocket, connectSocket, disconnectSocket } from '../../lib/socket';
import api from '../../lib/api';

type DriverRidePhase = 'navigate' | 'arrived' | 'in_progress' | 'completed';

const PHASES: { key: DriverRidePhase; label: string; icon: string; action: string }[] = [
  { key: 'navigate', label: 'Navigate to Pickup', icon: '📍', action: 'Arrived at Pickup' },
  { key: 'arrived', label: 'Waiting for Rider', icon: '⏳', action: 'Start Ride' },
  { key: 'in_progress', label: 'Ride in Progress', icon: '🚗', action: 'Complete Ride' },
  { key: 'completed', label: 'Completed', icon: '✅', action: 'Done' },
];

export default function DriverActiveRidePage() {
  const navigate = useNavigate();
  const { currentRide, setCurrentRide, driver } = useRide();
  const { currentLocation } = useLocation();
  const { user } = useAuth();
  const { setTodayEarnings, setTodayRides, todayEarnings, todayRides } = useDriver();
  const [phase, setPhase] = useState<DriverRidePhase>('navigate');

  useEffect(() => {
    if (!currentRide) {
      navigate('/driver', { replace: true });
      return;
    }

    // Connect socket
    if (user) {
      const socket = connectSocket(user.id);
      return () => {
        disconnectSocket();
      };
    }
  }, []);

  const advancePhase = async () => {
    if (!currentRide) return;

    const nextPhase: Record<DriverRidePhase, DriverRidePhase> = {
      navigate: 'arrived',
      arrived: 'in_progress',
      in_progress: 'completed',
      completed: 'completed',
    };

    const newPhase = nextPhase[phase];
    setPhase(newPhase);

    // Update ride status via API
    const statusMap: Record<DriverRidePhase, string> = {
      navigate: 'driver_arriving',
      arrived: 'driver_arriving',
      in_progress: 'in_progress',
      completed: 'completed',
    };

    try {
      await api.put(`/rides/${currentRide.id}/status`, { status: statusMap[newPhase] });
    } catch {
      // Backend unavailable — proceed locally
    }

    if (newPhase === 'completed') {
      const fare = currentRide.fareEstimate ?? 0;
      setCurrentRide({
        ...currentRide,
        status: 'completed',
        completedAt: new Date().toISOString(),
        fareFinal: fare,
      });
      setTodayEarnings(todayEarnings + fare);
      setTodayRides(todayRides + 1);
    }
  };

  const handleFinish = () => {
    navigate('/driver', { replace: true });
  };

  if (!currentRide) return null;

  const currentPhaseConfig = PHASES.find((p) => p.key === phase)!;
  const pickup = currentRide.pickup;
  const destination = currentRide.destination;

  // Route from current location to pickup (navigate) or pickup to destination (ride)
  const routeCoords: [number, number][] =
    phase === 'navigate'
      ? [
          [currentLocation?.lat || pickup.lat, currentLocation?.lng || pickup.lng],
          [pickup.lat, pickup.lng],
        ]
      : [
          [pickup.lat, pickup.lng],
          [destination.lat, destination.lng],
        ];

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Map */}
      <div className="flex-1 relative">
        <Map
          pickup={phase === 'navigate' ? pickup : undefined}
          destination={phase !== 'navigate' ? destination : undefined}
          driverLocation={currentLocation ? { lat: currentLocation.lat, lng: currentLocation.lng } : undefined}
          routeCoords={routeCoords}
        />

        {/* Phase overlay */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
          <div className="bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <span className="text-lg">{currentPhaseConfig.icon}</span>
            <span className="font-semibold text-sm text-gray-900">{currentPhaseConfig.label}</span>
          </div>
        </div>
      </div>

      {/* Bottom panel */}
      <div className="bg-white z-[1001] px-4 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] space-y-3">
        {/* Phase stepper */}
        <div className="flex items-center justify-between px-1">
          {PHASES.slice(0, 3).map((p, i) => {
            const currentIndex = PHASES.findIndex((x) => x.key === phase);
            const isActive = i <= currentIndex;
            return (
              <div key={p.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                      isActive ? 'bg-accent text-white' : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {i < currentIndex ? '✓' : p.icon}
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1 text-center">{p.label}</span>
                </div>
                {i < 2 && (
                  <div className={`flex-1 h-0.5 mx-1 ${i < currentIndex ? 'bg-accent' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Route info */}
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <div className="flex flex-col items-center mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <div className="w-0.5 h-6 bg-gray-300" />
              <div className="w-2 h-2 bg-red-500 rounded-full" />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-xs text-gray-500">Pickup</p>
                <p className="text-sm font-medium text-gray-900 line-clamp-1">{pickup.address}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Destination</p>
                <p className="text-sm font-medium text-gray-900 line-clamp-1">{destination.address}</p>
              </div>
            </div>
            {currentRide.fareEstimate && (
              <div className="text-right">
                <p className="text-xs text-gray-500">Fare</p>
                <p className="text-lg font-bold text-gray-900">${currentRide.fareEstimate.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action button */}
        {phase !== 'completed' ? (
          <button
            onClick={advancePhase}
            className="w-full bg-accent text-white py-3 rounded-xl font-semibold text-lg hover:bg-blue-600 transition-colors"
          >
            {currentPhaseConfig.action}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
              <p className="text-green-700 font-medium">Ride completed! Earnings: ${(currentRide.fareEstimate ?? 0).toFixed(2)}</p>
            </div>
            <button
              onClick={handleFinish}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
