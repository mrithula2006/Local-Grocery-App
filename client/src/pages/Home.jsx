import React, { useState, useEffect } from 'react';
import { productApi, orderApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getRegisteredShops, getSelectedShop, setSelectedShop } from '../services/shopManager';
import ProductCard from '../components/ProductCard';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  ShoppingBag,
  RefreshCw,
  AlertCircle,
  Apple,
  Milk,
  Croissant,
  Cookie,
  Home as HomeIcon,
  Layers,
  Map,
  Truck,
  Compass,
  Store,
  Clock,
  MapPin,
  Shield,
  ChevronRight,
  AlertTriangle,
  X,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'All', name: 'All Categories', icon: Layers },
  { id: 'Fruits & Veggies', name: 'Fruits & Veggies', icon: Apple },
  { id: 'Dairy', name: 'Dairy & Eggs', icon: Milk },
  { id: 'Bakery', name: 'Bakery', icon: Croissant },
  { id: 'Snacks', name: 'Snacks & Munchies', icon: Cookie },
  { id: 'Household', name: 'Household Essentials', icon: HomeIcon },
];

const Home = ({ setActivePage }) => {
  const { isAuthenticated, isCustomer } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);

  // Multiple Registered Shops State
  const [shops, setShops] = useState(getRegisteredShops);
  const [activeShop, setActiveShop] = useState(getSelectedShop);
  const [showStorePicker, setShowStorePicker] = useState(false);

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity');

  // Synchronize registered stores and open/closed changes across tabs and vendor updates
  useEffect(() => {
    const handleShopUpdate = () => {
      setShops(getRegisteredShops());
      setActiveShop(getSelectedShop());
    };
    window.addEventListener('freshcart_shops_updated', handleShopUpdate);
    window.addEventListener('freshcart_selected_shop_changed', handleShopUpdate);
    return () => {
      window.removeEventListener('freshcart_shops_updated', handleShopUpdate);
      window.removeEventListener('freshcart_selected_shop_changed', handleShopUpdate);
    };
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productApi.getProducts({
        category: selectedCategory,
        keyword: searchQuery,
        sort: sortBy,
      });
      if (res.success) {
        setProducts(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load grocery catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [selectedCategory, searchQuery, sortBy]);

  // Check for active orders to show live GPS radar tracking banner
  useEffect(() => {
    if (isAuthenticated && isCustomer) {
      orderApi.getMyOrders().then((res) => {
        if (res.success && res.data) {
          const active = res.data.find(
            (o) => o.orderStatus === 'Out for Delivery' || o.orderStatus === 'Packed' || o.orderStatus === 'Pending'
          );
          if (active) setActiveOrder(active);
        }
      }).catch(() => {});
    }
  }, [isAuthenticated, isCustomer]);

  const handleSelectShop = (shopId) => {
    setSelectedShop(shopId);
    setActiveShop(getSelectedShop());
    setShowStorePicker(false);
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSortBy('popularity');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Live Active Order Tracking Notification */}
      {activeOrder && (
        <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <p className="text-xs font-black uppercase text-emerald-400 tracking-wide flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                Live Order Tracking: #{activeOrder._id?.slice(-6).toUpperCase()} ({activeOrder.orderStatus})
              </p>
              <p className="text-[11px] text-slate-300">
                Partner is delivering your groceries from {activeOrder.shopName || 'Store'} to {activeOrder.shippingAddress?.address?.slice(0, 25) || 'your location'}.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActivePage('orders')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/30 active:scale-95 shrink-0"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Open Live GPS Map Tracker &rarr;</span>
          </button>
        </div>
      )}

      {/* Selected Store Indicator & Store Switcher Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Shopping From:
              </span>
              <span className="text-sm font-black text-slate-900">
                {activeShop?.shopName}
              </span>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  activeShop?.isOpen
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {activeShop?.isOpen ? '🟢 Open Now' : '🔴 Currently Closed'}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate max-w-md mt-0.5">
              {activeShop?.category} &bull; {activeShop?.address}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowStorePicker(true)}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 self-start sm:self-auto"
        >
          <Store className="w-3.5 h-3.5 text-amber-600" />
          <span>Switch Store ({shops.length} Available)</span>
        </button>
      </div>

      {/* Store Closed Warning Banner (If Selected Store is Marked Closed by Vendor) */}
      {!activeShop?.isOpen && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 text-rose-900 shadow-sm flex items-start gap-3 animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-black">
              Store is Currently Marked Closed by Vendor ({activeShop?.shopName})
            </h4>
            <p className="text-xs text-rose-800 leading-relaxed">
              This store is not accepting orders at the moment. You can browse product catalog items below, but cart checkout will remain paused until the store manager reopens.
            </p>
            <button
              onClick={() => setShowStorePicker(true)}
              className="text-xs font-bold text-rose-900 underline hover:text-rose-700 inline-block pt-1"
            >
              Click here to switch to an Open Store &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white shadow-xl">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative max-w-4xl mx-auto px-6 py-12 sm:py-16 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-300 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Farm Fresh Groceries &bull; Free Delivery above ₹500</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Fresh Groceries Delivered <br className="hidden sm:inline" />
            <span className="text-emerald-300">to Your Door in 15 Mins</span>
          </h1>

          <p className="text-emerald-100 text-sm sm:text-base max-w-xl mx-auto">
            Order organic farm vegetables, dairy, artisan bakery loaves, and daily staples from your local neighborhood stores.
          </p>

          {/* Quick Search in Hero */}
          <div className="max-w-xl mx-auto mt-6 relative">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search farm apples, fresh milk, sourdough bread, almonds..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 text-sm shadow-2xl focus:outline-none focus:ring-4 focus:ring-emerald-400/40 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-xs font-bold text-slate-400 hover:text-slate-700 bg-slate-100 px-2 py-1 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills Bar */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Explore Categories</span>
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            {products.length} {products.length === 1 ? 'item' : 'items'} available
          </span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 border shadow-xs ${
                  isSelected
                    ? 'bg-brand-600 text-white border-brand-600 shadow-brand-500/20'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300 hover:bg-brand-50/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-brand-600'}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Sorting & Filter Results Meta */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h3 className="text-xl font-black text-slate-900">
            {selectedCategory === 'All' ? 'All Grocery Products' : selectedCategory}
          </h3>
          <p className="text-xs text-slate-500">
            {searchQuery ? `Search results for "${searchQuery}"` : 'Hand-picked fresh everyday inventory'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Sort by:</span>
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs cursor-pointer"
          >
            <option value="popularity">Popularity / Bestsellers</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Customer Rating</option>
          </select>
        </div>
      </section>

      {/* Product Catalog Grid */}
      <section>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-slate-200 p-4 space-y-3 animate-pulse"
              >
                <div className="w-full h-36 bg-slate-200 rounded-2xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-8 bg-slate-200 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center space-y-3 shadow-sm max-w-md mx-auto">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h4 className="text-base font-bold text-slate-900">Failed to Load Products</h4>
            <p className="text-xs text-slate-500">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-sm max-w-md mx-auto">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900">No Matching Groceries Found</h4>
            <p className="text-xs text-slate-500">
              Try adjusting your search keyword or browse across other high-demand categories.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
            >
              Clear Search & Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Multiple Registered Stores Selection Modal */}
      {showStorePicker && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 border border-slate-200 shadow-2xl space-y-5 animate-fade-in max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Store className="w-5 h-5 text-amber-600" />
                  <span>Choose Your Neighborhood Grocery Store</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Select a registered supermarket hub to browse its active catalog and inventory
                </p>
              </div>
              <button
                onClick={() => setShowStorePicker(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {shops.map((s) => {
                const isCurrent = activeShop?.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => handleSelectShop(s.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isCurrent
                        ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={s.bannerImage}
                        alt={s.shopName}
                        className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80';
                        }}
                      />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900">{s.shopName}</h4>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              s.isOpen
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {s.isOpen ? '🟢 Open Now' : '🔴 Closed'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{s.category}</p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{s.address}</span>
                          <span>&bull;</span>
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{s.openTime} - {s.closeTime}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                        ★ {s.rating || '4.8'}
                      </span>
                      <button
                        type="button"
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          isCurrent
                            ? 'bg-brand-600 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        {isCurrent ? 'Current Store' : 'Select Store'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
