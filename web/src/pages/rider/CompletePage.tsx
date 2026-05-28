import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StarRating from '../../components/ui/StarRating';
import { useRide } from '../../store/useRide';
import { useHistory } from '../../store/useHistory';
import { useLocation } from '../../store/useLocation';
import api from '../../lib/api';

export default function CompletePage() {
  const navigate = useNavigate();
  const { currentRide, driver, submitRating, clearRide, lastRating } = useRide();
  const { addRide } = useHistory();
  const { clearLocations } = useLocation();

  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(!!lastRating);

  if (!currentRide) {
    navigate('/', { replace: true });
    return null;
  }

  const fare = currentRide.fareFinal ?? currentRide.fareEstimate ?? 0;

  const handleSubmitRating = async () => {
    if (stars === 0) return;

    submitRating(stars, comment);
    setSubmitted(true);

    // Try to submit rating to backend
    try {
      await api.post(`/rides/${currentRide.id}/rate`, { stars, comment });
    } catch {
      // Backend unavailable — stored locally
    }

    // Add ride to history
    addRide(currentRide);
  };

  const handleDone = () => {
    clearRide();
    clearLocations();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="pt-6 pb-4 px-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🎉</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Ride Complete!</h1>
        <p className="text-gray-500 mt-1">Thank you for riding with RideFlow</p>
      </div>

      <div className="flex-1 px-6 overflow-auto pb-6">
        <div className="max-w-sm mx-auto space-y-6">
          {/* Receipt */}
          <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
            <h2 className="font-semibold text-gray-900">Receipt</h2>
            <div className="space-y-2">
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
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-gray-900 text-lg">${fare.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Driver info */}
          {driver && (
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span>👤</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{driver.fullName}</p>
                <p className="text-sm text-gray-500">
                  {driver.vehicleColor} {driver.vehicleMake} {driver.vehicleModel}
                </p>
              </div>
            </div>
          )}

          {/* Rating section */}
          {!submitted ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold text-gray-900 text-center">Rate your driver</h2>
              <div className="flex justify-center">
                <StarRating value={stars} onChange={setStars} size="lg" />
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Leave a comment (optional)"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm resize-none focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
              />
              <button
                onClick={handleSubmitRating}
                disabled={stars === 0}
                className="w-full bg-black text-white py-3 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
              >
                Submit Rating
              </button>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-green-800 font-medium">Thank you for your feedback!</p>
              <div className="flex justify-center mt-2">
                <StarRating value={lastRating?.stars ?? stars} readonly size="md" />
              </div>
            </div>
          )}

          {/* Done button */}
          <button
            onClick={handleDone}
            className="w-full bg-gray-100 text-gray-900 py-3 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
