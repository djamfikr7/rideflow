import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/useAuth';

export default function RolePickerPage() {
  const { user, setSelectedRole } = useAuth();
  const navigate = useNavigate();

  const handlePick = (role: 'rider' | 'driver' | 'admin') => {
    setSelectedRole(role);
    switch (role) {
      case 'rider': navigate('/', { replace: true }); break;
      case 'driver': navigate('/driver', { replace: true }); break;
      case 'admin': navigate('/admin', { replace: true }); break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">R</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.fullName || 'User'}</h1>
          <p className="text-gray-500 mt-1">Choose how you want to use RideFlow</p>
        </div>

        <div className="space-y-4">
          {/* Rider */}
          <button
            onClick={() => handlePick('rider')}
            className="w-full bg-white rounded-2xl p-6 flex items-center gap-4 border-2 border-gray-200 hover:border-black transition-colors text-left"
          >
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-3xl">
              🚗
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Rider</h3>
              <p className="text-sm text-gray-500">Request rides, track drivers, pay cash</p>
            </div>
          </button>

          {/* Driver */}
          <button
            onClick={() => handlePick('driver')}
            className="w-full bg-white rounded-2xl p-6 flex items-center gap-4 border-2 border-gray-200 hover:border-black transition-colors text-left"
          >
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-3xl">
              🚙
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Driver</h3>
              <p className="text-sm text-gray-500">Accept rides, navigate, earn money</p>
            </div>
          </button>

          {/* Admin */}
          <button
            onClick={() => handlePick('admin')}
            className="w-full bg-white rounded-2xl p-6 flex items-center gap-4 border-2 border-gray-200 hover:border-black transition-colors text-left"
          >
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-3xl">
              👑
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Admin</h3>
              <p className="text-sm text-gray-500">Manage users, rides, payments</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
