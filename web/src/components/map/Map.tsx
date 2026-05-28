import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DEFAULT_CENTER } from '../../lib/constants';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const driverIcon = new L.DivIcon({
  className: 'custom-driver-marker',
  html: '<div style="background:#3B82F6;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const pickupIcon = new L.DivIcon({
  className: 'custom-pickup-marker',
  html: '<div style="background:#22C55E;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const destIcon = new L.DivIcon({
  className: 'custom-dest-marker',
  html: '<div style="background:#EF4444;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface MapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  pickup?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  driverLocation?: { lat: number; lng: number };
  routeCoords?: Array<[number, number]>;
  onMapClick?: (lat: number, lng: number) => void;
  autoFit?: boolean;
}

function FitBounds({ pickup, destination }: { pickup?: { lat: number; lng: number }; destination?: { lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    if (pickup && destination) {
      const bounds = L.latLngBounds(
        [pickup.lat, pickup.lng],
        [destination.lat, destination.lng]
      );
      map.fitBounds(bounds, { padding: [60, 60] });
    } else if (pickup) {
      map.setView([pickup.lat, pickup.lng], 15);
    }
  }, [pickup, destination, map]);

  return null;
}

function MapClickHandler({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  const map = useMap();

  useEffect(() => {
    if (!onClick) return;
    const handler = (e: L.LeafletMouseEvent) => {
      onClick(e.latlng.lat, e.latlng.lng);
    };
    map.on('click', handler);
    return () => { map.off('click', handler); };
  }, [map, onClick]);

  return null;
}

export default function Map({
  center = DEFAULT_CENTER,
  zoom = 13,
  className = 'w-full h-full',
  pickup,
  destination,
  driverLocation,
  routeCoords,
  onMapClick,
  autoFit = true,
}: MapProps) {
  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onClick={onMapClick} />
        {autoFit && pickup && <FitBounds pickup={pickup} destination={destination} />}
        {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />}
        {destination && <Marker position={[destination.lat, destination.lng]} icon={destIcon} />}
        {driverLocation && <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon} />}
        {routeCoords && routeCoords.length > 1 && (
          <Polyline positions={routeCoords} color="#3B82F6" weight={4} opacity={0.8} />
        )}
      </MapContainer>
    </div>
  );
}
