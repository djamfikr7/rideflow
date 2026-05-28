import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'rider' | 'driver' | 'admin';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isSignedIn, user } = useAuth();
  const location = useLocation();

  if (!isSignedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirect based on role
    let redirectPath = '/';
    if (user?.role === 'driver') redirectPath = '/driver';
    if (user?.role === 'admin') redirectPath = '/admin';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
