import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../../components/map/Map';
import DriverInfoCard from '../../components/ride/DriverInfoCard';
import { useRide } from '../../store/useRide';
import { useLocation } from '../../store/useLocation';
import { getSocket, connectSocket, disconnectSocket } from '../../lib/socket';
import { useAuth } from '../../store/useAuth';

type RideStep = 'driver_arriving' | 'in_progress' | 'completed';

const STEPS: { key: RideStep; label: string; icon: string }[] = [
  { key: 'driver_arriving', label: 'Driver Arriving', icon: '📍' },
  { key: 'in_progress', label: 'In Progress', icon: '🚗' },
  { key: 'completed', label: 'Completed', icon: '✅' },
];

export default function ActiveRidePage() {
  const navigate = useNavigate();
  const { currentRide, driver, setCurrentRide, setDriver, updateDriverLocation } = useRide();
  const { pickup, destination } = useLocation();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<RideStep>('driver_arriving');
  const [simTimer, setSimTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!currentRide || !pickup || !destination) {
      navigate('/', { replace: true });
      return;
    }

    // Connect socket for real-time updates
    if (user) {
      const socket = connectSocket(user.id);
      socket.on('ride:status', (data: { status: string }) => {
        if (data.status === 'in_progress') setCurrentStep('in_progress');
        if (data.status === 'completed') setCurrentStep('completed');
      });
      socket.on('driver:location', (data: { lat: number; lng: number }) => {
        updateDriverLocation(data.lat, data.lng);
      });
    }

    // Simulate ride progression for demo
    const t1 = setTimeout(() => {
      setCurrentStep('in_progress');
      setCurrentRide({ ...currentRide, status: 'in_progress', startedAt: new Date().toISOString() });
    }, 8000);

    const t2 = setTimeout(() => {
      setCurrentStep('completed');
      setCurrentRide({ ...currentRide, status: 'completed', completedAt: new Date().toISOString() });
    }, 18000);

    setSimTimer(t2);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      disconnectSocket();
    };
  }, []);

  const handleProceedToPayment = () => {
    navigate('/ride/payment', { replace: true });
  };

  if (!currentRide || !pickup || !destination) return null;

  const stepIndex = STEPS.findIndex((s) => s.key === currentStep);

  // Generate a simple straight-line route between pickup and destination
  const routeCoords: [number, number][] = [
    [pickup.lat, pickup.lng],
    [destination.lat, destination.lng],
  ];

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Map area */}
      <div className="flex-1 relative">
        <Map
          pickup={pickup}
          destination={destination}
          driverLocation={driver ? { lat: driver.currentLat, lng: driver.currentLng } : undefined}
          routeCoords={routeCoords}
        />

        {/* Status badge overlay */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
          <div className="bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <span className="text-lg">{STEPS[stepIndex].icon}</span>
            <span className="font-semibold text-sm text-gray-900">{STEPS[stepIndex].label}</span>
          </div>
        </div>
      </div>

      {/* Bottom panel */}
      <div className="bg-white z-[1001] px-4 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] space-y-4">
        {/* Status stepper */}
        <div className="flex items-center justify-between px-2">
          {STEPS.map((step, i) => (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    i <= stepIndex
                      ? 'bg-accent text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {i < stepIndex ? '✓' : step.icon}
                </div>
                <span className="text-[10px] text-gray-500 mt-1 text-center">{step.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${i < stepIndex ? 'bg-accent' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Driver info */}
        {driver && <DriverInfoCard driver={driver} status={currentStep} />}

        {/* Trip info */}
        <div className="bg-gray-50 rounded-xl p-3 space-y-2">
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

        {/* Proceed button — only when completed */}
        {currentStep === 'completed' && (
          <button
            onClick={handleProceedToPayment}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-colors"
          >
            Proceed to Payment
          </button>
        )}
      </div>
    </div>
  );
}
