import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'rider' | 'driver';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isSignedIn, user } = useAuth();
  const location = useLocation();

  if (!isSignedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirect drivers to driver dashboard, riders to home
    const redirectPath = user?.role === 'driver' ? '/driver' : '/';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
