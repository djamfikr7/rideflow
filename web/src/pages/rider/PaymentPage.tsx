import { useNavigate } from 'react-router-dom';
import { useRide } from '../../store/useRide';

export default function PaymentPage() {
  const navigate = useNavigate();
  const { currentRide } = useRide();

  if (!currentRide) {
    navigate('/', { replace: true });
    return null;
  }

  const fare = currentRide.fareFinal ?? currentRide.fareEstimate ?? 0;

  const handleConfirmPayment = () => {
    navigate('/ride/complete', { replace: true });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="pt-6 pb-4 px-6">
        <button onClick={() => navigate(-1)} className="text-gray-500 mb-4">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Payment</h1>
        <p className="text-gray-500 mt-1">Cash on delivery</p>
      </div>

      {/* Fare summary */}
      <div className="flex-1 px-6">
        <div className="max-w-sm mx-auto space-y-6">
          {/* Fare card */}
          <div className="bg-gray-50 rounded-2xl p-6 text-center space-y-4">
            <div className="text-5xl font-bold text-gray-900">
              ${fare.toFixed(2)}
            </div>
            <p className="text-gray-500 text-sm">Total fare</p>

            {/* Breakdown */}
            <div className="border-t border-gray-200 pt-4 space-y-2 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ride type</span>
                <span className="font-medium capitalize">{currentRide.rideType}</span>
              </div>
              {currentRide.distanceKm && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Distance</span>
                  <span className="font-medium">{currentRide.distanceKm.toFixed(1)} km</span>
                </div>
              )}
              {currentRide.durationMinutes && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium">{currentRide.durationMinutes} min</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment</span>
                <span className="font-medium">Cash</span>
              </div>
            </div>
          </div>

          {/* Cash payment info */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">💵</span>
            <div>
              <p className="font-medium text-green-800">Cash on Delivery</p>
              <p className="text-sm text-green-600">
                Please have ${fare.toFixed(2)} ready for your driver
              </p>
            </div>
          </div>

          {/* Route summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-2">
              <div className="flex flex-col items-center mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <div className="w-0.5 h-6 bg-gray-300" />
                <div className="w-2 h-2 bg-red-500 rounded-full" />
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-xs text-gray-500">From</p>
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{currentRide.pickup.address}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">To</p>
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{currentRide.destination.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Confirm button */}
          <button
            onClick={handleConfirmPayment}
            className="w-full bg-black text-white py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-colors"
          >
            Confirm Cash Payment
          </button>
        </div>
      </div>
    </div>
  );
}
