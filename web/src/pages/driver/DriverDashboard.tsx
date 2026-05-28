import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../../components/map/Map';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useDriver } from '../../store/useDriver';
import { useLocation } from '../../store/useLocation';
import { useAuth } from '../../store/useAuth';
import { getSocket, connectSocket, disconnectSocket } from '../../lib/socket';
import api from '../../lib/api';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOnline, goOnline, goOffline, todayEarnings, todayRides, setTodayEarnings, setTodayRides, setIncomingRide } = useDriver();
  const { currentLocation } = useLocation();
  const [loadingStats, setLoadingStats] = useState(false);

  // Load driver stats
  useEffect(() => {
    loadStats();
  }, []);

  // Connect socket when online and listen for incoming rides
  useEffect(() => {
    if (isOnline && user) {
      const socket = connectSocket(user.id);
      socket.emit('driver:online', {
        lat: currentLocation?.lat || 37.7749,
        lng: currentLocation?.lng || -122.4194,
      });

      socket.on('ride:request', (data: { rideId: string }) => {
        setIncomingRide(data.rideId);
        navigate('/driver/incoming', { replace: true });
      });

      return () => {
        socket.off('ride:request');
        disconnectSocket();
      };
    }
  }, [isOnline, user]);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const res = await api.get('/driver/stats');
      const stats = res.data.data || res.data;
      if (stats.todayEarnings !== undefined) setTodayEarnings(stats.todayEarnings);
      if (stats.todayRides !== undefined) setTodayRides(stats.todayRides);
    } catch {
      // Backend unavailable — use defaults
    } finally {
      setLoadingStats(false);
    }
  };

  const handleToggleOnline = async () => {
    if (isOnline) {
      goOffline();
      if (user) disconnectSocket();
    } else {
      await goOnline();
    }
  };

  const mapCenter: [number, number] = currentLocation
    ? [currentLocation.lat, currentLocation.lng]
    : [37.7749, -122.4194];

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Map (shown when online) */}
      {isOnline && (
        <div className="absolute inset-0">
          <Map center={mapCenter} zoom={15} />
        </div>
      )}

      {/* Offline dashboard (shown when offline) */}
      {!isOnline && (
        <div className="h-full flex flex-col items-center justify-center px-6 bg-white">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🚗</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
            <p className="text-gray-500 mt-1">Go online to start receiving ride requests</p>
          </div>

          {/* Stats cards */}
          <div className="w-full max-w-sm space-y-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today's Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingStats ? '...' : `$${todayEarnings.toFixed(2)}`}
                </p>
              </div>
              <span className="text-3xl">💰</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today's Rides</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingStats ? '...' : todayRides}
                </p>
              </div>
              <span className="text-3xl">📋</span>
            </div>
          </div>
        </div>
      )}

      {/* Online status overlay */}
      {isOnline && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
          <div className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="font-semibold text-sm">Online — Waiting for rides</span>
          </div>
        </div>
      )}

      {/* Toggle button — fixed at bottom above navbar */}
      <div className="absolute bottom-20 left-0 right-0 px-6 z-[1000]">
        <button
          onClick={handleToggleOnline}
          className={`w-full py-4 rounded-xl font-semibold text-lg shadow-lg transition-colors ${
            isOnline
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isOnline ? 'Go Offline' : 'Go Online'}
        </button>
      </div>
    </div>
  );
}
