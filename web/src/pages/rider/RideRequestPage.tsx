import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../../components/map/Map';
import RideTypeCard from '../../components/ride/RideTypeCard';
import { useLocation } from '../../store/useLocation';
import { useRide } from '../../store/useRide';
import { searchPlaces, haversineDistance, estimateDurationMinutes } from '../../lib/location';
import { BASE_FARE, PER_KM_RATE, PER_MINUTE_RATE } from '../../lib/constants';
import type { Location, RideType } from '../../types/ride';

export default function RideRequestPage() {
  const navigate = useNavigate();
  const { pickup, setPickup, destination, setDestination, currentLocation } = useLocation();
  const { setSelectedRideType, setFareEstimates, selectedRideType } = useRide();

  const [pickupSearch, setPickupSearch] = useState(pickup?.address || '');
  const [destSearch, setDestSearch] = useState(destination?.address || '');
  const [activeField, setActiveField] = useState<'pickup' | 'destination'>('destination');
  const [results, setResults] = useState<Location[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Calculate fare when both locations are set
  useEffect(() => {
    if (pickup && destination) {
      const dist = haversineDistance(pickup, destination);
      const dur = estimateDurationMinutes(dist);

      const estimates: Array<{ rideType: RideType; distance: number; duration: number; price: number; currency: string }> = (
        ['standard', 'comfort', 'premium'] as RideType[]
      ).map((type) => {
        const multiplier = type === 'standard' ? 1 : type === 'comfort' ? 1.5 : 2.0;
        return {
          rideType: type,
          distance: dist,
          duration: dur,
          price: Math.round((BASE_FARE + dist * PER_KM_RATE + dur * PER_MINUTE_RATE) * multiplier * 100) / 100,
          currency: 'USD',
        };
      });

      setFareEstimates(estimates);
    }
  }, [pickup, destination, setFareEstimates]);

  // Initialize pickup from current location
  useEffect(() => {
    if (currentLocation && !pickup) {
      setPickup(currentLocation);
      setPickupSearch(currentLocation.address);
    }
  }, [currentLocation, pickup, setPickup]);

  const handleSearch = (query: string, field: 'pickup' | 'destination') => {
    setActiveField(field);
    if (field === 'pickup') setPickupSearch(query);
    else setDestSearch(query);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (query.length < 3) {
      setResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      const places = await searchPlaces(query);
      setResults(places);
      setSearching(false);
    }, 400);
  };

  const handleSelectPlace = (location: Location) => {
    if (activeField === 'pickup') {
      setPickup(location);
      setPickupSearch(location.address);
    } else {
      setDestination(location);
      setDestSearch(location.address);
    }
    setResults([]);
  };

  const handleMapClick = (lat: number, lng: number) => {
    const location: Location = { lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` };
    if (activeField === 'pickup') {
      setPickup(location);
      setPickupSearch(location.address);
    } else {
      setDestination(location);
      setDestSearch(location.address);
    }
  };

  const handleRequestRide = () => {
    if (!pickup || !destination) return;
    setSelectedRideType(selectedRideType);
    navigate('/ride/matching');
  };

  const canRequest = pickup && destination;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white z-[1001] px-4 pt-4 pb-2 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-gray-500 mb-3">
          ← Back
        </button>
        <h1 className="text-lg font-bold text-gray-900 mb-3">Plan your ride</h1>

        {/* Location inputs */}
        <div className="relative space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <div className="w-0.5 h-6 bg-gray-300" />
              <div className="w-3 h-3 bg-red-500 rounded-full" />
            </div>
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={pickupSearch}
                onChange={(e) => handleSearch(e.target.value, 'pickup')}
                onFocus={() => setActiveField('pickup')}
                placeholder="Pickup location"
                className="w-full px-3 py-2.5 bg-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:bg-white outline-none"
              />
              <input
                type="text"
                value={destSearch}
                onChange={(e) => handleSearch(e.target.value, 'destination')}
                onFocus={() => setActiveField('destination')}
                placeholder="Where to?"
                className="w-full px-3 py-2.5 bg-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:bg-white outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Search results dropdown */}
          {(results.length > 0 || searching) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-48 overflow-y-auto z-[1002]">
              {searching && (
                <div className="p-3 text-center text-sm text-gray-500">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-accent rounded-full animate-spin mx-auto" />
                </div>
              )}
              {results.map((loc, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectPlace(loc)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                >
                  <p className="text-sm text-gray-800 line-clamp-1">{loc.address}</p>
                  <p className="text-xs text-gray-400">
                    {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <Map
          pickup={pickup || undefined}
          destination={destination || undefined}
          onMapClick={handleMapClick}
        />
      </div>

      {/* Bottom: Ride types + Request button */}
      {canRequest && (
        <div className="bg-white z-[1001] px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
          <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
            {(['standard', 'comfort', 'premium'] as RideType[]).map((type) => {
              const dist = haversineDistance(pickup!, destination!);
              const dur = estimateDurationMinutes(dist);
              const multiplier = type === 'standard' ? 1 : type === 'comfort' ? 1.5 : 2.0;
              const price = Math.round((BASE_FARE + dist * PER_KM_RATE + dur * PER_MINUTE_RATE) * multiplier * 100) / 100;

              return (
                <RideTypeCard
                  key={type}
                  rideType={type}
                  price={price}
                  duration={dur}
                  selected={selectedRideType === type}
                  onSelect={() => setSelectedRideType(type)}
                />
              );
            })}
          </div>

          <button
            onClick={handleRequestRide}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-colors"
          >
            Request {selectedRideType.charAt(0).toUpperCase() + selectedRideType.slice(1)}
          </button>
        </div>
      )}
    </div>
  );
}
