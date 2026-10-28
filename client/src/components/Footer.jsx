import React from 'react';
import { ShoppingBag, ShieldCheck, Zap, HeartHandshake, PhoneCall } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 pt-12 pb-8 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Props */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-10 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">15-Minute Delivery</h4>
              <p className="text-xs text-slate-500 mt-0.5">Sourced from hyper-local fulfillment micro-warehouses.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Farm Fresh Harvest</h4>
              <p className="text-xs text-slate-500 mt-0.5">Directly connected with regional organic farmers & bakers.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Simulated Safe Checkout</h4>
              <p className="text-xs text-slate-500 mt-0.5">Mock UPI, Card & Cash on Delivery workflows for prototype testing.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">100% Quality Assured</h4>
              <p className="text-xs text-slate-500 mt-0.5">Instant refund or replacement if you're not delighted.</p>
            </div>
          </div>
        </div>

        {/* Brand Bottom info */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800 text-sm">FreshCart</span>
            <span>&bull; MERN Prototype with Role-Based Access Control</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-600 transition">Customer Portal</span>
            <span className="hover:text-slate-600 transition">Vendor Inventory</span>
            <span className="hover:text-slate-600 transition">Delivery Agent Fleet</span>
          </div>
          <p>&copy; {new Date().getFullYear()} FreshCart Inc. All simulated transactions reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
