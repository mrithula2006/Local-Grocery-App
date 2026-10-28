import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  ArrowRight,
  AlertCircle,
  Shield,
  Truck,
  CheckCircle,
  X,
} from 'lucide-react';

const Signup = ({ setActivePage }) => {
  const { register, authError, setAuthError } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    phone: '',
    address: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Real-time phone handler with strict digit enforcement
  const handlePhoneChange = (e) => {
    const rawVal = e.target.value;

    // Check if user entered letters
    if (/[a-zA-Z]/.test(rawVal)) {
      setValidationErrors((prev) => ({
        ...prev,
        phone: 'Letters are strictly not allowed in phone number.',
      }));
    } else {
      setValidationErrors((prev) => ({
        ...prev,
        phone: '',
      }));
    }

    // Keep only numbers and max 10 digits
    const digitsOnly = rawVal.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, phone: digitsOnly });
  };

  const validateForm = () => {
    const errors = {};

    // 1. Full name validation: letters and spaces only
    if (!formData.name.trim()) {
      errors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters.';
    } else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) {
      errors.name = 'Full name can only contain letters and spaces (no numbers or symbols).';
    }

    // 2. Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email format (e.g. name@domain.com).';
    }

    // 3. Password validation
    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    // 4. Phone validation: strictly 10 digits, no letters
    if (!formData.phone) {
      errors.phone = 'Phone number is required.';
    } else if (formData.phone.length !== 10) {
      errors.phone = `Phone number must be exactly 10 digits (currently ${formData.phone.length}/10).`;
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setLoading(true);

    const result = await register({
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
    });

    setLoading(false);

    if (result?.success) {
      // Redirect to the appropriate dashboard
      if (result.user.role === 'admin') setActivePage('admin');
      else if (result.user.role === 'delivery') setActivePage('delivery');
      else setActivePage('home');
    }
  };

  return (
    <div className="max-w-lg mx-auto my-6 space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-brand-500/25">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Create Your Account</h1>
        <p className="text-xs text-slate-500">
          Sign up with verified details to access Customer, Vendor, or Delivery portals
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        {authError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Your Role *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'customer' })}
                className={`py-2.5 px-2 rounded-xl border text-center text-xs font-bold transition flex flex-col items-center gap-1.5 ${
                  formData.role === 'customer'
                    ? 'border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-500/20 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span>Customer</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'admin' })}
                className={`py-2.5 px-2 rounded-xl border text-center text-xs font-bold transition flex flex-col items-center gap-1.5 ${
                  formData.role === 'admin'
                    ? 'border-amber-600 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Vendor / Shop</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'delivery' })}
                className={`py-2.5 px-2 rounded-xl border text-center text-xs font-bold transition flex flex-col items-center gap-1.5 ${
                  formData.role === 'delivery'
                    ? 'border-purple-600 bg-purple-50 text-purple-800 ring-2 ring-purple-500/20 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Truck className="w-4 h-4 text-purple-600" />
                <span>Delivery Partner</span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Full Name * (Letters only)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (validationErrors.name) {
                    setValidationErrors({ ...validationErrors, name: '' });
                  }
                }}
                placeholder="Ramesh Kumar"
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 ${
                  validationErrors.name
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-500'
                    : 'border-slate-200 focus:ring-brand-500'
                }`}
              />
            </div>
            {validationErrors.name && (
              <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.name}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address * (Valid format required)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (validationErrors.email) {
                    setValidationErrors({ ...validationErrors, email: '' });
                  }
                }}
                placeholder="ramesh@example.com"
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 ${
                  validationErrors.email
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-500'
                    : 'border-slate-200 focus:ring-brand-500'
                }`}
              />
            </div>
            {validationErrors.email && (
              <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password * (Min 6 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (validationErrors.password) {
                    setValidationErrors({ ...validationErrors, password: '' });
                  }
                }}
                placeholder="••••••••"
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 ${
                  validationErrors.password
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-500'
                    : 'border-slate-200 focus:ring-brand-500'
                }`}
              />
            </div>
            {validationErrors.password && (
              <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.password}
              </p>
            )}
          </div>

          {/* Phone Number with Strict 10-Digit & No-Letters Validation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Mobile Number * (10 Digits Only, No Letters)
              </label>
              <span
                className={`text-[10px] font-mono font-bold ${
                  formData.phone.length === 10 ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                {formData.phone.length}/10 digits
              </span>
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-500 text-xs font-bold border-r border-slate-200 pr-2 pointer-events-none">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>+91</span>
              </div>
              <input
                type="text"
                value={formData.phone}
                onChange={handlePhoneChange}
                maxLength="10"
                placeholder="9876543210"
                className={`w-full pl-20 pr-9 py-2.5 rounded-xl border text-xs sm:text-sm font-mono font-semibold focus:outline-none focus:ring-2 ${
                  validationErrors.phone
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-500 text-rose-900'
                    : formData.phone.length === 10
                    ? 'border-emerald-400 bg-emerald-50/20 focus:ring-emerald-500 text-slate-900'
                    : 'border-slate-200 focus:ring-brand-500'
                }`}
              />
              {formData.phone && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, phone: '' })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  title="Clear phone field"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {validationErrors.phone && (
              <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.phone}
              </p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Address / Operational Area
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Flat 402, Green Glen Layout, Bengaluru"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-extrabold rounded-xl transition shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
          >
            <span>{loading ? 'Validating & Creating Account...' : 'Complete Sign Up'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Already registered?{' '}
            <button
              onClick={() => setActivePage('login')}
              className="text-brand-600 font-bold hover:underline"
            >
              Sign In Instead
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
