import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StarRating from '../../components/ui/StarRating';
import { useHistory } from '../../store/useHistory';
import api from '../../lib/api';
import type { Ride } from '../../types/ride';

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  in_progress: 'bg-blue-100 text-blue-700',
  driver_arriving: 'bg-yellow-100 text-yellow-700',
  matched: 'bg-purple-100 text-purple-700',
  requested: 'bg-gray-100 text-gray-700',
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const { rides, setRides, isLoading, setLoading } = useHistory();
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rides/history');
      const data = res.data.data || res.data;
      if (Array.isArray(data)) {
        setRides(data);
      }
    } catch {
      // Backend unavailable — use local history from store
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading history..." />
      </div>
    );
  }

  // Receipt detail view
  if (selectedRide) {
    const fare = selectedRide.fareFinal ?? selectedRide.fareEstimate ?? 0;
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="px-6 pt-6">
          <button onClick={() => setSelectedRide(null)} className="text-gray-500 mb-4">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Ride Receipt</h1>

          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">Status</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[selectedRide.status] || 'bg-gray-100 text-gray-700'}`}>
                {selectedRide.status.replace('_', ' ')}
              </span>
            </div>

            {/* Route */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <div className="flex flex-col items-center mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div className="w-0.5 h-6 bg-gray-300" />
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Pickup</p>
                    <p className="text-sm font-medium text-gray-900">{selectedRide.pickup.address}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Destination</p>
                    <p className="text-sm font-medium text-gray-900">{selectedRide.destination.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">{formatDate(selectedRide.requestedAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Time</span>
                <span className="font-medium">{formatTime(selectedRide.requestedAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ride type</span>
                <span className="font-medium capitalize">{selectedRide.rideType}</span>
              </div>
              {selectedRide.distanceKm && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Distance</span>
                  <span className="font-medium">{selectedRide.distanceKm.toFixed(1)} km</span>
                </div>
              )}
              {selectedRide.durationMinutes && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium">{selectedRide.durationMinutes} min</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment</span>
                <span className="font-medium">Cash</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-gray-900 text-lg">${fare.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="px-6 pt-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Ride History</h1>

        {rides.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl">📋</span>
            <p className="text-gray-500 mt-4">No rides yet</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 bg-black text-white px-6 py-2 rounded-xl font-medium"
            >
              Book a ride
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {rides.map((ride) => {
              const fare = ride.fareFinal ?? ride.fareEstimate ?? 0;
              return (
                <button
                  key={ride.id}
                  onClick={() => setSelectedRide(ride)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {ride.pickup.address}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">→ {ride.destination.address}</p>
                    </div>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${STATUS_COLORS[ride.status] || 'bg-gray-100 text-gray-700'}`}>
                      {ride.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatDate(ride.requestedAt)} · {formatTime(ride.requestedAt)}</span>
                    <span className="font-semibold text-gray-900">${fare.toFixed(2)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
