import { create } from 'zustand';
import { lightColors, darkColors } from '../theme';
import * as SecureStore from 'expo-secure-store';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'light',
  toggleTheme: async () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      // Fire and forget save
      SecureStore.setItemAsync('app_theme', newTheme).catch(() => {});
      return { theme: newTheme };
    });
  },
  loadTheme: async () => {
    try {
      const savedTheme = await SecureStore.getItemAsync('app_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        set({ theme: savedTheme });
      }
    } catch (e) {
      // ignore
    }
  }
}));

export const useAppTheme = () => {
  const { theme } = useThemeStore();
  return theme === 'dark' ? darkColors : lightColors;
};
