import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const API_URL = 'https://backend-recicla-zn6v.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the token if it exists
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
        // Token read fail
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
