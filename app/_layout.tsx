import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useAuthStore } from '../src/store/authStore';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../src/theme';

export default function RootLayout() {
  const { isHydrated, token, hydrate } = useAuthStore();
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

  if (!isHydrated) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(app)" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
