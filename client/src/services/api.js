import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const getAuthHeaders = () => {
  let token = localStorage.getItem('token');
  if (!token || token === 'undefined' || token === 'null') {
    try {
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      token = savedUser?.token;
      if (token && token !== 'undefined' && token !== 'null') {
        localStorage.setItem('token', token);
      }
    } catch (e) {}
  }
  return token && token !== 'undefined' && token !== 'null'
    ? { Authorization: `Bearer ${token}` }
    : {};
};

export const authAPI = {
  register: (data) => axios.post(`${API_BASE}/auth/register`, data),
  sendRegisterOtp: (data) => axios.post(`${API_BASE}/auth/register/send-otp`, data),
  verifyRegisterOtp: (data) => axios.post(`${API_BASE}/auth/register/verify-otp`, data),
  login: (data) => axios.post(`${API_BASE}/auth/login`, data),
  forgotPassword: (data) => axios.post(`${API_BASE}/auth/forgot-password`, data),
  resetPassword: (data) => axios.post(`${API_BASE}/auth/reset-password`, data),
  updateLocation: (data) => axios.put(`${API_BASE}/auth/location`, data, { headers: getAuthHeaders() }),
  getStatus: () => axios.get(`${API_BASE}/auth/status`)
};

export const productAPI = {
  getProducts: (params) => axios.get(`${API_BASE}/products`, { params }),
  addProduct: (data) => axios.post(`${API_BASE}/products`, data, { headers: getAuthHeaders() }),
  updateProduct: (id, data) => axios.put(`${API_BASE}/products/${id}`, data, { headers: getAuthHeaders() }),
  deleteProduct: (id) => axios.delete(`${API_BASE}/products/${id}`, { headers: getAuthHeaders() })
};

export const orderAPI = {
  createOrder: (data) => axios.post(`${API_BASE}/orders`, data, { headers: getAuthHeaders() }),
  getOrders: (params) => axios.get(`${API_BASE}/orders`, { headers: getAuthHeaders(), params }),
  updateStatus: (id, data) => axios.put(`${API_BASE}/orders/${id}/status`, data, { headers: getAuthHeaders() }),
  updateLocation: (id, data) => axios.put(`${API_BASE}/orders/${id}/location`, data, { headers: getAuthHeaders() })
};

export const notificationAPI = {
  getNotifications: () => axios.get(`${API_BASE}/notifications`, { headers: getAuthHeaders() }),
  createNotification: (data) => axios.post(`${API_BASE}/notifications`, data, { headers: getAuthHeaders() }),
  generateOtp: (data) => axios.post(`${API_BASE}/notifications/otp/generate`, data, { headers: getAuthHeaders() }),
  verifyOtp: (data) => axios.post(`${API_BASE}/notifications/otp/verify`, data, { headers: getAuthHeaders() })
};


