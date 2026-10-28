import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Banknote,
  ShieldCheck,
  CheckCircle,
  Loader2,
  Lock,
  Smartphone,
  Scan,
  Barcode,
  Sparkles,
  Timer,
  Check,
} from 'lucide-react';
import { formatPrice } from '../utils/formatters';

const PaymentModal = ({ isOpen, onClose, totalAmount, onPaymentSuccess }) => {
  const [method, setMethod] = useState('UPI'); // 'UPI' | 'Credit Card' | 'Cash on Delivery (COD)'
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [qrTimer, setQrTimer] = useState(300); // 5 min countdown
  const [barcodeScanned, setBarcodeScanned] = useState(false);

  // Form states
  const [upiId, setUpiId] = useState('customer@okaxis');
  const [cardData, setCardData] = useState({
    cardNumber: '4532 8901 2345 6789',
    cardHolder: 'Priya Sharma',
    expiry: '12/28',
    cvv: '892',
  });
  const [cardErrors, setCardErrors] = useState({});

  // Countdown timer for QR / Barcode expiration
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setQrTimer((prev) => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `0${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const validateCard = () => {
    const errs = {};
    if (!cardData.cardNumber || cardData.cardNumber.replace(/\s/g, '').length < 16) {
      errs.cardNumber = 'Valid 16-digit card number required';
    }
    if (!cardData.cardHolder.trim()) {
      errs.cardHolder = 'Cardholder name is required';
    }
    if (!cardData.expiry || !cardData.expiry.includes('/')) {
      errs.expiry = 'MM/YY required';
    }
    if (!cardData.cvv || cardData.cvv.length < 3) {
      errs.cvv = '3-digit CVV required';
    }
    setCardErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSimulatedPayment = (customTxn = null) => {
    if (method === 'Credit Card') {
      if (!validateCard()) return;
    }

    if (method === 'UPI' && !customTxn) {
      if (!upiId || !upiId.includes('@')) {
        alert('Please enter a valid UPI ID (e.g., yourname@bank)');
        return;
      }
    }

    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      setPaymentSuccess(true);

      const paymentDetails = {
        paymentMethod: method,
        paymentStatus: method === 'Cash on Delivery (COD)' ? 'Pending' : 'Paid',
        paymentDetails: {
          transactionId: customTxn || `TXN_${Date.now()}`,
          upiId: method === 'UPI' ? upiId : '',
          cardLast4: method === 'Credit Card' ? cardData.cardNumber.slice(-4) : '',
        },
      };

      setTimeout(() => {
        onPaymentSuccess(paymentDetails);
        setPaymentSuccess(false);
      }, 1500);
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Secure Gateway Payment</h2>
              <p className="text-xs text-slate-400">256-bit Encrypted Real-Time UPI & Card System</p>
            </div>
          </div>
          {!processing && !paymentSuccess && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {paymentSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {method === 'Cash on Delivery (COD)' ? 'Order Confirmed!' : 'Payment Verified & Approved!'}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  {method === 'Cash on Delivery (COD)'
                    ? 'Your cash on delivery order has been placed successfully.'
                    : `Successfully authorized ${formatPrice(totalAmount)} via ${method}.`}
                </p>
              </div>
              <p className="text-xs text-emerald-600 font-bold animate-pulse">
                Order initialized &bull; Directing to Live Map Tracker...
              </p>
            </div>
          ) : processing ? (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">Authorizing Payment in Real Time...</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Verifying bank settlement and generating order token. Please keep this screen open.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Amount Bar */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide block">
                    Total Amount Due
                  </span>
                  <span className="text-[11px] text-emerald-700">Inclusive of all taxes & delivery fees</span>
                </div>
                <span className="text-2xl font-black text-emerald-800">{formatPrice(totalAmount)}</span>
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('UPI')}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                    method === 'UPI'
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 font-bold shadow-xs ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold">QR / UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('Credit Card')}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                    method === 'Credit Card'
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 font-bold shadow-xs ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold">Debit / Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('Cash on Delivery (COD)')}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                    method === 'Cash on Delivery (COD)'
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 font-bold shadow-xs ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold">Cash (COD)</span>
                </button>
              </div>

              {/* TAB 1: REAL-TIME QR CODE + BARCODE PAY */}
              {method === 'UPI' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                      <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <Scan className="w-4 h-4" /> Live Scan & Pay Terminal
                      </span>
                      <span className="font-mono text-slate-300 flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-full text-[11px]">
                        <Timer className="w-3 h-3 text-amber-400" /> {formatTimer(qrTimer)}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                      {/* High-Resolution SVG QR Code */}
                      <div className="bg-white p-3 rounded-2xl shadow-xl flex flex-col items-center justify-center shrink-0">
                        <svg
                          viewBox="0 0 120 120"
                          className="w-28 h-28"
                          shapeRendering="crispEdges"
                        >
                          {/* Background */}
                          <rect width="120" height="120" fill="#ffffff" />

                          {/* Top-Left Corner Finder Square */}
                          <rect x="10" y="10" width="30" height="30" fill="#0f172a" />
                          <rect x="15" y="15" width="20" height="20" fill="#ffffff" />
                          <rect x="20" y="20" width="10" height="10" fill="#0f172a" />

                          {/* Top-Right Corner Finder Square */}
                          <rect x="80" y="10" width="30" height="30" fill="#0f172a" />
                          <rect x="85" y="15" width="20" height="20" fill="#ffffff" />
                          <rect x="90" y="20" width="10" height="10" fill="#0f172a" />

                          {/* Bottom-Left Corner Finder Square */}
                          <rect x="10" y="80" width="30" height="30" fill="#0f172a" />
                          <rect x="15" y="85" width="20" height="20" fill="#ffffff" />
                          <rect x="20" y="90" width="10" height="10" fill="#0f172a" />

                          {/* Alignment Small Square */}
                          <rect x="85" y="85" width="15" height="15" fill="#0f172a" />
                          <rect x="88" y="88" width="9" height="9" fill="#ffffff" />
                          <rect x="91" y="91" width="3" height="3" fill="#0f172a" />

                          {/* Timing Lines */}
                          <line x1="45" y1="25" x2="75" y2="25" stroke="#0f172a" strokeWidth="3" strokeDasharray="3 3" />
                          <line x1="25" y1="45" x2="25" y2="75" stroke="#0f172a" strokeWidth="3" strokeDasharray="3 3" />

                          {/* Data Matrix Bits */}
                          <rect x="48" y="12" width="6" height="6" fill="#0f172a" />
                          <rect x="58" y="12" width="6" height="6" fill="#0f172a" />
                          <rect x="68" y="18" width="6" height="6" fill="#0f172a" />
                          <rect x="48" y="32" width="6" height="6" fill="#0f172a" />
                          <rect x="58" y="32" width="6" height="6" fill="#0f172a" />
                          <rect x="48" y="48" width="6" height="6" fill="#0f172a" />
                          <rect x="60" y="48" width="6" height="6" fill="#0f172a" />
                          <rect x="72" y="48" width="6" height="6" fill="#0f172a" />
                          <rect x="48" y="60" width="6" height="6" fill="#0f172a" />
                          <rect x="66" y="60" width="6" height="6" fill="#0f172a" />
                          <rect x="48" y="72" width="6" height="6" fill="#0f172a" />
                          <rect x="60" y="72" width="6" height="6" fill="#0f172a" />
                          <rect x="72" y="72" width="6" height="6" fill="#0f172a" />
                          <rect x="48" y="86" width="6" height="6" fill="#0f172a" />
                          <rect x="60" y="86" width="6" height="6" fill="#0f172a" />
                          <rect x="72" y="86" width="6" height="6" fill="#0f172a" />
                          <rect x="48" y="100" width="6" height="6" fill="#0f172a" />
                          <rect x="58" y="100" width="6" height="6" fill="#0f172a" />
                          <rect x="68" y="100" width="6" height="6" fill="#0f172a" />
                          <rect x="100" y="48" width="6" height="6" fill="#0f172a" />
                          <rect x="100" y="62" width="6" height="6" fill="#0f172a" />
                          <rect x="12" y="48" width="6" height="6" fill="#0f172a" />
                          <rect x="12" y="62" width="6" height="6" fill="#0f172a" />

                          {/* Center Brand Badge */}
                          <circle cx="60" cy="60" r="11" fill="#10b981" />
                          <text x="60" y="64" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">₹</text>
                        </svg>
                        <span className="text-[10px] font-mono font-bold text-slate-800 mt-1">
                          Scan with Any UPI App
                        </span>
                      </div>

                      {/* Real-Time Barcode Graphic with Laser Scan */}
                      <div className="flex-1 w-full space-y-2 text-center sm:text-left">
                        <div>
                          <p className="text-xs font-bold text-emerald-300">
                            Scan QR or Scan Counter Barcode
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Pay directly using Google Pay, PhonePe, Paytm, or BHIM UPI
                          </p>
                        </div>

                        {/* Code-128 Barcode Simulation */}
                        <div className="bg-white p-2.5 rounded-xl border border-slate-700 relative overflow-hidden group">
                          {/* Animated Red Laser Scan Line */}
                          <div className="absolute inset-x-0 h-0.5 bg-rose-500 shadow-md shadow-rose-500/80 animate-pulse top-1/2 -translate-y-1/2 pointer-events-none" />

                          {/* Barcode SVG Stripes */}
                          <svg viewBox="0 0 200 40" className="w-full h-8" preserveAspectRatio="none">
                            <rect x="0" y="0" width="200" height="40" fill="#ffffff" />
                            {/* Vertical alternating barcode lines */}
                            {[
                              2, 5, 8, 12, 14, 18, 22, 25, 29, 34, 38, 42, 45, 48, 52, 56, 60,
                              65, 68, 72, 77, 82, 85, 89, 93, 98, 102, 106, 110, 115, 118, 122,
                              127, 132, 136, 140, 144, 148, 153, 158, 162, 167, 172, 176, 180,
                              185, 190, 194
                            ].map((xPos, idx) => (
                              <rect
                                key={idx}
                                x={xPos}
                                y="0"
                                width={idx % 3 === 0 ? 3 : idx % 2 === 0 ? 2 : 1}
                                height="40"
                                fill="#0f172a"
                              />
                            ))}
                          </svg>

                          <p className="text-[10px] font-mono font-bold text-slate-800 text-center tracking-widest mt-0.5">
                            FC-PAY-{totalAmount}-{Date.now().toString().slice(-6)}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 justify-center sm:justify-start pt-1">
                          <span className="text-[10px] bg-slate-800 font-bold px-2 py-0.5 rounded text-slate-300">
                            VPA: freshcart@hdfcbank
                          </span>
                          <span className="text-[10px] bg-emerald-950 font-bold px-2 py-0.5 rounded text-emerald-300 border border-emerald-800">
                            Instant Verified
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Instant Scan Simulation Button */}
                    <button
                      type="button"
                      onClick={() => handleSimulatedPayment(`UPI_SCAN_${Date.now()}`)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 active:scale-95"
                    >
                      <Scan className="w-4 h-4" />
                      <span>Simulate Successful Phone QR / Barcode Scan ({formatPrice(totalAmount)})</span>
                    </button>
                  </div>

                  {/* Manual UPI ID Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Or Pay via Virtual Payment Address (UPI ID)
                    </label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@bank"
                        className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                      {upiId && (
                        <button
                          type="button"
                          onClick={() => setUpiId('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                          title="Clear field"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CREDIT / DEBIT CARD */}
              {method === 'Credit Card' && (
                <div className="space-y-3 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Card Number</label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={cardData.cardNumber}
                        onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                        placeholder="4532 8901 2345 6789"
                        maxLength={19}
                        className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                      {cardData.cardNumber && (
                        <button
                          type="button"
                          onClick={() => setCardData({ ...cardData, cardNumber: '' })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {cardErrors.cardNumber && (
                      <p className="text-xs text-rose-500 mt-0.5">{cardErrors.cardNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardData.cardHolder}
                      onChange={(e) => setCardData({ ...cardData, cardHolder: e.target.value })}
                      placeholder="Priya Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                    {cardErrors.cardHolder && (
                      <p className="text-xs text-rose-500 mt-0.5">{cardErrors.cardHolder}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                      {cardErrors.expiry && (
                        <p className="text-xs text-rose-500 mt-0.5">{cardErrors.expiry}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">CVV / CVC</label>
                      <input
                        type="password"
                        value={cardData.cvv}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                        placeholder="•••"
                        maxLength={4}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                      {cardErrors.cvv && (
                        <p className="text-xs text-rose-500 mt-0.5">{cardErrors.cvv}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CASH ON DELIVERY */}
              {method === 'Cash on Delivery (COD)' && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs space-y-2 animate-fade-in">
                  <p className="font-bold flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-amber-700" /> Doorstep Cash Settlement
                  </p>
                  <p className="leading-relaxed text-amber-800">
                    Please keep exact cash amount of <strong>{formatPrice(totalAmount)}</strong> ready upon delivery arrival. Our partner also accepts UPI QR scans at your door.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulatedPayment()}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-black transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {method === 'Cash on Delivery (COD)'
                      ? 'Confirm COD Order'
                      : `Pay ${formatPrice(totalAmount)}`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
