import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const agentNav = [
  { to: '/agent', label: 'Dashboard', end: true },
  { to: '/agent/farmers/new', label: 'Register Farmer' },
  { to: '/agent/listings/new', label: 'Create Listing' },
  { to: '/agent/listings', label: 'My Listings' },
  { to: '/agent/orders', label: 'Orders' },
];

const buyerNav = [
  { to: '/browse', label: 'Browse Produce' },
  { to: '/buyer', label: 'Dashboard', end: true },
  { to: '/buyer/orders', label: 'My Orders' },
  { to: '/buyer/subscriptions', label: 'Subscriptions' },
];

const adminNav = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/prices', label: 'Market Prices' },
];

export default function Layout({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = role === 'agent' ? agentNav : role === 'admin' ? adminNav : buyerNav;

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-green-800 text-white flex flex-col min-h-screen">
        <div className="p-6 border-b border-green-700">
          <h1 className="text-2xl font-bold">Okave</h1>
          <p className="text-green-300 text-sm mt-1">{user?.name}</p>
          <span className="inline-block bg-green-600 text-xs px-2 py-0.5 rounded mt-1">{user?.role}</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive ? 'bg-green-600 text-white' : 'text-green-200 hover:bg-green-700 hover:text-white'
                }`
              }
            >{label}</NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-green-700">
          <button onClick={handleLogout}
            className="w-full text-left text-green-300 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-green-700 transition">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
