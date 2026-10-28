import React, { useState, useEffect } from 'react';
import { orderApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate, getRealTimeOrderTimings } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import LiveTrackingMap from '../components/LiveTrackingMap';
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  RefreshCw,
  MapPin,
  CreditCard,
  ShoppingBag,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Map,
  Compass,
  Sparkles,
  Store,
} from 'lucide-react';

const STATUS_STEPS = [
  { key: 'Pending', label: 'Order Placed', timingKey: 'placed', desc: 'Received by store', icon: Clock },
  { key: 'Packed', label: 'Items Packed', timingKey: 'packed', desc: 'Bagged & sealed', icon: Package },
  { key: 'Out for Delivery', label: 'Out for Delivery', timingKey: 'dispatched', desc: 'Rider on the road', icon: Truck },
  { key: 'Delivered', label: 'Delivered', timingKey: 'delivered', desc: 'Handed over at door', icon: CheckCircle2 },
];

const Orders = ({ setActivePage }) => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState(null);

  // Live real-time clock state ticking every second
  const [liveClock, setLiveClock] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveClock(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchOrders = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await orderApi.getMyOrders();
      if (res.success) {
        setOrders(res.data);
        if (res.data.length > 0 && !expandedOrder) {
          setExpandedOrder(res.data[0]._id);
          const latest = res.data[0];
          if (latest.orderStatus === 'Out for Delivery' || latest.orderStatus === 'Packed') {
            setActiveTrackingOrderId(latest._id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const getStepIndex = (status) => {
    switch (status) {
      case 'Pending':
        return 0;
      case 'Packed':
        return 1;
      case 'Out for Delivery':
        return 2;
      case 'Delivered':
        return 3;
      default:
        return -1;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4 shadow-sm my-8">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign In to Track Orders</h2>
        <p className="text-xs text-slate-500">
          Please sign in to view your past grocery deliveries and follow the live GPS tracking map.
        </p>
        <button
          onClick={() => setActivePage('login')}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header with Live Real-Time Clock */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase">
              Customer Orders
            </span>
            <div className="flex items-center gap-1.5 bg-slate-900 text-white px-2.5 py-0.5 rounded-full text-xs font-mono font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Real Time: {liveClock.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            My Orders & Live Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time stage updates, dynamic timestamps, and interactive live GPS delivery partner map tracking
          </p>
        </div>

        <button
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-2 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-brand-600' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Status'}</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-3xl border border-slate-200 p-6 animate-pulse space-y-4">
              <div className="h-6 bg-slate-200 rounded w-1/3" />
              <div className="h-20 bg-slate-100 rounded-xl" />
              <div className="h-10 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Orders Placed Yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Add farm produce and groceries to your cart to experience our instant 15-minute simulated delivery!
            </p>
          </div>
          <button
            onClick={() => setActivePage('home')}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Start Browsing Groceries
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStepIdx = getStepIndex(order.orderStatus);
            const isExpanded = expandedOrder === order._id;
            const isTracking = activeTrackingOrderId === order._id;
            const timings = getRealTimeOrderTimings(order, liveClock);

            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 hover:border-slate-300"
              >
                {/* Order Top Bar */}
                <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-600">
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                      <StatusBadge status={order.orderStatus} />
                      <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Store className="w-3 h-3 text-amber-600" />
                        <span>Store: {order.shopName || 'FreshCart Central Store'}</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500 font-medium">
                      <span>Placed: {timings.placed}</span>
                      <span>&bull;</span>
                      {order.orderStatus === 'Delivered' ? (
                        <span
                          className={`font-bold flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs shadow-xs ${
                            timings.isEarly
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : timings.isLate
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            {timings.isEarly
                              ? `Delivered Early at ${timings.delivered} (${timings.comparisonText})`
                              : timings.isLate
                              ? `Delivered at ${timings.delivered} (${timings.comparisonText})`
                              : `Delivered on time at ${timings.delivered}`}
                          </span>
                        </span>
                      ) : (
                        <span
                          className={`font-bold flex items-center gap-1.5 text-xs ${
                            timings.isDelayed
                              ? 'text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200'
                              : 'text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200'
                          }`}
                        >
                          <Clock className={`w-3.5 h-3.5 ${timings.isDelayed ? 'text-amber-600' : 'text-brand-600'}`} />
                          <span>
                            {timings.isDelayed
                              ? `Updated Real-Time ETA: ~${timings.estimatedArrival} (${timings.delayNotice})`
                              : `Estimated Arrival: ~${timings.estimatedArrival} (${timings.remainingMins} mins)`}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Total Paid</span>
                      <span className="text-lg font-black text-slate-900">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>

                    {/* Toggle Live Tracking Map */}
                    <button
                      onClick={() => setActiveTrackingOrderId(isTracking ? null : order._id)}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
                        isTracking
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-500/20'
                          : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      <Map className="w-3.5 h-3.5" />
                      <span>{isTracking ? 'Hide Map' : 'Track on Map'}</span>
                    </button>

                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                      className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Real-Time Live GPS Radar Tracker (If Active) */}
                {isTracking && (
                  <div className="p-4 sm:p-6 bg-slate-950 border-b border-slate-800">
                    <LiveTrackingMap
                      order={order}
                      timings={timings}
                      onClose={() => setActiveTrackingOrderId(null)}
                    />
                  </div>
                )}

                {/* 4-Step Dynamic Visual Tracker with Exact Timings */}
                <div className="p-6 border-b border-slate-100 bg-white">
                  <div className="relative">
                    {/* Connecting Bar */}
                    <div className="hidden sm:block absolute top-6 left-12 right-12 h-1 bg-slate-200 z-0">
                      <div
                        className="bg-brand-500 h-full transition-all duration-700 ease-out"
                        style={{
                          width: `${Math.max(0, Math.min(100, (currentStepIdx / 3) * 100))}%`,
                        }}
                      />
                    </div>

                    {/* Step Nodes */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-2 relative z-10">
                      {STATUS_STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const isCompleted = currentStepIdx >= idx;
                        const isCurrent = currentStepIdx === idx;
                        const stepTime = timings[step.timingKey];

                        return (
                          <div
                            key={step.key}
                            className={`flex sm:flex-col items-center gap-3 sm:gap-2 text-left sm:text-center p-2 rounded-xl transition ${
                              isCurrent ? 'bg-brand-50/70 sm:bg-transparent' : ''
                            }`}
                          >
                            <div
                              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-xs shrink-0 ${
                                isCompleted
                                  ? 'bg-brand-600 text-white shadow-brand-500/25 ring-4 ring-brand-100'
                                  : 'bg-slate-100 text-slate-400 border border-slate-200'
                              } ${isCurrent ? 'scale-110' : ''}`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>

                            <div>
                              <p
                                className={`text-xs font-bold leading-tight ${
                                  isCompleted ? 'text-slate-900' : 'text-slate-400'
                                }`}
                              >
                                {step.label}
                              </p>

                              {/* Real-time Dynamic Timestamp */}
                              <p
                                className={`text-[11px] font-mono mt-0.5 ${
                                  isCompleted
                                    ? 'text-emerald-700 font-bold'
                                    : 'text-slate-400 font-medium'
                                }`}
                              >
                                {isCompleted
                                  ? step.key === 'Delivered' && timings.isEarly
                                    ? `✓ Early at ${stepTime}`
                                    : `✓ ${stepTime}`
                                  : `Est: ${stepTime}`}
                              </p>

                              <p className="text-[10px] text-slate-400 hidden sm:block mt-0.5">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Delivered Completion Summary Banner */}
                  {order.orderStatus === 'Delivered' && (
                    <div className={`mt-5 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs border ${
                      timings.isEarly
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : timings.isLate
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}>
                      <div className="flex items-center gap-2 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{timings.bannerText}</span>
                      </div>
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/90 border border-current shadow-2xs">
                        Original Target Was: ~{timings.initialEstDelivery}
                      </span>
                    </div>
                  )}

                  {/* Active Order Prompt / Delivery Banner */}
                  {order.orderStatus !== 'Delivered' && (
                    <div className="mt-5 p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          {order.orderStatus === 'Out for Delivery'
                            ? 'Rider is on the way! Watch real-time movement on the live GPS map above.'
                            : `Order is being processed quickly at ${order.shopName || 'your grocery store hub'}.`}
                        </span>
                      </div>

                      {!isTracking && (
                        <button
                          onClick={() => setActiveTrackingOrderId(order._id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5 shrink-0"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>Open Live Map</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Collapsible Order Details */}
                {isExpanded && (
                  <div className="p-6 bg-slate-50/40 space-y-6 animate-fade-in">
                    {/* Ordered from Store & Destination */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Store Details */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                          <Store className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pickup Store Hub</span>
                        </div>
                        <p className="text-xs font-bold text-slate-900">
                          {order.shopName || 'FreshCart Central Organic Mart'}
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {order.shopAddress || 'Shop #14, Sector 4, Koramangala, Bengaluru'}
                        </p>
                      </div>

                      {/* Destination Address */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                          <MapPin className="w-3.5 h-3.5 text-brand-600" />
                          <span>Delivery Destination</span>
                        </div>
                        <p className="text-xs font-bold text-slate-900">
                          {order.shippingAddress?.fullName}
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {order.shippingAddress?.address}
                          {order.shippingAddress?.landmark ? `, ${order.shippingAddress.landmark}` : ''}
                          <br />
                          Pincode: {order.shippingAddress?.pincode}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          Contact: {order.shippingAddress?.phone}
                        </p>
                      </div>
                    </div>

                    {/* Items Grid */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Ordered Items ({order.items.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {order.items.map((item, i) => (
                          <div
                            key={i}
                            className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center gap-3"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-xl bg-slate-100 shrink-0"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {item.name}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {item.unit} &bull; Qty: {item.quantity}
                              </p>
                            </div>
                            <span className="text-xs font-black text-slate-900">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment Meta */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <CreditCard className="w-3.5 h-3.5 text-brand-600" />
                        <span>Payment Information</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900">
                        Method: {order.paymentMethod}
                      </p>
                      <p className="text-xs text-slate-600">
                        Payment Status:{' '}
                        <span
                          className={`font-bold ${
                            order.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </p>
                      {order.paymentDetails?.transactionId && (
                        <p className="text-[11px] font-mono text-slate-400">
                          Txn ID: {order.paymentDetails.transactionId}
                        </p>
                      )}
                      <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100 flex flex-wrap justify-between gap-2">
                        <span>Items: {formatPrice(order.itemsPrice)}</span>
                        <span>Delivery: {formatPrice(order.deliveryFee)}</span>
                        <span>Tax: {formatPrice(order.taxPrice)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
