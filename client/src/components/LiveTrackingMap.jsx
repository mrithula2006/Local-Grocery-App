import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  Clock,
  BatteryCharging,
  Gauge,
  Sparkles,
  CheckCircle2,
  X,
  MessageSquare,
  AlertCircle,
  Truck,
  Compass,
} from 'lucide-react';

const LiveTrackingMap = ({ order, timings, onClose }) => {
  const isOutForDelivery = order?.orderStatus === 'Out for Delivery';
  const isDelivered = order?.orderStatus === 'Delivered';

  // Rider progress along the route (0 to 100%)
  // Vehicle moves ONLY when Out for Delivery is assigned! Before that (Pending or Packed), vehicle stays parked at store hub (0%).
  const [riderProgress, setRiderProgress] = useState(() => {
    if (isDelivered) return 100;
    if (isOutForDelivery) return 25;
    return 0; // Parked at grocery store hub
  });

  const [isSimulating, setIsSimulating] = useState(true);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [noteSent, setNoteSent] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  // Synchronize vehicle position when orderStatus updates
  useEffect(() => {
    if (isDelivered) {
      setRiderProgress(100);
    } else if (isOutForDelivery) {
      setRiderProgress((prev) => (prev <= 0 ? 15 : prev));
    } else {
      setRiderProgress(0); // Parked at store hub - absolutely no vehicle movement before Out for Delivery!
    }
  }, [order?.orderStatus, isDelivered, isOutForDelivery]);

  // Animate rider along route ONLY if out for delivery!
  useEffect(() => {
    // Before 'Out for Delivery', do NOT move vehicle!
    if (!isSimulating || !isOutForDelivery) return;

    const interval = setInterval(() => {
      setRiderProgress((prev) => {
        if (prev >= 92) return 92; // Near doorstep
        return prev + 1.2;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [isSimulating, isOutForDelivery]);

  // Map coordinates (SVG 800 x 450 coordinate space)
  // Store location: (130, 310)
  // Waypoint 1: (260, 310)
  // Waypoint 2: (260, 180)
  // Waypoint 3: (450, 180)
  // Waypoint 4: (450, 240)
  // Customer location: (660, 240)
  const pathPoints = [
    { x: 130, y: 310 },
    { x: 260, y: 310 },
    { x: 260, y: 170 },
    { x: 460, y: 170 },
    { x: 460, y: 240 },
    { x: 670, y: 240 },
  ];

  // Calculate current rider XY based on riderProgress percentage (0 - 100)
  const calculateRiderPosition = (progress) => {
    const totalSegments = pathPoints.length - 1;
    const clampedProgress = Math.min(100, Math.max(0, progress));
    const segmentIndex = Math.min(
      Math.floor((clampedProgress / 100) * totalSegments),
      totalSegments - 1
    );
    const segmentProgress =
      ((clampedProgress / 100) * totalSegments) - segmentIndex;

    const p1 = pathPoints[segmentIndex];
    const p2 = pathPoints[segmentIndex + 1];

    const currentX = p1.x + (p2.x - p1.x) * segmentProgress;
    const currentY = p1.y + (p2.y - p1.y) * segmentProgress;

    // Angle of vehicle rotation
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);

    return { x: currentX, y: currentY, angle };
  };

  const riderPos = calculateRiderPosition(riderProgress);

  // Dynamic distance & ETA calculation based on progress
  const distanceRemaining = isDelivered
    ? '0.0'
    : !isOutForDelivery
    ? '3.8'
    : Math.max(0.2, ((100 - riderProgress) / 100) * 3.8).toFixed(1);

  const etaMinutesRemaining = isDelivered
    ? 0
    : !isOutForDelivery
    ? (timings?.remainingMins || 15)
    : Math.max(1, Math.round(((100 - riderProgress) / 100) * 12));

  const handleSendNote = (e) => {
    e.preventDefault();
    if (!deliveryNote.trim()) return;
    setNoteSent(true);
    setTimeout(() => {
      setShowNoteModal(false);
      setNoteSent(false);
      setDeliveryNote('');
    }, 1800);
  };

  return (
    <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl relative text-white animate-fade-in my-4">
      {/* Top Map Live Control Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md px-5 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-20 relative">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wide uppercase text-emerald-400">
                Live GPS Radar Track
              </span>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Compass className="w-2.5 h-2.5" /> Satellite Telemetry
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Order #{order?._id?.slice(-6).toUpperCase()} &bull; Real-Time IST: {timings?.liveClock || 'Live'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Estimated Doorstep Countdown */}
          <div className="bg-brand-600/30 border border-brand-500/40 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
            <span className="text-xs font-bold text-brand-200">
              {isDelivered
                ? timings?.isEarly
                  ? `✓ Delivered Early (${timings.comparisonText})`
                  : timings?.isLate
                  ? `✓ Delivered at ${timings.delivered} (${timings.comparisonText})`
                  : `✓ Delivered on time at ${timings?.delivered || 'Doorstep'}`
                : isOutForDelivery
                ? timings?.isDelayed
                  ? `Arriving in ~${etaMinutesRemaining} mins (Updated ETA: ${timings.estimatedArrival})`
                  : `Arriving in ~${etaMinutesRemaining} mins (Est: ${timings?.estimatedArrival || 'Soon'})`
                : order?.orderStatus === 'Packed'
                ? `Items Packed • Vehicle at Hub (Est: ~${timings?.estimatedArrival || 'Soon'})`
                : `Order Placed • Vehicle Parked at Hub (Est: ~${timings?.estimatedArrival || 'Soon'})`}
            </span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Close Map Tracker"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Realistic Vector Map Canvas */}
      <div className="relative w-full h-[320px] sm:h-[400px] bg-[#1e293b] overflow-hidden select-none">
        <svg
          viewBox="0 0 800 450"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Map Grid Pattern */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>

            {/* Glowing route gradient */}
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            {/* Radar Pulse Filter */}
            <radialGradient id="radarPulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Map Terrain */}
          <rect width="800" height="450" fill="#0f172a" />
          <rect width="800" height="450" fill="url(#grid)" />

          {/* City Parks & Water body */}
          <path
            d="M 50,40 Q 140,80 200,30 T 360,50 L 320,130 L 70,110 Z"
            fill="#064e3b"
            opacity="0.45"
          />
          <text x="140" y="85" fill="#34d399" fontSize="10" fontWeight="bold" opacity="0.6">
            🌳 Cubbon City Park
          </text>

          <path
            d="M 520,320 Q 640,300 740,360 L 750,430 L 480,440 Z"
            fill="#0c4a6e"
            opacity="0.5"
          />
          <text x="600" y="380" fill="#38bdf8" fontSize="10" fontWeight="bold" opacity="0.6">
            🌊 Bellandur Lake Zone
          </text>

          {/* City Road Network */}
          {/* Main Avenues (thick gray roads) */}
          <g stroke="#334155" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round">
            <line x1="50" y1="310" x2="750" y2="310" />
            <line x1="260" y1="50" x2="260" y2="400" />
            <line x1="460" y1="50" x2="460" y2="400" />
            <line x1="50" y1="170" x2="750" y2="170" />
            <line x1="460" y1="240" x2="750" y2="240" />
          </g>

          {/* Road White Lane Markings */}
          <g stroke="#475569" strokeWidth="2" strokeDasharray="8 8">
            <line x1="50" y1="310" x2="750" y2="310" />
            <line x1="260" y1="50" x2="260" y2="400" />
            <line x1="460" y1="50" x2="460" y2="400" />
            <line x1="50" y1="170" x2="750" y2="170" />
            <line x1="460" y1="240" x2="750" y2="240" />
          </g>

          {/* Active Navigation Delivery Path (Neon Cyan / Emerald) */}
          <polyline
            points="130,310 260,310 260,170 460,170 460,240 670,240"
            fill="none"
            stroke="#047857"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.5"
          />
          <polyline
            points="130,310 260,310 260,170 460,170 460,240 670,240"
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 4"
            className="animate-pulse"
          />

          {/* Origin: Grocery Store Supermarket Pin */}
          <g transform="translate(130, 310)">
            <circle r="22" fill="#10b981" fillOpacity="0.2" className="animate-ping" />
            <circle r="16" fill="#047857" stroke="#10b981" strokeWidth="2" />
            {/* Store Icon */}
            <path
              d="M -7 -4 L 7 -4 L 6 7 L -6 7 Z M -4 -4 L -4 -7 Q 0 -9 4 -7 L 4 -4"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.8"
            />
            {/* Store Label */}
            <rect x="-75" y="22" width="150" height="20" rx="6" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
            <text x="0" y="36" fill="#ecfdf5" fontSize="8.5" fontWeight="bold" textAnchor="middle">
              {order?.shopName ? `🏪 ${order.shopName.slice(0, 20)}` : '🥬 FreshCart Store Hub'}
            </text>
          </g>

          {/* Destination: Customer Home Pin */}
          <g transform="translate(670, 240)">
            <circle r="24" fill="#38bdf8" fillOpacity="0.25" className="animate-ping" />
            <circle r="17" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
            {/* House Icon */}
            <path
              d="M -7 2 L 0 -5 L 7 2 L 7 7 L -7 7 Z"
              fill="#ffffff"
            />
            {/* Destination Label */}
            <rect x="-65" y="-36" width="130" height="22" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
            <text x="0" y="-22" fill="#e0f2fe" fontSize="9" fontWeight="bold" textAnchor="middle">
              🏠 {order?.shippingAddress?.fullName || 'Your Doorstep'}
            </text>
          </g>

          {/* Dynamic Moving Delivery Partner Scooter Marker */}
          <g transform={`translate(${riderPos.x}, ${riderPos.y})`}>
            {/* Radar Wave Pulse */}
            <circle r="28" fill="url(#radarPulse)" className="animate-ping" />

            {/* Vehicle Card Marker Shadow */}
            <circle r="17" fill="#0f172a" stroke="#10b981" strokeWidth="2.5" />

            {/* Delivery Rider Scooter SVG */}
            <g transform={`rotate(${riderPos.angle}) scale(0.85)`}>
              {/* Scooter Wheels */}
              <circle cx="-8" cy="6" r="3.5" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.5" />
              <circle cx="8" cy="6" r="3.5" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.5" />
              {/* Scooter Body */}
              <path d="M -8 6 L -3 1 L 5 1 L 8 6" stroke="#10b981" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              {/* Handle */}
              <line x1="5" y1="1" x2="4" y2="-5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
              <line x1="2" y1="-5" x2="6" y2="-5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              {/* Helmet Head */}
              <circle cx="-1" cy="-7" r="3.5" fill="#f59e0b" />
            </g>

            {/* Rider Floating HUD Callout */}
            <g transform="translate(0, -28)">
              <rect x="-48" y="-14" width="96" height="18" rx="5" fill="#020617" stroke="#10b981" strokeWidth="1" />
              <text x="0" y="-2" fill="#34d399" fontSize="8" fontWeight="900" textAnchor="middle">
                {isDelivered
                  ? '✓ AT DOORSTEP'
                  : isOutForDelivery
                  ? `⚡ RAMESH (${distanceRemaining} km)`
                  : '🏪 RAMESH (AT STORE)'}
              </text>
            </g>
          </g>
        </svg>

        {/* Floating Telemetry HUD Chips on Top of Map */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg flex items-center gap-2 text-xs">
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-slate-200">
              {isDelivered
                ? '0 km/h • Handed Over'
                : isOutForDelivery
                ? '28 km/h • EV Mode'
                : '0 km/h • Parked at Store Hub'}
            </span>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg flex items-center gap-2 text-xs">
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-slate-200">
              {isOutForDelivery ? '86% Battery' : '100% Fully Charged'}
            </span>
          </div>
        </div>

        {/* Live Delivery Progress Floating Pill */}
        <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-700/80 shadow-xl flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-semibold">Distance to Drop</p>
            <p className="text-xs font-black text-white">{distanceRemaining} km remaining</p>
          </div>
          <div className="h-6 w-px bg-slate-700" />
          {isOutForDelivery ? (
            <button
              onClick={() => setRiderProgress((p) => Math.min(95, p + 10))}
              className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 underline"
              title="Fast forward simulation"
            >
              Advance Rider &rarr;
            </button>
          ) : (
            <span className="text-[10px] font-bold text-slate-400">
              {isDelivered ? '✓ Delivered' : 'Vehicle Parked at Store'}
            </span>
          )}
        </div>
      </div>

      {/* Live Delivery Partner Executive Card */}
      <div className="p-5 sm:p-6 bg-slate-800/95 border-t border-slate-700/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Driver Avatar & Meta */}
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                alt="Delivery Partner"
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover ring-2 ring-emerald-500 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full ring-2 ring-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-extrabold text-white">
                  Ramesh Kumar
                </h4>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ★ 4.9 (1,480+ Trips)
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                FreshCart Top Fleet Partner &bull; <span className="text-emerald-400">Vaccinated</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                <Truck className="w-3 h-3 text-slate-400" />
                <span>Vehicle: Ather 450X EV (KA 05 EV 8892)</span>
              </p>
            </div>
          </div>

          {/* Quick Contact & Action Buttons */}
          <div className="flex items-center gap-2.5 sm:self-center">
            <a
              href="tel:+919876543210"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95"
            >
              <Phone className="w-4 h-4" />
              <span>Call Partner</span>
            </a>

            <button
              onClick={() => setShowNoteModal(true)}
              className="px-3.5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2 border border-slate-600"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Drop Note</span>
            </button>
          </div>
        </div>

        {/* Live Delivery Stage Alert Banner */}
        <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-700/60 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-slate-300">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {timings?.statusText ||
                'Partner has picked up your grocery basket and is approaching your area.'}
            </span>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 block">Destination</span>
            <span className="text-xs font-bold text-white">
              {order?.shippingAddress?.landmark || order?.shippingAddress?.address?.slice(0, 18) || 'Home'}
            </span>
          </div>
        </div>
      </div>

      {/* Modal for Drop Note / Delivery Instructions */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-3xl max-w-sm w-full p-6 border border-slate-700 shadow-2xl space-y-4 animate-fade-in text-white">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Delivery Instructions for Ramesh</span>
              </h4>
              <button
                onClick={() => setShowNoteModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {noteSent ? (
              <div className="p-4 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-2xl text-xs text-center font-bold">
                ✓ Instruction transmitted to delivery partner!
              </div>
            ) : (
              <form onSubmit={handleSendNote} className="space-y-3">
                <p className="text-xs text-slate-400">
                  Provide special instructions (e.g. "Leave with society security guard", "Don't ring bell, baby sleeping").
                </p>

                <textarea
                  rows="3"
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="e.g. Please call when near gate 2..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNoteModal(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
                  >
                    Send to Partner
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTrackingMap;
