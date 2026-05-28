import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/useAuth';
import { useDriver } from '../../store/useDriver';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { isOnline, goOffline } = useDriver();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const isDriver = user.role === 'driver';
  const isAdmin = user.role === 'admin';
  const isDriverRoute = location.pathname.startsWith('/driver');
  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleSignOut = () => {
    if (isOnline) goOffline();
    signOut();
    navigate('/login');
  };

  const riderLinks = [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/history', label: 'History', icon: '📋' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ];

  const driverLinks = [
    { to: '/driver', label: 'Dashboard', icon: '📊' },
    { to: '/driver/earnings', label: 'Earnings', icon: '💰' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: '📊' },
    { to: '/admin/users', label: 'Users', icon: '👥' },
    { to: '/admin/rides', label: 'Rides', icon: '🚗' },
    { to: '/admin/payments', label: 'Payments', icon: '💳' },
  ];

  let links = riderLinks;
  if (isAdminRoute) links = adminLinks;
  else if (isDriverRoute) links = driverLinks;

  return (
    <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                isActive ? 'text-accent' : 'text-gray-400'
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}

        {/* Role switch / Sign out */}
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-400"
        >
          <span className="text-xl">🚪</span>
          <span className="text-[10px] font-medium">Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
