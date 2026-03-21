import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// La URL backend se lee del archivo .env a través de EXPO_PUBLIC_API_URL.
// En caso de que no exista el archivo .env, usa el valor por defecto provisto.
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://backend-recicla-zn6v.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the token if it exists
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
