import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useThemeStore } from '../src/store/themeStore';
import { useEffect } from 'react';
import { useAuthStore } from '../src/store/authStore';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { StyleSheet } from 'react-native';

// Mantiene el splash screen visible mientras se cargan los recursos o el token
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isHydrated, token, hydrate } = useAuthStore();
  const { theme } = useThemeStore();
  const segments = useSegments();
  const router = useRouter();

  // Hydrate auth state on startup
  useEffect(() => {
    hydrate();
  }, []);

  // Strict military-grade route protection guard
  useEffect(() => {
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === '(app)';

    if (!token && inAuthGroup) {
      // Redirect to login if unauthenticated and trying to access (app)
      router.replace('/');
    } else if (token && !inAuthGroup) {
      // Redirect away from login screen to new tabs layout if already authenticated
      router.replace('/(app)/(tabs)' as any);
    }
  }, [token, isHydrated, segments]);

  useEffect(() => {
    if (isHydrated) {
      // Oculta el splash screen nativo cuando Zustand ha cargado el token
      SplashScreen.hideAsync();
    }
  }, [isHydrated]);

  if (!isHydrated) {
    return null; // El framework prefiere null antes que retornar un <View> plano fuera del Router Context
  }

  return (
    <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(app)" />
      </Stack>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  // Se eliminaron estilos huérfanos del splash anterior
});
