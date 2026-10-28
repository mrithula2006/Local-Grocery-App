// Central Shop Management Service
// Handles registered grocery stores, real-time Open/Closed statuses, and customer store selection

const SHOPS_STORAGE_KEY = 'freshcart_registered_shops_v2';
const SELECTED_SHOP_KEY = 'freshcart_selected_shop_id';

const DEFAULT_SHOPS = [
  {
    id: 'shop-1',
    shopName: 'FreshCart Central Organic Mart',
    category: 'Fresh Farm Produce, Daily Organic Staples & Dairy',
    ownerName: 'Vendor Partner',
    fssaiNumber: 'FSSAI-12220026000451',
    gstNumber: '29ABCDE1234F1Z5',
    phone: '9876543210',
    email: 'vendor@freshcart.com',
    address: 'Shop #14, 80ft Road, 4th Block, Koramangala, Bengaluru',
    pincode: '560034',
    openTime: '07:00 AM',
    closeTime: '10:30 PM',
    deliveryRadius: '8',
    isOpen: true,
    rating: 4.8,
    totalDeliveries: '4,820+',
    bannerImage: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'shop-2',
    shopName: 'Green Valley Fresh Produce & Farm Milk',
    category: 'Hydroponic Greens, Farm Fresh Dairy & Artisan Bakery',
    ownerName: 'Sunita Reddy',
    fssaiNumber: 'FSSAI-10022099000889',
    gstNumber: '29XYZAB5678C1D2',
    phone: '9845123456',
    email: 'greenvalley@freshcart.com',
    address: 'Plot 82, 100ft Road, HAL 2nd Stage, Indiranagar, Bengaluru',
    pincode: '560038',
    openTime: '06:30 AM',
    closeTime: '11:00 PM',
    deliveryRadius: '12',
    isOpen: true,
    rating: 4.9,
    totalDeliveries: '3,150+',
    bannerImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'shop-3',
    shopName: 'DailyMart Neighborhood Superstore',
    category: 'Packaged Foods, Household Essentials & Beverages',
    ownerName: 'Anand Verma',
    fssaiNumber: 'FSSAI-11522034000192',
    gstNumber: '29PQRST9876E1F3',
    phone: '9741098765',
    email: 'dailymart@freshcart.com',
    address: '#45, 14th Main, HSR Layout Sector 1, Bengaluru',
    pincode: '560102',
    openTime: '08:00 AM',
    closeTime: '10:00 PM',
    deliveryRadius: '6',
    isOpen: false, // Default closed so the user can easily observe closed store status
    rating: 4.6,
    totalDeliveries: '1,940+',
    bannerImage: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=600&q=80',
  },
];

export const getRegisteredShops = () => {
  try {
    const data = localStorage.getItem(SHOPS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(SHOPS_STORAGE_KEY, JSON.stringify(DEFAULT_SHOPS));
      return DEFAULT_SHOPS;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_SHOPS;
  }
};

export const saveRegisteredShops = (shops) => {
  try {
    localStorage.setItem(SHOPS_STORAGE_KEY, JSON.stringify(shops));
    // Dispatch custom event for real-time synchronization across components
    window.dispatchEvent(new Event('freshcart_shops_updated'));
  } catch (err) {
    console.error('Failed to save shops:', err);
  }
};

export const updateShop = (updatedShop) => {
  const currentShops = getRegisteredShops();
  const index = currentShops.findIndex((s) => s.id === updatedShop.id);
  if (index !== -1) {
    currentShops[index] = { ...currentShops[index], ...updatedShop };
  } else {
    currentShops.push(updatedShop);
  }
  saveRegisteredShops(currentShops);
  return currentShops;
};

export const toggleShopOpenStatus = (shopId) => {
  const currentShops = getRegisteredShops();
  const updated = currentShops.map((s) => {
    if (s.id === shopId) {
      return { ...s, isOpen: !s.isOpen };
    }
    return s;
  });
  saveRegisteredShops(updated);
  return updated;
};

export const getSelectedShop = () => {
  const shops = getRegisteredShops();
  const selectedId = localStorage.getItem(SELECTED_SHOP_KEY);
  if (selectedId) {
    const found = shops.find((s) => s.id === selectedId);
    if (found) return found;
  }
  // Default to first open shop or first shop
  const defaultShop = shops.find((s) => s.isOpen) || shops[0];
  if (defaultShop) {
    localStorage.setItem(SELECTED_SHOP_KEY, defaultShop.id);
  }
  return defaultShop;
};

export const setSelectedShop = (shopId) => {
  localStorage.setItem(SELECTED_SHOP_KEY, shopId);
  window.dispatchEvent(new Event('freshcart_selected_shop_changed'));
};
