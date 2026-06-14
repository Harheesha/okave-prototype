import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import Layout from './components/Layout';

// Auth
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Agent
import AgentDashboard from './pages/AgentDashboard';
import RegisterFarmer from './pages/RegisterFarmer';
import CreateListing from './pages/CreateListing';

// Buyer
import Marketplace from './pages/Marketplace';
import Checkout from './pages/Checkout';

// Admin
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="flex items-center justify-center h-screen bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Agent */}
      <Route path="/agent" element={<ProtectedRoute allowedRoles={['agent']}><Layout><AgentDashboard /></Layout></ProtectedRoute>} />
      <Route path="/agent/register-farmer" element={<ProtectedRoute allowedRoles={['agent']}><Layout><RegisterFarmer /></Layout></ProtectedRoute>} />
      <Route path="/agent/create-listing" element={<ProtectedRoute allowedRoles={['agent']}><Layout><CreateListing /></Layout></ProtectedRoute>} />

      {/* Buyer */}
      <Route path="/marketplace" element={<ProtectedRoute allowedRoles={['buyer', 'agent', 'admin']}><Layout><Marketplace /></Layout></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute allowedRoles={['buyer']}><Layout><Checkout /></Layout></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Layout><AdminDashboard /></Layout></ProtectedRoute>} />

      {/* Default */}
      <Route path="/" element={<Navigate to={user ? (user.role === 'agent' ? '/agent' : user.role === 'admin' ? '/admin' : '/marketplace') : '/login'} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
