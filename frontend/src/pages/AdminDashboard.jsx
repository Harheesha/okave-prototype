import { useState, useEffect } from 'react';
import api from '../api/client';

const CROPS = ['Maize', 'Rice', 'Sorghum', 'Millet', 'Groundnut', 'Cowpea', 'Cassava', 'Yam', 'Tomato', 'Pepper'];
const MARKETS = ['Dawanau Market', 'Mile 12 Lagos', 'Kasuwar Shanu Maiduguri', 'Gboko Market', 'Bodija Market'];

export default function AdminDashboard() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    cropType: '',
    marketName: '',
    avgPricePerKg: '',
    minPrice: '',
    maxPrice: '',
    source: 'manual',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('prices');

  const fetchPrices = async () => {
    try {
      const res = await api.get('/prices');
      setPrices(res.data.prices || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrices(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/prices', {
        ...form,
        avgPricePerKg: parseFloat(form.avgPricePerKg),
        minPrice: parseFloat(form.minPrice) || null,
        maxPrice: parseFloat(form.maxPrice) || null,
      });
      setSuccess('Market price added successfully!');
      setForm({ cropType: '', marketName: '', avgPricePerKg: '', minPrice: '', maxPrice: '', source: 'manual' });
      fetchPrices();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save price');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-green-400 mt-1">Manage market prices and platform data</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
        {['prices', 'add-price'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-green-500 text-green-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'add-price' ? 'Add Price Snapshot' : 'Market Prices'}
          </button>
        ))}
      </div>

      {activeTab === 'prices' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Total Price Records</p>
              <p className="text-3xl font-bold text-white mt-1">{prices.length}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Crops Tracked</p>
              <p className="text-3xl font-bold text-green-400 mt-1">{[...new Set(prices.map(p => p.cropType))].length}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Markets Covered</p>
              <p className="text-3xl font-bold text-blue-400 mt-1">{[...new Set(prices.map(p => p.marketName))].length}</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left text-gray-300 px-4 py-3">Crop</th>
                    <th className="text-left text-gray-300 px-4 py-3">Market</th>
                    <th className="text-left text-gray-300 px-4 py-3">Avg Price (₦/kg)</th>
                    <th className="text-left text-gray-300 px-4 py-3">Min</th>
                    <th className="text-left text-gray-300 px-4 py-3">Max</th>
                    <th className="text-left text-gray-300 px-4 py-3">Date</th>
                    <th className="text-left text-gray-300 px-4 py-3">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map(price => (
                    <tr key={price.id} className="border-t border-gray-700 hover:bg-gray-750">
                      <td className="px-4 py-3 text-white font-medium">{price.cropType}</td>
                      <td className="px-4 py-3 text-gray-300">{price.marketName}</td>
                      <td className="px-4 py-3 text-green-400 font-semibold">₦{price.avgPricePerKg}</td>
                      <td className="px-4 py-3 text-gray-400">₦{price.minPrice || '-'}</td>
                      <td className="px-4 py-3 text-gray-400">₦{price.maxPrice || '-'}</td>
                      <td className="px-4 py-3 text-gray-400">{new Date(price.recordedAt || price.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">{price.source || 'manual'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {prices.length === 0 && (
                <div className="text-center py-8 text-gray-400">No price records yet. Add some!</div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'add-price' && (
        <div className="max-w-xl">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-white font-semibold mb-4">Add Market Price Snapshot</h3>
            {error && (
              <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded text-red-300 text-sm">{error}</div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-900 border border-green-700 rounded text-green-300 text-sm">{success}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">
                    Crop Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="cropType"
                    value={form.cropType}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                  >
                    <option value="">Select crop</option>
                    {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">
                    Market Name <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="marketName"
                    value={form.marketName}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                  >
                    <option value="">Select market</option>
                    {MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">
                    Avg Price (₦/kg) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="avgPricePerKg"
                    value={form.avgPricePerKg}
                    onChange={handleChange}
                    required
                    min="1"
                    step="0.01"
                    placeholder="e.g. 350"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Source</label>
                  <select
                    name="source"
                    value={form.source}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                  >
                    <option value="manual">Manual Entry</option>
                    <option value="field_agent">Field Agent</option>
                    <option value="market_survey">Market Survey</option>
                    <option value="FMARD">FMARD Data</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Min Price</label>
                  <input
                    type="number"
                    name="minPrice"
                    value={form.minPrice}
                    onChange={handleChange}
                    min="1"
                    step="0.01"
                    placeholder="optional"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Max Price</label>
                  <input
                    type="number"
                    name="maxPrice"
                    value={form.maxPrice}
                    onChange={handleChange}
                    min="1"
                    step="0.01"
                    placeholder="optional"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                {saving ? 'Saving...' : 'Add Price Snapshot'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
