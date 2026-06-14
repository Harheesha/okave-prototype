import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MOCK_LISTINGS = [
  { id: 1, cropType: 'Tomatoes', description: 'Fresh organic tomatoes from Kaduna farms. Juicy and ripe, perfect for cooking or fresh consumption.', quantityKg: 500, pricePerKg: 350, location: 'Kaduna, Nigeria', farmerId: 1, status: 'ACTIVE' },
  { id: 2, cropType: 'Yam', description: 'Premium quality white yam from Benue State. Freshly harvested, large tubers ideal for pounding.', quantityKg: 1200, pricePerKg: 420, location: 'Benue, Nigeria', farmerId: 2, status: 'ACTIVE' },
  { id: 3, cropType: 'Maize', description: 'Dry yellow maize ready for milling or animal feed. Sourced from cooperative farms in Kano.', quantityKg: 3000, pricePerKg: 180, location: 'Kano, Nigeria', farmerId: 3, status: 'ACTIVE' },
  { id: 4, cropType: 'Pepper', description: 'Hot red pepper (tatashe & rodo mix), sun-dried and fresh varieties available. Great for spices.', quantityKg: 200, pricePerKg: 650, location: 'Sokoto, Nigeria', farmerId: 1, status: 'ACTIVE' },
  { id: 5, cropType: 'Cassava', description: 'Fresh cassava tubers, processed and unprocessed options. Ready for garri, fufu, or starch.', quantityKg: 2500, pricePerKg: 120, location: 'Oyo, Nigeria', farmerId: 4, status: 'ACTIVE' },
  { id: 6, cropType: 'Beans', description: 'Brown beans (ewa oloyin), thoroughly sorted and cleaned. High protein, ideal for restaurants.', quantityKg: 800, pricePerKg: 550, location: 'Plateau, Nigeria', farmerId: 2, status: 'ACTIVE' },
  { id: 7, cropType: 'Onions', description: 'Red and white onions from Sokoto. Dry-cured for longer shelf life. Bulk discount available.', quantityKg: 1500, pricePerKg: 280, location: 'Sokoto, Nigeria', farmerId: 5, status: 'ACTIVE' },
  { id: 8, cropType: 'Groundnuts', description: 'Raw shelled groundnuts suitable for oil processing, kuli-kuli, or direct consumption.', quantityKg: 600, pricePerKg: 480, location: 'Kano, Nigeria', farmerId: 3, status: 'ACTIVE' },
];

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
    const fetchListings = async () => {
      try {
        const res = await fetch(
          (import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/listings?status=ACTIVE',
          { signal: AbortSignal.timeout(4000) }
        );
        const data = await res.json();
        const items = data.listings || data;
        if (Array.isArray(items) && items.length > 0) {
          setListings(items);
        } else {
          setListings(MOCK_LISTINGS);
        }
      } catch {
        setListings(MOCK_LISTINGS);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
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
      saveCart(cart.map(c => c.listingId === listing.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      saveCart([...cart, { listingId: listing.id, title: listing.cropType, price: listing.pricePerKg, quantity: 1, farmerId: listing.farmerId }]);
    }
  };

  const removeFromCart = (listingId) => saveCart(cart.filter(c => c.listingId !== listingId));

  const checkout = () => {
    if (!user) { navigate('/login'); return; }
    alert('Order placed! (Demo mode - backend coming soon)');
    saveCart([]);
    setShowCart(false);
  };

  const filtered = listings.filter(l => {
    const matchSearch = l.cropType?.toLowerCase().includes(search.toLowerCase()) || l.description?.toLowerCase().includes(search.toLowerCase());
    const matchCrop = filterCrop ? l.cropType === filterCrop : true;
    return matchSearch && matchCrop;
  });

  const cropTypes = [...new Set(listings.map(l => l.cropType).filter(Boolean))];
  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Marketplace</h1>
          <p className="text-gray-500 mt-1">{filtered.length} produce listings available</p>
        </div>
        <button onClick={() => setShowCart(!showCart)} className="relative bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 font-medium">
          Cart ({cart.length})
          {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cart.length}</span>}
        </button>
      </div>

      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50" onClick={() => setShowCart(false)}>
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Your Cart</h2>
            {cart.length === 0 ? <p className="text-gray-500">Cart is empty</p> : (
              <>
                {cart.map(item => (
                  <div key={item.listingId} className="flex justify-between items-center py-3 border-b">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-500">x{item.quantity} - N{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.listingId)} className="text-red-500 text-sm hover:underline">Remove</button>
                  </div>
                ))}
                <p className="font-bold text-lg mt-4">Total: N{cartTotal.toLocaleString()}</p>
                <button onClick={checkout} className="mt-3 w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-medium">Checkout</button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-6">
        <input type="text" placeholder="Search crops..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
        <select value={filterCrop} onChange={e => setFilterCrop(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="">All Crops</option>
          {cropTypes.map(crop => <option key={crop} value={crop}>{crop}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-12">No listings match your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(listing => (
            <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-800">{listing.cropType}</h3>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>
              </div>
              <p className="text-sm text-gray-500 mb-3">{listing.description}</p>
              <div className="space-y-1 text-sm text-gray-600 mb-4">
                <p><span className="font-medium">{listing.quantityKg.toLocaleString()} kg</span> available</p>
                <p>Price: <span className="font-medium text-green-600">N{listing.pricePerKg}/kg</span></p>
                <p>Location: {listing.location}</p>
              </div>
              <button onClick={() => addToCart(listing)} className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm">Add to Cart</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
