import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle global errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/update-profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
  logout: () => API.post('/auth/logout'),
};

// User Management APIs
export const userAPI = {
  getAll: (params) => API.get('/users', { params }),
  getById: (id) => API.get(`/users/${id}`),
  getStats: () => API.get('/users/stats'),
  createDoctor: (data) => API.post('/users/doctors', data),
  createStaff: (data) => API.post('/users/staff', data),
  createAdmin: (data) => API.post('/users/admins', data),
  update: (id, data) => API.put(`/users/${id}`, data),
  toggleStatus: (id) => API.patch(`/users/${id}/toggle-status`),
  delete: (id) => API.delete(`/users/${id}`),
  getPublicDoctors: (params) => API.get('/users/doctors/public', { params }),
};

export const appointmentAPI = {
  getAll: () => API.get('/appointments'),
  create: (data) => API.post('/appointments', data),
  update: (id, data) => API.put(`/appointments/${id}`, data),
  delete: (id) => API.delete(`/appointments/${id}`),
};

export const aiAPI = {
  symptomCheck: (history, systemPrompt) =>
    API.post('/ai/symptom-check', { history, systemPrompt }),
};

export const paymentAPI = {
  createCheckoutSession: (data) => API.post('/payments/create-checkout-session', data),
  verifySession: (data) => API.post('/payments/verify-session', data),
};

export const leaveAPI = {
  createRequest: (data) => API.post('/leaves', data),
  getMyRequests: () => API.get('/leaves/me'),
  getAllRequests: () => API.get('/leaves'),
  updateStatus: (id, statusData) => API.put(`/leaves/${id}/status`, statusData),
};

export default API;
