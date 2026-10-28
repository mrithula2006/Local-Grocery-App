import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Key,
  CheckCircle2,
} from 'lucide-react';

const Login = ({ setActivePage }) => {
  const { login, authError, setAuthError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setAuthError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setValidationError('Please enter your email address.');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      setValidationError('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }

    if (!password) {
      setValidationError('Please enter your password.');
      return;
    }

    setLoading(true);
    const result = await login(trimmedEmail, password);
    setLoading(false);

    if (result?.success) {
      if (result.user.role === 'admin') setActivePage('admin');
      else if (result.user.role === 'delivery') setActivePage('delivery');
      else setActivePage('home');
    }
  };

  const handleUseCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setValidationError('');
    setAuthError(null);
  };

  return (
    <div className="max-w-md mx-auto my-8 space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-brand-500/25">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Sign In to FreshCart</h1>
        <p className="text-xs text-slate-500">
          Sign in to access your Customer, Vendor, or Delivery Partner dashboard
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        {/* Error message */}
        {(validationError || authError) && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{validationError || authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@freshcart.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-extrabold rounded-xl transition shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Prototype Test Accounts Reference */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5 justify-center">
            <Key className="w-3.5 h-3.5 text-brand-600" />
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Prototype Test Accounts
            </p>
          </div>
          <p className="text-[10px] text-slate-400 text-center">
            Click to fill credentials and test different role dashboards
          </p>

          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => handleUseCredentials('customer@freshcart.com', 'password123')}
              className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-left text-xs transition flex items-center justify-between group"
            >
              <div>
                <span className="font-bold text-emerald-800 block">Customer Role:</span>
                <span className="text-[11px] text-slate-500">customer@freshcart.com</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 group-hover:underline">
                Use Credential &rarr;
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleUseCredentials('admin@freshcart.com', 'password123')}
              className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 text-left text-xs transition flex items-center justify-between group"
            >
              <div>
                <span className="font-bold text-amber-800 block">Vendor / Admin Role:</span>
                <span className="text-[11px] text-slate-500">admin@freshcart.com</span>
              </div>
              <span className="text-[10px] font-semibold text-amber-600 group-hover:underline">
                Use Credential &rarr;
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleUseCredentials('delivery@freshcart.com', 'password123')}
              className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 text-left text-xs transition flex items-center justify-between group"
            >
              <div>
                <span className="font-bold text-purple-800 block">Delivery Partner Role:</span>
                <span className="text-[11px] text-slate-500">delivery@freshcart.com</span>
              </div>
              <span className="text-[10px] font-semibold text-purple-600 group-hover:underline">
                Use Credential &rarr;
              </span>
            </button>
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <button
              onClick={() => setActivePage('signup')}
              className="text-brand-600 font-bold hover:underline"
            >
              Create New Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
