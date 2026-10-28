const API_BASE_URL = '/api';

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
};

// Auth Services
export const authApi = {
  login: (credentials) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => apiFetch('/auth/me'),
};

// Product Services
export const productApi = {
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.keyword) query.append('keyword', params.keyword);
    if (params.sort) query.append('sort', params.sort);
    const qs = query.toString();
    return apiFetch(`/products${qs ? `?${qs}` : ''}`);
  },
  getProductById: (id) => apiFetch(`/products/${id}`),
  createProduct: (data) => apiFetch('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => apiFetch(`/products/${id}`, { method: 'DELETE' }),
  getCategories: () => apiFetch('/products/categories/summary'),
};

// Order Services
export const orderApi = {
  createOrder: (data) => apiFetch('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getMyOrders: () => apiFetch('/orders/my-orders'),
  getAllOrders: (status) => {
    const qs = status && status !== 'All' ? `?status=${encodeURIComponent(status)}` : '';
    return apiFetch(`/orders${qs}`);
  },
  getOrderById: (id) => apiFetch(`/orders/${id}`),
  updateOrderStatus: (id, statusData) =>
    apiFetch(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify(statusData) }),
  reseed: () => apiFetch('/seed', { method: 'POST' }),
};
