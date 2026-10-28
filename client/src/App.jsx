import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';

const MainLayout = () => {
  const { user, isAuthenticated, loading } = useAuth();

  // Determine initial page: first opening defaults to login if unauthenticated
  const [activePage, setActivePage] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return 'login';
    try {
      const parsed = JSON.parse(savedUser);
      if (parsed.role === 'admin') return 'admin';
      if (parsed.role === 'delivery') return 'delivery';
      return 'home';
    } catch {
      return 'login';
    }
  });

  const [refreshKey, setRefreshKey] = useState(0);

  // Synchronize dashboard whenever user signs in or out
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // If logged out and not already on login/signup, route to login
        if (activePage !== 'signup' && activePage !== 'login') {
          setActivePage('login');
        }
      }
    }
  }, [isAuthenticated, loading]);

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <Home key={refreshKey} setActivePage={setActivePage} />;
      case 'cart':
        return <Cart setActivePage={setActivePage} />;
      case 'orders':
        return <Orders setActivePage={setActivePage} />;
      case 'admin':
        return <AdminDashboard key={`${refreshKey}-inventory`} initialTab="inventory" setActivePage={setActivePage} />;
      case 'admin-shop':
        return <AdminDashboard key={`${refreshKey}-shop`} initialTab="shop" setActivePage={setActivePage} />;
      case 'delivery':
        return <DeliveryDashboard key={`${refreshKey}-tasks`} initialTab="tasks" setActivePage={setActivePage} />;
      case 'delivery-rides':
        return <DeliveryDashboard key={`${refreshKey}-rides`} initialTab="rides" setActivePage={setActivePage} />;
      case 'login':
        return <Login setActivePage={setActivePage} />;
      case 'signup':
        return <Signup setActivePage={setActivePage} />;
      default:
        return isAuthenticated ? (
          user?.role === 'admin' ? (
            <AdminDashboard setActivePage={setActivePage} />
          ) : user?.role === 'delivery' ? (
            <DeliveryDashboard setActivePage={setActivePage} />
          ) : (
            <Home key={refreshKey} setActivePage={setActivePage} />
          )
        ) : (
          <Login setActivePage={setActivePage} />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-brand-100 selection:text-brand-900">
      {/* Main Navbar */}
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      {/* Page Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderPage()}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainLayout />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
