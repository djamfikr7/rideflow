import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../../components/map/Map';
import { useLocation } from '../../store/useLocation';
import { getCurrentLocation, reverseGeocode } from '../../lib/location';

export default function HomePage() {
  const navigate = useNavigate();
  const { currentLocation, setCurrentLocation, setPickup } = useLocation();
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    loadCurrentLocation();
  }, []);

  const loadCurrentLocation = useCallback(async () => {
    setLoadingLocation(true);
    setLocationError(false);
    try {
      const location = await getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
        setPickup(location);
      } else {
        // Fallback to SF
        const fallback = { lat: 37.7749, lng: -122.4194, address: 'San Francisco, CA' };
        setCurrentLocation(fallback);
        setPickup(fallback);
        setLocationError(true);
      }
    } catch {
      const fallback = { lat: 37.7749, lng: -122.4194, address: 'San Francisco, CA' };
      setCurrentLocation(fallback);
      setPickup(fallback);
      setLocationError(true);
    } finally {
      setLoadingLocation(false);
    }
  }, [setCurrentLocation, setPickup]);

  const handleSearchPress = () => {
    navigate('/ride/request');
  };

  const mapCenter: [number, number] = currentLocation
    ? [currentLocation.lat, currentLocation.lng]
    : [37.7749, -122.4194];

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Full-screen map */}
      <Map center={mapCenter} zoom={15} />

      {/* Bottom overlay */}
      <div className="absolute bottom-20 left-0 right-0 px-4 z-[1000]">
        {/* Current location indicator */}
        {currentLocation && !loadingLocation && (
          <div className="flex items-center mb-3 px-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0" />
            <p className="text-xs text-gray-600 truncate bg-white/80 px-2 py-1 rounded">
              {currentLocation.address}
            </p>
          </div>
        )}

        {/* Search bar */}
        <button
          onClick={handleSearchPress}
          disabled={loadingLocation}
          className="w-full bg-white flex items-center px-4 py-4 rounded-xl shadow-lg shadow-black/10 active:scale-[0.98] transition-transform"
        >
          {loadingLocation ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-accent rounded-full animate-spin mr-3" />
          ) : (
            <div className="w-3 h-3 bg-gray-400 rounded-full mr-3 flex-shrink-0" />
          )}
          <span className="text-gray-400 text-base flex-1 text-left">
            {loadingLocation ? 'Getting your location...' : 'Where are you going?'}
          </span>
          <span className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-full">
            Search
          </span>
        </button>

        {/* Retry button */}
        {locationError && !loadingLocation && (
          <button
            onClick={loadCurrentLocation}
            className="w-full bg-gray-100 py-2 rounded-lg mt-2 text-sm text-gray-600"
          >
            Tap to retry location
          </button>
        )}
      </div>
    </div>
  );
}
