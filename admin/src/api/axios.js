import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:7000/api';
const SERVER_URL = API_BASE.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export function assetUrl(image) {
  if (!image) return '';
  if (image.startsWith('http')) return image;
  return `${SERVER_URL}/images/${image}`;
}

export default api;
