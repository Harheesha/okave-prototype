import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import { Toaster } from 'react-hot-toast';

// Auth
import LoginPage from './pages/LoginPage';
import RegisterFarmer from './pages/RegisterFarmer';

// Agent
import AgentDashboard from './pages/AgentDashboard';
import CreateListing from './pages/CreateListing';

// Buyer
import Marketplace from './pages/Marketplace';
import Checkout from './pages/Checkout';

// Admin
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterFarmer />} />

      {/* Buyer/Public browsing */}
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/marketplace" replace />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/checkout" element={<Checkout />} />
      </Route>

      {/* Agent routes */}
      <Route element={<ProtectedRoute allowedRoles={['AGENT']}><Layout /></ProtectedRoute>}>
        <Route path="/agent" element={<AgentDashboard />} />
        <Route path="/agent/listings/new" element={<CreateListing />} />
        <Route path="/agent/listings" element={<AgentDashboard />} />
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']}><Layout /></ProtectedRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/marketplace" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}
