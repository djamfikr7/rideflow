import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from './store/useAuth';
import { getCurrentUser } from './lib/auth';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyPage from './pages/auth/VerifyPage';

// Rider pages
import HomePage from './pages/rider/HomePage';
import RideRequestPage from './pages/rider/RideRequestPage';
import RideMatchingPage from './pages/rider/RideMatchingPage';
import ActiveRidePage from './pages/rider/ActiveRidePage';
import PaymentPage from './pages/rider/PaymentPage';
import CompletePage from './pages/rider/CompletePage';
import HistoryPage from './pages/rider/HistoryPage';
import ProfilePage from './pages/rider/ProfilePage';

// Driver pages
import DriverDashboard from './pages/driver/DriverDashboard';
import IncomingRidePage from './pages/driver/IncomingRidePage';
import DriverActiveRidePage from './pages/driver/DriverActiveRidePage';
import EarningsPage from './pages/driver/EarningsPage';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="flex-1 overflow-auto pb-16">{children}</div>
      <Navbar />
    </div>
  );
}

export default function App() {
  const { setAuth, setUser, setToken, isSignedIn, user } = useAuth();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('rideflow_token');
      if (token) {
        setToken(token);
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          // Token invalid — clear
          setToken(null);
        }
      }
      setInitializing(false);
    };
    initAuth();
  }, [setUser, setToken]);

  if (initializing) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" text="Loading RideFlow..." />
      </div>
    );
  }

  const showNavbar = isSignedIn && user;

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={isSignedIn ? <Navigate to={user?.role === 'driver' ? '/driver' : '/'} replace /> : <LoginPage />} />
        <Route path="/register" element={isSignedIn ? <Navigate to={user?.role === 'driver' ? '/driver' : '/'} replace /> : <RegisterPage />} />
        <Route path="/verify" element={<VerifyPage />} />

        {/* Rider routes */}
        <Route path="/" element={<ProtectedRoute requiredRole="rider"><AppLayout><HomePage /></AppLayout></ProtectedRoute>} />
        <Route path="/ride/request" element={<ProtectedRoute requiredRole="rider"><AppLayout><RideRequestPage /></AppLayout></ProtectedRoute>} />
        <Route path="/ride/matching" element={<ProtectedRoute requiredRole="rider"><AppLayout><RideMatchingPage /></AppLayout></ProtectedRoute>} />
        <Route path="/ride/active" element={<ProtectedRoute requiredRole="rider"><AppLayout><ActiveRidePage /></AppLayout></ProtectedRoute>} />
        <Route path="/ride/payment" element={<ProtectedRoute requiredRole="rider"><AppLayout><PaymentPage /></AppLayout></ProtectedRoute>} />
        <Route path="/ride/complete" element={<ProtectedRoute requiredRole="rider"><AppLayout><CompletePage /></AppLayout></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute requiredRole="rider"><AppLayout><HistoryPage /></AppLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />

        {/* Driver routes */}
        <Route path="/driver" element={<ProtectedRoute requiredRole="driver"><AppLayout><DriverDashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/driver/incoming" element={<ProtectedRoute requiredRole="driver"><AppLayout><IncomingRidePage /></AppLayout></ProtectedRoute>} />
        <Route path="/driver/active" element={<ProtectedRoute requiredRole="driver"><AppLayout><DriverActiveRidePage /></AppLayout></ProtectedRoute>} />
        <Route path="/driver/earnings" element={<ProtectedRoute requiredRole="driver"><AppLayout><EarningsPage /></AppLayout></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={isSignedIn ? (user?.role === 'driver' ? '/driver' : '/') : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
