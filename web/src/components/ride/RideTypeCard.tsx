import type { RideType } from '../../types/ride';
import { RIDE_TYPES } from '../../lib/constants';

interface RideTypeCardProps {
  rideType: RideType;
  price: number;
  duration: number;
  selected: boolean;
  onSelect: () => void;
}

export default function RideTypeCard({ rideType, price, duration, selected, onSelect }: RideTypeCardProps) {
  const config = RIDE_TYPES.find((t) => t.id === rideType)!;

  return (
    <button
      onClick={onSelect}
      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
        selected
          ? 'border-accent bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <span className="text-3xl">{config.icon}</span>
      <div className="flex-1 text-left">
        <h3 className="font-semibold text-gray-900">{config.name}</h3>
        <p className="text-xs text-gray-500">{config.description}</p>
        <p className="text-xs text-gray-400 mt-1">{duration} min</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-gray-900">${price.toFixed(2)}</p>
      </div>
    </button>
  );
}
