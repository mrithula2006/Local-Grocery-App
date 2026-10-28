import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag,
  ShoppingCart,
  User,
  LogOut,
  Package,
  Shield,
  Truck,
  Menu,
  X,
  ChevronDown,
  Store,
  Bike,
} from 'lucide-react';

const Navbar = ({ activePage, setActivePage }) => {
  const { user, logout, isAuthenticated, isAdmin, isDelivery, isCustomer } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNavClick = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const handleLogoClick = () => {
    if (!isAuthenticated) {
      setActivePage('login');
    } else if (isAdmin) {
      setActivePage('admin');
    } else if (isDelivery) {
      setActivePage('delivery');
    } else {
      setActivePage('home');
    }
    setMobileMenuOpen(false);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 uppercase tracking-wide">Vendor/Admin</span>;
      case 'delivery':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200 uppercase tracking-wide">Delivery Partner</span>;
      default:
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wide">Customer</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-brand-800 to-brand-600 bg-clip-text text-transparent">
                FreshCart
              </span>
              <span className="block text-[10px] font-semibold text-brand-600 uppercase tracking-wider">
                {isAdmin ? 'Vendor Operations' : isDelivery ? 'Fleet Operations' : 'Local Groceries &bull; 15 Min'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {/* ONLY Customers or Unauthenticated see Browse Catalog */}
            {(!isAuthenticated || isCustomer) && (
              <button
                onClick={() => handleNavClick('home')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  activePage === 'home'
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Browse Catalog
              </button>
            )}

            {/* Customer Orders */}
            {isAuthenticated && isCustomer && (
              <button
                onClick={() => handleNavClick('orders')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                  activePage === 'orders'
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>My Orders & Live Map</span>
              </button>
            )}

            {/* Vendor / Admin Nav Links */}
            {isAdmin && (
              <>
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                    activePage === 'admin'
                      ? 'bg-amber-50 text-amber-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span>Vendor Dashboard</span>
                </button>

                <button
                  onClick={() => handleNavClick('admin-shop')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                    activePage === 'admin-shop'
                      ? 'bg-amber-100/80 text-amber-900 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  title="Register & Manage Shop"
                >
                  <Store className="w-4 h-4 text-amber-600" />
                  <span>Register My Shop</span>
                </button>
              </>
            )}

            {/* Delivery Partner Nav Links */}
            {isDelivery && (
              <>
                <button
                  onClick={() => handleNavClick('delivery')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                    activePage === 'delivery'
                      ? 'bg-purple-50 text-purple-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Truck className="w-4 h-4 text-purple-600" />
                  <span>Delivery Partner Hub</span>
                </button>

                <button
                  onClick={() => handleNavClick('delivery-rides')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                    activePage === 'delivery-rides'
                      ? 'bg-purple-100/80 text-purple-900 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  title="Register Vehicle & Rides"
                >
                  <Bike className="w-4 h-4 text-purple-600" />
                  <span>Register Rides</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Actions: Cart & Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cart Button ONLY for Customer or Unauthenticated */}
            {(!isAuthenticated || isCustomer) && (
              <button
                onClick={() => handleNavClick('cart')}
                className={`relative px-3.5 py-2 rounded-xl border flex items-center gap-2 text-sm font-bold transition shadow-sm ${
                  activePage === 'cart'
                    ? 'bg-brand-600 text-white border-brand-600 shadow-brand-500/25'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-brand-500 hover:text-brand-700'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Cart</span>
                {totalItems > 0 && (
                  <span className="bg-brand-500 text-white text-xs font-extrabold px-2 py-0.5 rounded-full ml-0.5 animate-pulse">
                    {totalItems}
                  </span>
                )}
              </button>
            )}

            {/* User Profile or Login */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <div className="text-left hidden lg:block pr-1">
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{user?.name}</p>
                    {getRoleBadge(user?.role)}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-fade-in z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-500">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user?.email}</p>
                      <div className="mt-1">{getRoleBadge(user?.role)}</div>
                    </div>

                    {isCustomer && (
                      <button
                        onClick={() => handleNavClick('orders')}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        My Orders & Live Map
                      </button>
                    )}

                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleNavClick('admin')}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Shield className="w-4 h-4 text-amber-500" />
                          Vendor Inventory & Orders
                        </button>
                        <button
                          onClick={() => handleNavClick('admin')}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Store className="w-4 h-4 text-amber-500" />
                          Register My Shop
                        </button>
                      </>
                    )}

                    {isDelivery && (
                      <>
                        <button
                          onClick={() => handleNavClick('delivery')}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Truck className="w-4 h-4 text-purple-500" />
                          Delivery Orders Hub
                        </button>
                        <button
                          onClick={() => handleNavClick('delivery')}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Bike className="w-4 h-4 text-purple-500" />
                          Register Rides
                        </button>
                      </>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        setActivePage('login');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="px-3 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('signup')}
                  className="px-4 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-sm shadow-brand-500/20"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Actions: Cart + Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            {(!isAuthenticated || isCustomer) && (
              <button
                onClick={() => handleNavClick('cart')}
                className="relative p-2 rounded-xl bg-slate-100 text-slate-800"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {isAuthenticated && (
            <div className="p-3 bg-slate-50 rounded-xl mb-3">
              <p className="text-sm font-bold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <div className="mt-1">{getRoleBadge(user?.role)}</div>
            </div>
          )}

          {/* ONLY show Browse Catalog to Customer or Unauthenticated */}
          {(!isAuthenticated || isCustomer) && (
            <button
              onClick={() => handleNavClick('home')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Browse Catalog
            </button>
          )}

          {isAuthenticated && isCustomer && (
            <button
              onClick={() => handleNavClick('orders')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2"
            >
              <Package className="w-4 h-4 text-slate-400" />
              My Orders & Live Map
            </button>
          )}

          {isAdmin && (
            <>
              <button
                onClick={() => handleNavClick('admin')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                  activePage === 'admin' ? 'text-amber-800 bg-amber-50' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-600" />
                Vendor Dashboard
              </button>
              <button
                onClick={() => handleNavClick('admin-shop')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                  activePage === 'admin-shop' ? 'text-amber-800 bg-amber-100 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Store className="w-4 h-4 text-amber-600" />
                Register My Shop
              </button>
            </>
          )}

          {isDelivery && (
            <>
              <button
                onClick={() => handleNavClick('delivery')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                  activePage === 'delivery' ? 'text-purple-800 bg-purple-50' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Truck className="w-4 h-4 text-purple-600" />
                Delivery Partner Hub
              </button>
              <button
                onClick={() => handleNavClick('delivery-rides')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                  activePage === 'delivery-rides' ? 'text-purple-800 bg-purple-100 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bike className="w-4 h-4 text-purple-600" />
                Register Rides
              </button>
            </>
          )}

          <div className="border-t border-slate-100 pt-3">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  setActivePage('login');
                }}
                className="w-full text-left px-3 py-2 text-sm font-bold text-rose-600 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="flex-1 py-2 text-center text-sm font-bold border border-slate-200 rounded-xl"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('signup')}
                  className="flex-1 py-2 text-center text-sm font-bold text-white bg-brand-600 rounded-xl"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
