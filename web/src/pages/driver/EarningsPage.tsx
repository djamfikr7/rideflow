import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useDriver } from '../../store/useDriver';
import api from '../../lib/api';

interface EarningsEntry {
  id: string;
  date: string;
  fare: number;
  pickup: string;
  destination: string;
  rideType: string;
}

export default function EarningsPage() {
  const { todayEarnings, todayRides } = useDriver();
  const [earnings, setEarnings] = useState<EarningsEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/driver/earnings');
      const data = res.data.data || res.data;
      if (Array.isArray(data)) {
        setEarnings(data);
        setTotalEarnings(data.reduce((sum: number, e: EarningsEntry) => sum + e.fare, 0));
      }
    } catch {
      // Backend unavailable — use mock data
      const mockEarnings: EarningsEntry[] = [
        {
          id: 'earn-1',
          date: new Date().toISOString(),
          fare: 15.50,
          pickup: '123 Market St',
          destination: '456 Mission St',
          rideType: 'standard',
        },
        {
          id: 'earn-2',
          date: new Date(Date.now() - 3600000).toISOString(),
          fare: 22.75,
          pickup: '789 Howard St',
          destination: '321 Folsom St',
          rideType: 'comfort',
        },
        {
          id: 'earn-3',
          date: new Date(Date.now() - 7200000).toISOString(),
          fare: 8.25,
          pickup: '555 Valencia St',
          destination: '111 Guerrero St',
          rideType: 'standard',
        },
      ];
      setEarnings(mockEarnings);
      setTotalEarnings(mockEarnings.reduce((sum, e) => sum + e.fare, 0));
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading earnings..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="px-6 pt-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Earnings</h1>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500">Today</p>
            <p className="text-2xl font-bold text-gray-900">${todayEarnings.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">{todayRides} rides</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">${totalEarnings.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">{earnings.length} rides</p>
          </div>
        </div>

        {/* Earnings list */}
        <h2 className="font-semibold text-gray-900 mb-3">Recent Earnings</h2>

        {earnings.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl">💰</span>
            <p className="text-gray-500 mt-3">No earnings yet</p>
            <p className="text-sm text-gray-400 mt-1">Go online to start earning</p>
          </div>
        ) : (
          <div className="space-y-3">
            {earnings.map((entry) => (
              <div
                key={entry.id}
                className="bg-white border border-gray-200 rounded-xl p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-green-500 font-bold text-lg">+${entry.fare.toFixed(2)}</span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-full capitalize">
                        {entry.rideType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-1">{entry.pickup}</p>
                    <p className="text-xs text-gray-400">→ {entry.destination}</p>
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    <p>{formatDate(entry.date)}</p>
                    <p>{formatTime(entry.date)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
