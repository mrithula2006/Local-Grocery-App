import React, { useState, useEffect } from 'react';
import { productApi, orderApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import {
  Shield,
  Package,
  Layers,
  AlertTriangle,
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  CheckCircle,
  CheckCircle2,
  Truck,
  RefreshCw,
  ShoppingBag,
  Store,
  MapPin,
  Clock,
  Phone,
  Mail,
  FileText,
  Sparkles,
} from 'lucide-react';
import { getRegisteredShops, updateShop, toggleShopOpenStatus } from '../services/shopManager';

const CATEGORIES = ['Fruits & Veggies', 'Dairy', 'Bakery', 'Snacks', 'Household'];

const AdminDashboard = ({ setActivePage, initialTab }) => {
  const { user, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab || 'inventory'); // 'inventory' | 'orders' | 'shop'

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Shop Registration & Profile State
  const [allShops, setAllShops] = useState(getRegisteredShops);
  const [shopProfile, setShopProfile] = useState(() => {
    const shops = getRegisteredShops();
    return shops[0] || {
      id: 'shop-1',
      shopName: 'FreshCart Central Organic Mart',
      ownerName: 'Vendor Partner',
      category: 'Organic Farm Produce & Daily Groceries',
      fssaiNumber: 'FSSAI-12220026000451',
      gstNumber: '29ABCDE1234F1Z5',
      phone: '9876543210',
      email: 'vendor@freshcart.com',
      address: 'Shop #14, Sector 4, Koramangala, Bengaluru',
      pincode: '560034',
      openTime: '07:00 AM',
      closeTime: '10:30 PM',
      deliveryRadius: '8',
      minOrder: '150',
      isOpen: true,
      bannerImage: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    };
  });
  const [shopSavedNotice, setShopSavedNotice] = useState('');

  useEffect(() => {
    const handleShopsUpdated = () => {
      const updatedList = getRegisteredShops();
      setAllShops(updatedList);
      // Keep current shop profile synced with updated list
      setShopProfile((prev) => {
        const found = updatedList.find((s) => s.id === prev.id);
        return found || prev;
      });
    };
    window.addEventListener('freshcart_shops_updated', handleShopsUpdated);
    return () => window.removeEventListener('freshcart_shops_updated', handleShopsUpdated);
  }, []);

  // Search & filter inside admin table
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState('All');
  const [orderFilterStatus, setOrderFilterStatus] = useState('All');

  // Add/Edit Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Fruits & Veggies',
    price: '',
    discountPrice: '',
    stock: '',
    unit: '1 kg',
    image: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [savingProduct, setSavingProduct] = useState(false);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [prodRes, ordRes] = await Promise.all([
        productApi.getProducts({}),
        orderApi.getAllOrders('All'),
      ]);
      if (prodRes.success) setProducts(prodRes.data);
      if (ordRes.success) setOrders(ordRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Fruits & Veggies',
      price: '',
      discountPrice: '',
      stock: '25',
      unit: '1 pc',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      description: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      discountPrice: product.discountPrice ? product.discountPrice.toString() : '',
      stock: product.stock.toString(),
      unit: product.unit,
      image: product.image,
      description: product.description || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Product name is required';
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
      errs.price = 'Valid positive price required';
    }
    if (formData.stock === '' || isNaN(formData.stock) || Number(formData.stock) < 0) {
      errs.stock = 'Valid stock quantity required';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSavingProduct(true);
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : 0,
        stock: Number(formData.stock),
        unit: formData.unit.trim(),
        image: formData.image.trim() || undefined,
        description: formData.description.trim(),
      };

      if (editingProduct) {
        await productApi.updateProduct(editingProduct._id, payload);
      } else {
        await productApi.createProduct(payload);
      }

      setIsModalOpen(false);
      await loadData(true);
    } catch (err) {
      alert('Error saving product: ' + err.message);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (confirm(`Are you sure you want to permanently delete "${name}" from the inventory?`)) {
      try {
        await productApi.deleteProduct(id);
        setProducts(products.filter((p) => p._id !== id));
      } catch (err) {
        alert('Failed to delete product: ' + err.message);
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderApi.updateOrderStatus(orderId, {
        status: newStatus,
        note: `Updated to ${newStatus} by Admin`,
      });
      await loadData(true);
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4 shadow-sm my-8">
        <Shield className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Admin / Vendor Access Only</h2>
        <p className="text-xs text-slate-500">
          You must be logged in as an administrator to access the inventory catalog, register your shop, and handle customer order fulfillment.
        </p>
        <button
          onClick={() => setActivePage && setActivePage('login')}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  // Filtered Inventory
  const filteredProducts = products.filter((p) => {
    const matchCat = inventoryCategory === 'All' || p.category === inventoryCategory;
    const matchSearch =
      !inventorySearch ||
      p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      p.category.toLowerCase().includes(inventorySearch.toLowerCase());
    return matchCat && matchSearch;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    return orderFilterStatus === 'All' || o.orderStatus === orderFilterStatus;
  });

  // KPI Calculations
  const lowStockCount = products.filter((p) => p.stock <= 5).length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.totalAmount : 0), 0);

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200 uppercase">
              Admin Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Vendor Inventory & Orders
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage product pricing, real-time stock levels, catalog additions, and customer order fulfillment
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-2 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-600' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">Total Catalog</span>
            <Package className="w-5 h-5 text-brand-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{products.length}</p>
          <p className="text-[11px] text-slate-400">Active grocery items</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">Low Stock Alert</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">{lowStockCount}</p>
          <p className="text-[11px] text-slate-400">&le; 5 units remaining</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">Total Orders</span>
            <ShoppingBag className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{orders.length}</p>
          <p className="text-[11px] text-slate-400">Customer requests</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">Paid Revenue</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700">{formatPrice(totalRevenue)}</p>
          <p className="text-[11px] text-slate-400">Total settled sales</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex flex-wrap gap-4">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Inventory Management ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Store Orders & Fulfillment ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('shop')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'shop'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Store className="w-4 h-4 text-amber-600" />
          <span>Register My Shop & Profile</span>
        </button>
      </div>

      {/* TAB 1: INVENTORY MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Table Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500">Category:</span>
              <select
                value={inventoryCategory}
                onChange={(e) => setInventoryCategory(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price / Discount</th>
                    <th className="p-4">Stock Level</th>
                    <th className="p-4">Unit</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const isOutOfStock = p.stock <= 0;
                    const isLow = p.stock > 0 && p.stock <= 5;

                    return (
                      <tr key={p._id} className="hover:bg-slate-50/70 transition">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80';
                            }}
                          />
                          <div>
                            <p className="font-bold text-slate-900">{p.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">#{p._id.slice(-6)}</p>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                            {p.category}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="font-black text-slate-900">
                            {formatPrice(p.discountPrice > 0 ? p.discountPrice : p.price)}
                          </span>
                          {p.discountPrice > 0 && (
                            <span className="text-[10px] text-slate-400 line-through ml-1.5">
                              {formatPrice(p.price)}
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full ${
                              isOutOfStock
                                ? 'bg-rose-100 text-rose-800'
                                : isLow
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isOutOfStock ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                            />
                            {p.stock} units
                          </span>
                        </td>

                        <td className="p-4 text-slate-600 font-medium">{p.unit}</td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition"
                              title="Edit product"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p._id, p.name)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STORE ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Manage Customer Deliveries</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Filter Status:</span>
              <select
                value={orderFilterStatus}
                onChange={(e) => setOrderFilterStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Packed">Packed</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                No orders found under selected filter.
              </div>
            ) : (
              filteredOrders.map((ord) => (
                <div
                  key={ord._id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-800">
                          #{ord._id.slice(-6).toUpperCase()}
                        </span>
                        <StatusBadge status={ord.orderStatus} />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {formatDate(ord.createdAt)} &bull; Customer:{' '}
                        <strong className="text-slate-700">{ord.shippingAddress?.fullName}</strong> ({ord.shippingAddress?.phone})
                      </p>
                    </div>

                    {/* Status Advance Controls */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">Change Status:</span>
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Packed">Packed</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Items Summary & Delivery Address */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-500 block mb-1.5">
                        Items ({ord.items?.length})
                      </span>
                      <div className="space-y-1">
                        {ord.items?.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-slate-700">
                            <span>
                              {it.quantity}x {it.name} ({it.unit})
                            </span>
                            <span className="font-semibold">{formatPrice(it.price * it.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="font-bold text-slate-700 block">Delivery Address</span>
                      <p className="text-slate-600">
                        {ord.shippingAddress?.address}
                        {ord.shippingAddress?.landmark ? `, ${ord.shippingAddress.landmark}` : ''}, Pincode:{' '}
                        {ord.shippingAddress?.pincode}
                      </p>
                      <div className="pt-2 flex justify-between font-bold border-t border-slate-200 text-slate-900">
                        <span>Total ({ord.paymentMethod})</span>
                        <span className="text-emerald-700">{formatPrice(ord.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: REGISTER MY SHOP & VENDOR PROFILE */}
      {activeTab === 'shop' && (
        <div className="space-y-6 animate-fade-in">
          {/* Success Banner */}
          {shopSavedNotice && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{shopSavedNotice}</span>
            </div>
          )}

          {/* Shop Switcher & New Shop Registration Button */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <Store className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-800">Manage Registered Stores</div>
                <div className="text-[11px] text-slate-500">Select an existing grocery shop to edit or register a new branch/shop</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={shopProfile.id}
                onChange={(e) => {
                  const found = allShops.find((s) => s.id === e.target.value);
                  if (found) setShopProfile(found);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-800 focus:ring-2 focus:ring-amber-500"
              >
                {allShops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shopName} {s.isOpen ? '🟢 Open' : '🔴 Closed'}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  const newShopId = 'shop-' + Date.now();
                  const newTemplate = {
                    id: newShopId,
                    shopName: 'Green Mart Express',
                    category: 'Organic Farm Groceries & Fresh Greens',
                    ownerName: user?.name || 'Vendor Partner',
                    fssaiNumber: 'FSSAI-' + Math.floor(10000000000000 + Math.random() * 90000000000000),
                    gstNumber: '29ABCDE' + Math.floor(1000 + Math.random() * 9000) + 'F1Z5',
                    phone: user?.phone || '9876543210',
                    email: user?.email || 'store@freshcart.com',
                    address: 'Shop #28, 5th Main, Indiranagar, Bengaluru',
                    pincode: '560038',
                    openTime: '07:00 AM',
                    closeTime: '10:30 PM',
                    deliveryRadius: '8',
                    isOpen: true,
                    rating: 4.9,
                    totalDeliveries: '0',
                    bannerImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
                  };
                  setShopProfile(newTemplate);
                  setShopSavedNotice('Brand new shop initialized! Enter shop details below and click Save & Register.');
                  setTimeout(() => setShopSavedNotice(''), 4000);
                }}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition shrink-0 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>+ Register New Shop</span>
              </button>
            </div>
          </div>

          {/* Store Overview & Verified Badge Card */}
          <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={shopProfile.bannerImage}
                alt="Store Front"
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=400&q=80';
                }}
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black">{shopProfile.shopName}</h2>
                  <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Shield className="w-3 h-3" /> FSSAI Verified
                  </span>
                </div>
                <p className="text-xs text-amber-100 font-medium">{shopProfile.category || 'Grocery Store'}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-amber-200/90 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {shopProfile.address || 'Address pending'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {shopProfile.openTime} - {shopProfile.closeTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Store Status Switch */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex items-center gap-4 shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-200 block">
                  Store Status
                </span>
                <span className="text-sm font-extrabold text-white">
                  {shopProfile.isOpen ? '🟢 Open for Delivery' : '🔴 Temporarily Closed'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const updated = { ...shopProfile, isOpen: !shopProfile.isOpen };
                  setShopProfile(updated);
                  localStorage.setItem('freshcart_vendor_shop', JSON.stringify(updated));
                  updateShop(updated);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                  shopProfile.isOpen
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                {shopProfile.isOpen ? 'Switch to Closed' : 'Open Store'}
              </button>
            </div>
          </div>

          {/* Form & Certificate Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Registration Form (2 Columns) */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Store className="w-4 h-4 text-amber-600" />
                    <span>Official Shop Registration Details</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Keep your store license, operating hours, and dispatch radius up to date
                  </p>
                </div>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                localStorage.setItem('freshcart_vendor_shop', JSON.stringify(shopProfile));
                updateShop(shopProfile);
                setShopSavedNotice(`Shop "${shopProfile.shopName}" saved & registered successfully!`);
                setTimeout(() => setShopSavedNotice(''), 3500);
              }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Store / Shop Name *
                    </label>
                    <input
                      type="text"
                      value={shopProfile.shopName}
                      onChange={(e) => setShopProfile({ ...shopProfile, shopName: e.target.value })}
                      required
                      placeholder="e.g. FreshCart Daily Supermarket"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Store Category / Niche *
                    </label>
                    <input
                      type="text"
                      value={shopProfile.category}
                      onChange={(e) => setShopProfile({ ...shopProfile, category: e.target.value })}
                      placeholder="Type store category (e.g. Fresh Groceries & Organic Produce)"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      FSSAI Food License Number *
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={shopProfile.fssaiNumber}
                        onChange={(e) => setShopProfile({ ...shopProfile, fssaiNumber: e.target.value })}
                        required
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono font-medium focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      GSTIN / Tax Identification *
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={shopProfile.gstNumber}
                        onChange={(e) => setShopProfile({ ...shopProfile, gstNumber: e.target.value })}
                        required
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono font-medium focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Store Contact Phone (10 Digits) *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        maxLength="10"
                        value={shopProfile.phone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setShopProfile({ ...shopProfile, phone: digits });
                        }}
                        required
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono font-medium focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Store Support Email *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={shopProfile.email}
                        onChange={(e) => setShopProfile({ ...shopProfile, email: e.target.value })}
                        required
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Physical Store Address *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={shopProfile.address}
                        onChange={(e) => setShopProfile({ ...shopProfile, address: e.target.value })}
                        required
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pincode *</label>
                    <input
                      type="text"
                      maxLength="6"
                      value={shopProfile.pincode}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setShopProfile({ ...shopProfile, pincode: digits });
                      }}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono font-medium focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Opening Time</label>
                    <input
                      type="text"
                      value={shopProfile.openTime}
                      onChange={(e) => setShopProfile({ ...shopProfile, openTime: e.target.value })}
                      placeholder="07:00 AM"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Closing Time</label>
                    <input
                      type="text"
                      value={shopProfile.closeTime}
                      onChange={(e) => setShopProfile({ ...shopProfile, closeTime: e.target.value })}
                      placeholder="10:30 PM"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Delivery Radius ({shopProfile.deliveryRadius} km)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={shopProfile.deliveryRadius}
                      onChange={(e) => setShopProfile({ ...shopProfile, deliveryRadius: e.target.value })}
                      className="w-full accent-amber-600 mt-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Storefront Photo URL
                  </label>
                  <input
                    type="text"
                    value={shopProfile.bannerImage}
                    onChange={(e) => setShopProfile({ ...shopProfile, bannerImage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-extrabold transition shadow-md shadow-amber-600/25 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Save & Register Shop Profile</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Verification Certificate Card */}
            <div className="space-y-4">
              <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl p-6 text-white border border-slate-700 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                      Merchant Certificate
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    ACTIVE
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Registered Entity</span>
                    <span className="font-bold text-white text-sm">{shopProfile.shopName}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">FSSAI License</span>
                    <span className="font-mono text-emerald-400 font-bold">{shopProfile.fssaiNumber}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">GSTIN Number</span>
                    <span className="font-mono text-slate-300 font-bold">{shopProfile.gstNumber}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Dispatch Coverage</span>
                    <span className="font-bold text-white">Within {shopProfile.deliveryRadius} km of Koramangala Hub</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-700/80 text-[11px] text-slate-400 leading-relaxed">
                  ✓ Verified for instant grocery fulfillment and automated 15-minute dispatch network.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h3 className="font-bold text-sm sm:text-base">
                {editingProduct ? 'Edit Grocery Item' : 'Add New Grocery Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Organic Seedless Watermelon"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand-500"
                />
                {formErrors.name && (
                  <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit / Pack Size</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g. 500 g, 1 kg, Pack of 4"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="120"
                    min="1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium"
                  />
                  {formErrors.price && (
                    <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sale Price (₹)</label>
                  <input
                    type="number"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    placeholder="99"
                    min="0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stock Qty *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="50"
                    min="0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium"
                  />
                  {formErrors.stock && (
                    <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.stock}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Fresh organic farm harvest..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  {savingProduct ? 'Saving...' : editingProduct ? 'Update Product' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
