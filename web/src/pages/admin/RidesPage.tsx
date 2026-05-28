import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../lib/api';

interface AdminRide {
  id: string;
  status: string;
  fareEstimate: number | null;
  fareFinal: number | null;
  pickupAddress: string;
  destinationAddress: string;
  rideType: string;
  distanceKm: number | null;
  durationMinutes: number | null;
  rider: { id: string; fullName: string; phone: string | null };
  driver: { id: string; fullName: string; phone: string | null } | null;
  requestedAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
}

export default function RidesPage() {
  const [rides, setRides] = useState<AdminRide[]>([]);
  const [filtered, setFiltered] = useState<AdminRide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRide, setSelectedRide] = useState<AdminRide | null>(null);

  useEffect(() => {
    loadRides();
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFiltered(rides);
    } else {
      setFiltered(rides.filter((r) => r.status === statusFilter));
    }
  }, [rides, statusFilter]);

  const loadRides = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/rides');
      const data = res.data.data || res.data;
      setRides(Array.isArray(data) ? data : []);
    } catch {
      setRides([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
      case 'DRIVER_ARRIVING': return 'bg-indigo-100 text-indigo-700';
      case 'MATCHED': return 'bg-yellow-100 text-yellow-700';
      case 'REQUESTED': return 'bg-orange-100 text-orange-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const statuses = ['all', 'REQUESTED', 'MATCHED', 'DRIVER_ARRIVING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading rides..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Rides</h1>

        {/* Status Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-full text-[10px] font-semibold whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-accent text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Ride Count */}
        <p className="text-xs text-gray-500 mb-3">{filtered.length} rides</p>

        {/* Rides List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <span className="text-4xl">🚗</span>
            <p className="text-gray-500 mt-3">No rides found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((ride) => (
              <button
                key={ride.id}
                onClick={() => setSelectedRide(selectedRide?.id === ride.id ? null : ride)}
                className="w-full text-left bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {ride.pickupAddress}
                    </p>
                    <p className="text-xs text-gray-400">→ {ride.destinationAddress}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize ${getStatusColor(
                      ride.status
                    )}`}
                  >
                    {ride.status.replace('_', ' ').toLowerCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {ride.rider.fullName}
                    {ride.driver ? ` · Driver: ${ride.driver.fullName}` : ' · No driver'}
                  </span>
                  <span className="font-semibold text-gray-700">
                    ${(ride.fareFinal ?? ride.fareEstimate ?? 0).toFixed(2)}
                  </span>
                </div>

                <p className="text-[10px] text-gray-300 mt-1">{formatDate(ride.requestedAt)}</p>

                {/* Expanded Details */}
                {selectedRide?.id === ride.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-xs">
                        <span className="text-gray-500">Ride ID</span>
                        <p className="text-gray-700 font-mono">{ride.id.slice(0, 8)}...</p>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">Type</span>
                        <p className="text-gray-700 capitalize">{ride.rideType.toLowerCase()}</p>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">Distance</span>
                        <p className="text-gray-700">{ride.distanceKm?.toFixed(1) ?? 'N/A'} km</p>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">Duration</span>
                        <p className="text-gray-700">{ride.durationMinutes ?? 'N/A'} min</p>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">Rider Phone</span>
                        <p className="text-gray-700">{ride.rider.phone ?? 'N/A'}</p>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">Driver Phone</span>
                        <p className="text-gray-700">{ride.driver?.phone ?? 'N/A'}</p>
                      </div>
                    </div>
                    {ride.completedAt && (
                      <div className="text-xs">
                        <span className="text-gray-500">Completed</span>
                        <p className="text-gray-700">{formatDate(ride.completedAt)}</p>
                      </div>
                    )}
                    {ride.cancelledAt && (
                      <div className="text-xs">
                        <span className="text-gray-500">Cancelled</span>
                        <p className="text-gray-700">{formatDate(ride.cancelledAt)}</p>
                      </div>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
