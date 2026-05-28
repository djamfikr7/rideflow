import type { DriverInfo } from '../../types/ride';

interface DriverInfoCardProps {
  driver: DriverInfo;
  status?: string;
}

export default function DriverInfoCard({ driver, status }: DriverInfoCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">
          {driver.avatarUrl ? (
            <img src={driver.avatarUrl} alt={driver.fullName} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <span>👤</span>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{driver.fullName}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="text-yellow-500">★</span>
            <span>{driver.rating.toFixed(1)}</span>
            <span>·</span>
            <span>{driver.totalRides} rides</span>
          </div>
        </div>
        {status && (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full capitalize">
            {status.replace('_', ' ')}
          </span>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>🚗</span>
          <span>
            {driver.vehicleColor} {driver.vehicleMake} {driver.vehicleModel}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
          <span>🔢</span>
          <span className="font-mono font-medium">{driver.licensePlate}</span>
        </div>
      </div>
    </div>
  );
}
