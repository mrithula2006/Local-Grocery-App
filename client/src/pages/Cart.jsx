import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../services/api';
import { formatPrice } from '../utils/formatters';
import PaymentModal from '../components/PaymentModal';
import { getSelectedShop } from '../services/shopManager';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  MapPin,
  ShieldCheck,
  Truck,
  Sparkles,
  AlertCircle,
  Store,
  AlertTriangle,
} from 'lucide-react';

const Cart = ({ setActivePage }) => {
  const { items, updateQuantity, removeFromCart, clearCart, itemsPrice, deliveryFee, taxPrice, totalAmount } = useCart();
  const { user, isAuthenticated, quickLogin } = useAuth();
  const [selectedShop, setSelectedShop] = useState(getSelectedShop);

  const [address, setAddress] = useState({
    fullName: user?.name || 'Priya Sharma',
    phone: user?.phone || '+91 98765 43210',
    address: user?.address || 'Flat 402, Green Valley Apts, Indiranagar',
    landmark: 'Near Indiranagar Metro Station',
    pincode: '560038',
  });

  const [addressErrors, setAddressErrors] = useState({});
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);

  const freeDeliveryThreshold = 500;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - itemsPrice);
  const freeDeliveryProgress = Math.min(100, Math.round((itemsPrice / freeDeliveryThreshold) * 100));

  const validateAddress = () => {
    const errs = {};
    if (!address.fullName.trim()) errs.fullName = 'Full name is required';
    if (!address.phone.trim() || address.phone.length < 8) errs.phone = 'Valid phone number required';
    if (!address.address.trim()) errs.address = 'Street address is required';
    if (!address.pincode.trim() || address.pincode.length < 4) errs.pincode = 'Pincode is required';
    setAddressErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceedToPayment = () => {
    setOrderError(null);
    if (!validateAddress()) return;

    if (!isAuthenticated) {
      if (confirm('You need to be signed in to place an order. Sign in as Demo Customer now?')) {
        quickLogin('customer').then(() => {
          setIsPaymentModalOpen(true);
        });
      }
      return;
    }

    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (paymentInfo) => {
    try {
      setPlacingOrder(true);
      setOrderError(null);

      const orderPayload = {
        items: items.map((i) => ({
          product: i.product,
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
        })),
        shippingAddress: address,
        paymentMethod: paymentInfo.paymentMethod,
        paymentDetails: paymentInfo.paymentDetails,
        shopName: selectedShop?.shopName || 'FreshCart Central Organic Mart',
        shopAddress: selectedShop?.address || 'Shop #14, Sector 4, Koramangala, Bengaluru',
      };

      const res = await orderApi.createOrder(orderPayload);
      if (res.success) {
        clearCart();
        setIsPaymentModalOpen(false);
        setActivePage('orders');
      }
    } catch (err) {
      setOrderError(err.message || 'Failed to place order');
      setIsPaymentModalOpen(false);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-5 shadow-sm my-8 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900">Your Basket is Empty</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Explore fresh vegetables, dairy products, bakery breads, and everyday essentials.
          </p>
        </div>
        <button
          onClick={() => setActivePage('home')}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-2xl transition shadow-lg shadow-brand-500/25 flex items-center gap-2 mx-auto"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-1">Review items, set delivery address, and proceed to simulated checkout</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 p-2 rounded-lg hover:bg-rose-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      {orderError && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-xs text-rose-800 flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{orderError}</span>
        </div>
      )}

      {/* Free Delivery Goal Bar */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs">
        <div className="flex items-center justify-between mb-1.5 font-bold">
          <span className="text-emerald-900 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-emerald-700" />
            {remainingForFreeDelivery === 0
              ? '🎉 You unlocked FREE Delivery!'
              : `Add ${formatPrice(remainingForFreeDelivery)} more for FREE Delivery!`}
          </span>
          <span className="text-emerald-700">{freeDeliveryProgress}%</span>
        </div>
        <div className="w-full bg-emerald-200/80 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${freeDeliveryProgress}%` }}
          />
        </div>
      </div>

      {/* Grid: Left Items + Address, Right Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart Items List */}
          <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
            {items.map((item) => (
              <div key={item.product} className="p-4 sm:p-5 flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-2xl bg-slate-50 border border-slate-100 shrink-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';
                  }}
                />

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{item.unit}</p>
                  <p className="text-xs font-extrabold text-brand-700 mt-1">
                    {formatPrice(item.price)} each
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5">
                    <button
                      onClick={() => updateQuantity(item.product, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-slate-700 hover:bg-slate-100 transition shadow-xs"
                      title="Decrease"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-black text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 transition shadow-xs"
                      title="Increase"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[70px]">
                    <span className="text-sm sm:text-base font-black text-slate-900">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Address Form Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600" />
                <span>Delivery Address</span>
              </h2>
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() =>
                    setAddress({
                      fullName: user.name || '',
                      phone: user.phone || '+91 98765 43210',
                      address: user.address || 'Flat 402, Green Valley Apts, Indiranagar',
                      landmark: 'Opposite Metro Station',
                      pincode: '560038',
                    })
                  }
                  className="text-xs font-bold text-brand-600 hover:underline"
                >
                  Autofill Profile Address
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Name *</label>
                <input
                  type="text"
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {addressErrors.fullName && (
                  <p className="text-[11px] text-rose-500 mt-0.5">{addressErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone *</label>
                <input
                  type="text"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {addressErrors.phone && (
                  <p className="text-[11px] text-rose-500 mt-0.5">{addressErrors.phone}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Street Address & House / Flat No. *
                </label>
                <input
                  type="text"
                  value={address.address}
                  onChange={(e) => setAddress({ ...address, address: e.target.value })}
                  placeholder="Flat 402, Green Valley Apartments, 12th Main Road"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {addressErrors.address && (
                  <p className="text-[11px] text-rose-500 mt-0.5">{addressErrors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  value={address.landmark}
                  onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                  placeholder="Near Metro Station"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  placeholder="560038"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {addressErrors.pincode && (
                  <p className="text-[11px] text-rose-500 mt-0.5">{addressErrors.pincode}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5 sticky top-24">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              Bill Details
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900">{formatPrice(itemsPrice)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  <span>Delivery Partner Fee</span>
                  {deliveryFee === 0 && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      FREE
                    </span>
                  )}
                </span>
                <span className="font-bold text-slate-900">
                  {deliveryFee === 0 ? '₹0' : formatPrice(deliveryFee)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Taxes & Bag Charge (5%)</span>
                <span className="font-bold text-slate-900">{formatPrice(taxPrice)}</span>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                <div>
                  <span className="text-base font-black text-slate-900">To Pay</span>
                  <p className="text-[11px] text-slate-400">Inclusive of all taxes</p>
                </div>
                <span className="text-2xl font-black text-brand-700">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>

            {!selectedShop?.isOpen && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Store is Closed: {selectedShop?.shopName} is not taking orders right now.</span>
              </div>
            )}

            <button
              onClick={handleProceedToPayment}
              disabled={placingOrder || !selectedShop?.isOpen}
              className={`w-full py-3.5 text-white text-sm font-extrabold rounded-2xl transition shadow-lg flex items-center justify-center gap-2 group ${
                !selectedShop?.isOpen
                  ? 'bg-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/25'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span>{!selectedShop?.isOpen ? 'Store is Currently Closed' : 'Proceed to Checkout'}</span>
              {selectedShop?.isOpen && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>

            <div className="text-[11px] text-slate-500 text-center space-y-1 pt-1">
              <p className="flex items-center justify-center gap-1 font-semibold text-emerald-700">
                <Sparkles className="w-3.5 h-3.5" />
                Guaranteed 15-Minute Hyper-Local Handover
              </p>
              <p>Simulated payments via UPI, Cards, or Cash on Delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={totalAmount}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Cart;
