import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { AuthContext } from '../context/AuthContext';

export default function Marketplace() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCrop, setFilterCrop] = useState('');
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    api.get('/listings?status=ACTIVE').then(res => {
      setListings(res.data.listings || res.data);
    }).catch(console.error).finally(() => setLoading(false));
    const saved = localStorage.getItem('okave_cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('okave_cart', JSON.stringify(newCart));
  };

  const addToCart = (listing) => {
    const existing = cart.find(c => c.listingId === listing.id);
    if (existing) {
      const updated = cart.map(c =>
        c.listingId === listing.id ? { ...c, quantity: c.quantity + 1 } : c
      );
      saveCart(updated);
    } else {
      saveCart([...cart, { listingId: listing.id, cropType: listing.cropType, pricePerKg: listing.pricePerKg, quantity: 1, farmerId: listing.farmerId }]);
    }
  };

  const removeFromCart = (listingId) => {
    saveCart(cart.filter(c => c.listingId !== listingId));
  };

  const updateQty = (listingId, qty) => {
    if (qty < 1) return removeFromCart(listingId);
    saveCart(cart.map(c => c.listingId === listingId ? { ...c, quantity: qty } : c));
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.pricePerKg * c.quantity, 0);

  const CROPS = ['Maize', 'Rice', 'Sorghum', 'Millet', 'Groundnut', 'Cowpea', 'Cassava', 'Yam', 'Tomato', 'Pepper'];

  const filtered = listings.filter(l => {
    const matchSearch = l.cropType.toLowerCase().includes(search.toLowerCase()) ||
      (l.location || '').toLowerCase().includes(search.toLowerCase());
    const matchCrop = filterCrop ? l.cropType === filterCrop : true;
    return matchSearch && matchCrop;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Marketplace</h1>
          <p className="text-gray-400 mt-1">Browse fresh produce from verified farmers</p>
        </div>
        <button
          onClick={() => setShowCart(!showCart)}
          className="relative bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Cart ({cart.length})
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="mb-6 bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">Your Cart</h3>
          {cart.length === 0 ? (
            <p className="text-gray-400 text-sm">Cart is empty</p>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.listingId} className="flex items-center justify-between py-2 border-b border-gray-700">
                  <div className="flex-1">
                    <p className="text-white text-sm">{item.cropType}</p>
                    <p className="text-gray-400 text-xs">₦{item.pricePerKg}/kg</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.listingId, item.quantity - 1)} className="text-gray-400 hover:text-white w-6 h-6 flex items-center justify-center border border-gray-600 rounded">-</button>
                    <span className="text-white text-sm w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.listingId, item.quantity + 1)} className="text-gray-400 hover:text-white w-6 h-6 flex items-center justify-center border border-gray-600 rounded">+</button>
                    <button onClick={() => removeFromCart(item.listingId)} className="text-red-400 hover:text-red-300 ml-2 text-xs">Remove</button>
                  </div>
                </div>
              ))}
              <div className="mt-3 flex items-center justify-between">
                <p className="text-white font-semibold">Total: ₦{cartTotal.toLocaleString()}</p>
                <button
                  onClick={() => navigate('/buyer/checkout')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Checkout
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by crop or location..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
        />
        <select
          value={filterCrop}
          onChange={e => setFilterCrop(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
        >
          <option value="">All Crops</option>
          {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Listings Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No listings found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(listing => {
            const inCart = cart.find(c => c.listingId === listing.id);
            return (
              <div key={listing.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-green-600 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-white font-semibold text-lg">{listing.cropType}</h3>
                    <p className="text-gray-400 text-xs">{listing.location || 'Location not specified'}</p>
                  </div>
                  <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">ACTIVE</span>
                </div>
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Available:</span>
                    <span className="text-white">{listing.quantityKg} kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Price:</span>
                    <span className="text-green-400 font-semibold">₦{listing.pricePerKg}/kg</span>
                  </div>
                  {listing.harvestDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Harvested:</span>
                      <span className="text-white">{new Date(listing.harvestDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                {listing.description && (
                  <p className="text-gray-400 text-xs mb-3 line-clamp-2">{listing.description}</p>
                )}
                <button
                  onClick={() => addToCart(listing)}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                    inCart
                      ? 'bg-green-700 text-white border border-green-500'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {inCart ? `In Cart (${inCart.quantity}kg) ✓` : 'Add to Cart'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
