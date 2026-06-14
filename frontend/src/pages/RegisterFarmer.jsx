import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function RegisterFarmer() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    nin: '',
    location: '',
    farmSizeHa: '',
    primaryCrop: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/farmers', {
        ...form,
        farmSizeHa: parseFloat(form.farmSizeHa) || null,
      });
      setSuccess(`Farmer "${form.name}" registered successfully!`);
      setTimeout(() => navigate('/agent/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/agent/dashboard')}
          className="text-green-400 hover:text-green-300 text-sm mb-2 flex items-center gap-1"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-white">Register Farmer</h1>
        <p className="text-gray-400 mt-1">Add a new farmer to the Okave platform</p>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded text-red-300 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-900 border border-green-700 rounded text-green-300 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Abubakar Musa"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="e.g. 08012345678"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">
                NIN (National ID)
              </label>
              <input
                type="text"
                name="nin"
                value={form.nin}
                onChange={handleChange}
                placeholder="11-digit NIN"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">
                Location / LGA <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                placeholder="e.g. Kano North LGA"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">
                Farm Size (hectares)
              </label>
              <input
                type="number"
                name="farmSizeHa"
                value={form.farmSizeHa}
                onChange={handleChange}
                placeholder="e.g. 2.5"
                step="0.1"
                min="0"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">
                Primary Crop
              </label>
              <select
                name="primaryCrop"
                value={form.primaryCrop}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
              >
                <option value="">Select crop</option>
                <option value="Maize">Maize</option>
                <option value="Rice">Rice</option>
                <option value="Sorghum">Sorghum</option>
                <option value="Millet">Millet</option>
                <option value="Groundnut">Groundnut</option>
                <option value="Cowpea">Cowpea</option>
                <option value="Cassava">Cassava</option>
                <option value="Yam">Yam</option>
                <option value="Tomato">Tomato</option>
                <option value="Pepper">Pepper</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Registering...' : 'Register Farmer'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/agent/dashboard')}
              className="px-4 py-2 border border-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
