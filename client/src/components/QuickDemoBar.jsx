import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../services/api';
import { UserCheck, ShieldCheck, Truck, RefreshCw, Sparkles } from 'lucide-react';

const QuickDemoBar = ({ onReseedSuccess }) => {
  const { user, quickLogin, logout } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  const handleQuickLogin = async (role) => {
    await quickLogin(role);
  };

  const handleReseed = async () => {
    if (confirm('Reseed database to default fresh inventory and demo accounts?')) {
      try {
        setSeeding(true);
        const res = await orderApi.reseed();
        setSeedMessage('Database reseeded successfully!');
        if (onReseedSuccess) onReseedSuccess();
        setTimeout(() => setSeedMessage(''), 3000);
      } catch (err) {
        alert('Failed to reseed: ' + err.message);
      } finally {
        setSeeding(false);
      }
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 text-xs py-2 px-4 shadow-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-semibold text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            Quick Demo Switcher:
          </span>
          <span className="text-slate-400 hidden sm:inline">1-Click role test</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleQuickLogin('customer')}
            className={`px-2.5 py-1 rounded transition flex items-center gap-1.5 ${
              user?.role === 'customer'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
            title="Login as Priya (Customer)"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Customer</span>
          </button>

          <button
            onClick={() => handleQuickLogin('admin')}
            className={`px-2.5 py-1 rounded transition flex items-center gap-1.5 ${
              user?.role === 'admin'
                ? 'bg-amber-600 text-white font-semibold shadow-sm'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
            title="Login as Vendor Admin (Manage inventory & orders)"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Vendor / Admin</span>
          </button>

          <button
            onClick={() => handleQuickLogin('delivery')}
            className={`px-2.5 py-1 rounded transition flex items-center gap-1.5 ${
              user?.role === 'delivery'
                ? 'bg-purple-600 text-white font-semibold shadow-sm'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
            title="Login as Delivery Agent (Fulfill & update delivery status)"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Delivery Agent</span>
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

          <button
            onClick={handleReseed}
            disabled={seeding}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5"
            title="Reset sample products and demo records"
          >
            <RefreshCw className={`w-3 h-3 ${seeding ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{seeding ? 'Resetting...' : 'Reset Data'}</span>
          </button>

          {user && (
            <button
              onClick={logout}
              className="text-slate-400 hover:text-rose-400 underline ml-1"
            >
              Sign Out
            </button>
          )}

          {seedMessage && (
            <span className="text-emerald-400 font-medium ml-2 animate-fade-in">{seedMessage}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickDemoBar;
