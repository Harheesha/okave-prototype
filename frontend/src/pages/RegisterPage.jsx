import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'BUYER', buyer_type: 'HOUSEHOLD' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await register(form);
      toast.success('Account created successfully!');
      if (user.role === 'BUYER') navigate('/browse');
      else navigate('/agent');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-green-700">Okave</h1>
          <p className="text-gray-500 mt-1">Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[['name','Name','text','Your full name'],['email','Email','email','you@example.com'],['phone','Phone','tel','08012345678'],['password','Password','password','Enter password']].map(([field, label, type, placeholder]) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type={type} required value={form[field]} placeholder={placeholder}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="BUYER">Buyer</option>
              <option value="AGENT">Field Agent</option>
            </select>
          </div>
          {form.role === 'BUYER' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Type</label>
              <select value={form.buyer_type} onChange={e => setForm(f => ({ ...f, buyer_type: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="HOUSEHOLD">Household</option>
                <option value="RESTAURANT">Restaurant</option>
                <option value="RETAILER">Retailer</option>
                <option value="VENDOR">Vendor</option>
              </select>
            </div>
          )}
          <button type="submit" disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-green-600 font-medium">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
