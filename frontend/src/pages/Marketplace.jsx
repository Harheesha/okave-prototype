import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export default function Marketplace() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCrop, setFilterCrop] = useState('');
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    api.get('/listings?status=ACTIVE')
      .then(res => {
        setListings(res.data.listings || res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

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
      const updated = cart.map(c => c.listingId === listing.id ? { ...c, quantity: c.quantity + 1 } : c);
      saveCart(updated);
    } else {
      saveCart([...cart, { listingId: listing.id, title: listing.cropType, price: listing.pricePerKg, quantity: 1, farmerId: listing.farmerId }]);
    }
  };

  const removeFromCart = (listingId) => {
    saveCart(cart.filter(c => c.listingId !== listingId));
  };

  const checkout = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await api.post('/orders', { items: cart });
      saveCart([]);
      alert('Order placed successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Checkout failed');
    }
  };

  const filtered = listings.filter(l => {
    const matchSearch = l.cropType?.toLowerCase().includes(search.toLowerCase()) || l.description?.toLowerCase().includes(search.toLowerCase());
    const matchCrop = filterCrop ? l.cropType === filterCrop : true;
    return matchSearch && matchCrop;
  });

  const cropTypes = [...new Set(listings.map(l => l.cropType).filter(Boolean))];
  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
        <button onClick={() => setShowCart(!showCart)} className="relative bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          Cart ({cart.length})
          {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cart.length}</span>}
        </button>
      </div>

      {showCart && (
        <div className="bg-white border rounded-lg p-4 mb-6 shadow">
          <h2 className="text-xl font-semibold mb-3">Your Cart</h2>
          {cart.length === 0 ? <p className="text-gray-500">Cart is empty</p> : (
            <>
              {cart.map(item => (
                <div key={item.listingId} className="flex justify-between items-center py-2 border-b">
                  <span>{item.title} x{item.quantity}</span>
                  <span>&#8358;{(item.price * item.quantity).toLocaleString()}</span>
                  <button onClick={() => removeFromCart(item.listingId)} className="text-red-500 hover:text-red-700">Remove</button>
                </div>
              ))}
              <div className="flex justify-between items-center mt-3 font-bold">
                <span>Total: &#8358;{cartTotal.toLocaleString()}</span>
                <button onClick={checkout} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">Checkout</button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <input type="text" placeholder="Search crops..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
        <select value={filterCrop} onChange={e => setFilterCrop(e.target.value)} className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="">All Crops</option>
          {cropTypes.map(crop => <option key={crop} value={crop}>{crop}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No listings found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(listing => (
            <div key={listing.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{listing.cropType}</h3>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>
              </div>
              <p className="text-gray-600 text-sm mb-3">{listing.description}</p>
              <div className="space-y-1 text-sm text-gray-500 mb-4">
                <p>Quantity: {listing.quantityKg} kg</p>
                <p>Price: &#8358;{listing.pricePerKg}/kg</p>
                <p>Location: {listing.location}</p>
              </div>
              <button onClick={() => addToCart(listing)} className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">Add to Cart</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
