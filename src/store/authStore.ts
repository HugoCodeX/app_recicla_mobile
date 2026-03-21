import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  token: string | null;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  setToken: (token: string | null) => Promise<void>;
  logout: () => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isLoading: false,
  isHydrated: false,
  error: null,
  setToken: async (token) => {
    if (token) {
      await SecureStore.setItemAsync('auth_token', token);
    } else {
      await SecureStore.deleteItemAsync('auth_token');
    }
    set({ token, error: null });
  },
  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    set({ token: null, error: null });
  },
  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
  hydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      set({ token, isHydrated: true });
    } catch (e) {
      set({ token: null, isHydrated: true });
    }
  },
}));
