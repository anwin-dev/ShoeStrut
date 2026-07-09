import axios from 'axios';

function normalizeApiBase(url) {
  const cleaned = (url || '').trim().replace(/\/+$/, '');
  if (!cleaned) return 'http://localhost:7000/api';
  return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);
const SERVER_URL = API_BASE.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const path = window.location.pathname;
      const isAuthPage =
        path.startsWith('/login') || path.startsWith('/signup') || path.startsWith('/otp');
      if (!isAuthPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!path.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

export function assetUrl(image) {
  if (!image) return '/placeholder.png';
  if (image.startsWith('http')) return image;
  return `${SERVER_URL}/images/${image}`;
}

export default api;
