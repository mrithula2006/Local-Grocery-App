import React, { useState, useEffect } from 'react';
import { orderApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import {
  Truck,
  Phone,
  MapPin,
  CheckCircle,
  CheckCircle2,
  Package,
  Clock,
  RefreshCw,
  Navigation,
  Shield,
  Bike,
  FileText,
  AlertCircle,
  Sparkles,
  User,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { getRegisteredShops } from '../services/shopManager';

const DeliveryDashboard = ({ setActivePage, initialTab }) => {
  const { user, isDelivery } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab || 'tasks'); // 'tasks' | 'history' | 'rides'

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [registeredShops, setRegisteredShops] = useState(getRegisteredShops);

  useEffect(() => {
    const handleShopsUpdated = () => {
      setRegisteredShops(getRegisteredShops());
    };
    window.addEventListener('freshcart_shops_updated', handleShopsUpdated);
    return () => window.removeEventListener('freshcart_shops_updated', handleShopsUpdated);
  }, []);

  // Ride Registration & Vehicle Profile State
  const [rideProfile, setRideProfile] = useState(() => {
    const saved = localStorage.getItem('freshcart_delivery_ride');
    return saved
      ? JSON.parse(saved)
      : {
          riderName: user?.name || 'Ramesh Kumar',
          phone: user?.phone || '9876543210',
          vehicleType: 'Electric Scooter (EV)',
          vehicleModel: 'Ather 450X Gen 3',
          licensePlate: 'KA 05 EV 8892',
          drivingLicense: 'DL-0420200192834',
          insurancePolicy: 'ICICI-LOMBARD-EV-98214',
          emergencyContact: 'Suresh Kumar (Brother) - 9845012345',
          isOnDuty: true,
          safetyGear: {
            helmet: true,
            thermalBag: true,
            idCard: true,
            safetyJacket: true,
          },
        };
  });
  const [rideSavedNotice, setRideSavedNotice] = useState('');

  const fetchOrders = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await orderApi.getAllOrders();
      if (res.success) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch delivery orders:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isDelivery) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isDelivery]);

  const handleAdvanceStatus = async (orderId, targetStatus) => {
    try {
      setUpdatingId(orderId);
      await orderApi.updateOrderStatus(orderId, {
        status: targetStatus,
        note: `Order marked as ${targetStatus} by delivery partner ${user?.name || rideProfile.riderName}`,
      });
      await fetchOrders(true);
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveRide = (e) => {
    e.preventDefault();
    localStorage.setItem('freshcart_delivery_ride', JSON.stringify(rideProfile));
    setRideSavedNotice('Vehicle & rider registration profile updated successfully!');
    setTimeout(() => setRideSavedNotice(''), 3500);
  };

  if (!isDelivery) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4 shadow-sm my-8">
        <Truck className="w-12 h-12 text-purple-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Delivery Fleet Access Only</h2>
        <p className="text-xs text-slate-500">
          This portal is reserved for registered delivery agents to manage live dispatches, register vehicles, and confirm doorstep handovers.
        </p>
        <button
          onClick={() => setActivePage && setActivePage('login')}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  // Active deliveries vs delivered deliveries
  const activeDeliveries = orders.filter(
    (o) => o.orderStatus === 'Packed' || o.orderStatus === 'Out for Delivery' || o.orderStatus === 'Pending'
  );
  const completedDeliveries = orders.filter((o) => o.orderStatus === 'Delivered');

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-purple-200 uppercase">
              Rider Hub
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Delivery Partner Portal
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Active dispatch orders, pickup grocery stores, customer drop addresses & vehicle registration
          </p>
        </div>

        <button
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-2 shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-purple-600' : ''}`} />
          <span>Refresh Tasks</span>
        </button>
      </div>

      {/* Registered Grocery Stores Live Status Board */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-extrabold text-slate-800">
              Partner Grocery Stores Hub Status ({registeredShops.length} Registered Stores)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Live store status synced with Vendor Dashboard</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {registeredShops.map((shop) => (
            <div
              key={shop.id}
              className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                shop.isOpen
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50/70 border-rose-200 text-rose-950'
              }`}
            >
              <div className="truncate pr-2">
                <span className="font-bold block truncate">{shop.shopName}</span>
                <span className="text-[10px] opacity-75 truncate block">{shop.address}</span>
              </div>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 shadow-xs ${
                  shop.isOpen
                    ? 'bg-emerald-600 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {shop.isOpen ? '🟢 OPEN' : '🔴 CLOSED'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500">Active Tasks</span>
          <p className="text-2xl font-black text-purple-700">{activeDeliveries.length}</p>
          <p className="text-[10px] text-slate-400">Needs dispatch or handover</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500">Completed Deliveries</span>
          <p className="text-2xl font-black text-emerald-700">{completedDeliveries.length}</p>
          <p className="text-[10px] text-slate-400">Successfully handed over</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Registered Ride</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              rideProfile.isOnDuty ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
            }`}>
              {rideProfile.isOnDuty ? '● ON DUTY' : '○ OFF DUTY'}
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900 truncate">{rideProfile.vehicleModel}</p>
          <p className="text-[10px] font-mono text-purple-700 font-bold">{rideProfile.licensePlate}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex flex-wrap gap-4">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'tasks'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Active Dispatches ({activeDeliveries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rides')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'rides'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bike className="w-4 h-4 text-purple-600" />
          <span>Register Rides & Vehicle</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Completed Archive ({completedDeliveries.length})</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-purple-600" />
            <span>Assigned Deliveries ({activeDeliveries.length})</span>
          </h2>

          {activeDeliveries.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
              🎉 All set! No active delivery dispatches pending right now.
            </div>
          ) : (
            activeDeliveries.map((ord) => {
              const isUpdating = updatingId === ord._id;

              return (
                <div
                  key={ord._id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 hover:border-purple-300 transition-colors"
                >
                  {/* Header row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-700">
                        #{ord._id.slice(-6).toUpperCase()}
                      </span>
                      <StatusBadge status={ord.orderStatus} />
                      <span className="text-xs text-slate-400 font-medium">
                        Placed {formatDate(ord.createdAt)}
                      </span>
                    </div>

                    {/* Dynamic Action Button for Rider */}
                    <div className="flex items-center gap-2">
                      {ord.orderStatus === 'Pending' && (
                        <button
                          onClick={() => handleAdvanceStatus(ord._id, 'Packed')}
                          disabled={isUpdating}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                        >
                          <Package className="w-4 h-4" />
                          <span>{isUpdating ? 'Updating...' : 'Mark as Packed'}</span>
                        </button>
                      )}

                      {ord.orderStatus === 'Packed' && (
                        <button
                          onClick={() => handleAdvanceStatus(ord._id, 'Out for Delivery')}
                          disabled={isUpdating}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-purple-500/25"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>{isUpdating ? 'Updating...' : 'Start Delivery (Out for Delivery)'}</span>
                        </button>
                      )}

                      {ord.orderStatus === 'Out for Delivery' && (
                        <button
                          onClick={() => handleAdvanceStatus(ord._id, 'Delivered')}
                          disabled={isUpdating}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-500/25"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>{isUpdating ? 'Completing...' : 'Confirm Delivery (Handover)'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Pickup Store Card - Which shop customer ordered from */}
                  <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded-md">
                            Pickup Store
                          </span>
                          <span className="text-xs font-black text-slate-900">
                            {ord.shopName || 'FreshCart Central Organic Mart'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{ord.shopAddress || 'Shop #14, Sector 4, Koramangala, Bengaluru'}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg self-start sm:self-auto shrink-0">
                      📍 Collect Order Package Here
                    </span>
                  </div>

                  {/* Customer Address & Call card */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-rose-500" />
                          <span>Drop Location</span>
                        </span>
                        <a
                          href={`tel:${ord.shippingAddress?.phone}`}
                          className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 bg-brand-50 px-2.5 py-1 rounded-lg"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Customer</span>
                        </a>
                      </div>

                      <p className="text-xs font-bold text-slate-900">
                        {ord.shippingAddress?.fullName} ({ord.shippingAddress?.phone})
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {ord.shippingAddress?.address}
                        {ord.shippingAddress?.landmark ? `, ${ord.shippingAddress.landmark}` : ''}
                        <br />
                        Pincode: {ord.shippingAddress?.pincode}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                      <span className="font-bold text-slate-800 block">Package Details & Collect Amount</span>
                      <div className="space-y-1">
                        {ord.items?.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-slate-600">
                            <span>{it.quantity}x {it.name}</span>
                            <span className="font-medium">{it.unit}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-bold">
                        <span className="text-slate-700">Payment: {ord.paymentMethod}</span>
                        <span
                          className={`text-sm ${
                            ord.paymentMethod === 'Cash on Delivery (COD)'
                              ? 'text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg'
                              : 'text-emerald-700'
                          }`}
                        >
                          {ord.paymentMethod === 'Cash on Delivery (COD)'
                            ? `Collect ${formatPrice(ord.totalAmount)} (COD)`
                            : 'Prepaid (Paid)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: REGISTER RIDES & VEHICLE PROFILE */}
      {activeTab === 'rides' && (
        <div className="space-y-6 animate-fade-in">
          {/* Notification */}
          {rideSavedNotice && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{rideSavedNotice}</span>
            </div>
          )}

          {/* Vehicle Profile Top Banner */}
          <div className="bg-gradient-to-r from-purple-700 via-indigo-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-purple-200 shadow-lg">
                <Bike className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black">{rideProfile.vehicleModel}</h2>
                  <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <ShieldCheck className="w-3 h-3" /> Verified Vehicle
                  </span>
                </div>
                <p className="text-xs text-purple-200 font-mono font-bold tracking-wide">
                  Plate: {rideProfile.licensePlate} &bull; {rideProfile.vehicleType}
                </p>
                <p className="text-[11px] text-purple-300">
                  Rider: {rideProfile.riderName} &bull; DL: {rideProfile.drivingLicense}
                </p>
              </div>
            </div>

            {/* Duty Status Switch */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex items-center gap-4 shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-200 block">
                  Fleet Duty Status
                </span>
                <span className="text-sm font-extrabold text-white">
                  {rideProfile.isOnDuty ? '🟢 Active On-Duty' : '⚪ Off-Duty'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const updated = { ...rideProfile, isOnDuty: !rideProfile.isOnDuty };
                  setRideProfile(updated);
                  localStorage.setItem('freshcart_delivery_ride', JSON.stringify(updated));
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                  rideProfile.isOnDuty
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                {rideProfile.isOnDuty ? 'Go Off-Duty' : 'Go On-Duty'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Registration Form (2 cols) */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Bike className="w-4 h-4 text-purple-600" />
                  <span>Register Vehicle & Ride Credentials</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Submit verified registration plate, driving license, and vehicle type for live dispatch allocation
                </p>
              </div>

              <form onSubmit={handleSaveRide} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Rider Full Name *
                    </label>
                    <input
                      type="text"
                      value={rideProfile.riderName}
                      onChange={(e) => setRideProfile({ ...rideProfile, riderName: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Rider Mobile Number (10 Digits) *
                    </label>
                    <input
                      type="text"
                      maxLength="10"
                      value={rideProfile.phone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setRideProfile({ ...rideProfile, phone: digits });
                      }}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono font-medium focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Vehicle Type *
                    </label>
                    <select
                      value={rideProfile.vehicleType}
                      onChange={(e) => setRideProfile({ ...rideProfile, vehicleType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-white focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Electric Scooter (EV)">Electric Scooter (EV)</option>
                      <option value="Petrol Scooter (Gearless)">Petrol Scooter (Gearless)</option>
                      <option value="Motorcycle / Bike">Motorcycle / Bike</option>
                      <option value="Delivery Cargo Van">Delivery Cargo Van</option>
                      <option value="Bicycle">Bicycle</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Vehicle Model & Make *
                    </label>
                    <input
                      type="text"
                      value={rideProfile.vehicleModel}
                      onChange={(e) => setRideProfile({ ...rideProfile, vehicleModel: e.target.value })}
                      placeholder="e.g. Ather 450X Gen 3"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Vehicle Registration Plate *
                    </label>
                    <input
                      type="text"
                      value={rideProfile.licensePlate}
                      onChange={(e) => setRideProfile({ ...rideProfile, licensePlate: e.target.value })}
                      placeholder="KA 05 EV 8892"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Driving License Number *
                    </label>
                    <input
                      type="text"
                      value={rideProfile.drivingLicense}
                      onChange={(e) => setRideProfile({ ...rideProfile, drivingLicense: e.target.value })}
                      placeholder="DL-0420200192834"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono font-medium uppercase focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Insurance Policy Number
                    </label>
                    <input
                      type="text"
                      value={rideProfile.insurancePolicy}
                      onChange={(e) => setRideProfile({ ...rideProfile, insurancePolicy: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono font-medium focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Emergency Contact Info
                    </label>
                    <input
                      type="text"
                      value={rideProfile.emergencyContact}
                      onChange={(e) => setRideProfile({ ...rideProfile, emergencyContact: e.target.value })}
                      placeholder="Contact Name & 10-Digit Phone"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Safety Gear Checklist */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Verified Fleet Safety Gear
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                    <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rideProfile.safetyGear?.helmet}
                        onChange={(e) =>
                          setRideProfile({
                            ...rideProfile,
                            safetyGear: { ...rideProfile.safetyGear, helmet: e.target.checked },
                          })
                        }
                        className="rounded text-purple-600 accent-purple-600"
                      />
                      <span>ISI Standard Helmet</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rideProfile.safetyGear?.thermalBag}
                        onChange={(e) =>
                          setRideProfile({
                            ...rideProfile,
                            safetyGear: { ...rideProfile.safetyGear, thermalBag: e.target.checked },
                          })
                        }
                        className="rounded text-purple-600 accent-purple-600"
                      />
                      <span>Insulated Thermal Bag</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rideProfile.safetyGear?.idCard}
                        onChange={(e) =>
                          setRideProfile({
                            ...rideProfile,
                            safetyGear: { ...rideProfile.safetyGear, idCard: e.target.checked },
                          })
                        }
                        className="rounded text-purple-600 accent-purple-600"
                      />
                      <span>Official FreshCart ID Badge</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rideProfile.safetyGear?.safetyJacket}
                        onChange={(e) =>
                          setRideProfile({
                            ...rideProfile,
                            safetyGear: { ...rideProfile.safetyGear, safetyJacket: e.target.checked },
                          })
                        }
                        className="rounded text-purple-600 accent-purple-600"
                      />
                      <span>Reflective Night Jacket</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-extrabold transition shadow-md shadow-purple-600/25 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Save & Register Ride Details</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Live Digital ID Card */}
            <div className="space-y-4">
              <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 text-white border border-slate-700 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-purple-300">
                      Rider Digital ID
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    VERIFIED
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                    alt="Rider"
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-500 shadow-md"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{rideProfile.riderName}</h4>
                    <span className="text-[10px] text-amber-400 font-bold">★ 4.9 Super Rider</span>
                    <p className="text-[11px] text-slate-300 font-mono mt-0.5">📞 +91 {rideProfile.phone}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs pt-2 border-t border-slate-700/80">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Registered Vehicle</span>
                    <span className="font-bold text-white">{rideProfile.vehicleModel}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Registration Plate</span>
                    <span className="font-mono text-purple-300 font-black tracking-wider text-sm">
                      {rideProfile.licensePlate}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Driving License Number</span>
                    <span className="font-mono text-slate-300">{rideProfile.drivingLicense}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-700/80 text-[11px] text-slate-400 leading-relaxed">
                  ✓ Transmitted to customers in live GPS order tracker during active delivery.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMPLETED ARCHIVE */}
      {activeTab === 'history' && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-slate-700">Completed Deliveries Archive</h3>
          {completedDeliveries.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
              No completed deliveries yet. Accept and fulfill dispatches to see your archive.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 bg-white rounded-3xl border border-slate-200 overflow-hidden text-xs shadow-sm">
              {completedDeliveries.map((d) => (
                <div key={d._id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800">#{d._id.slice(-6).toUpperCase()}</span>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        {d.shopName || 'Central Organic Mart'}
                      </span>
                    </div>
                    <span className="text-slate-500 text-xs">Customer: {d.shippingAddress?.fullName}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{d.shippingAddress?.address}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">{formatPrice(d.totalAmount)}</span>
                    <StatusBadge status="Delivered" size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;
