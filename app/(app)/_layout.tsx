import { Redirect } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { Platform, StatusBar } from 'react-native';
import { useEffect } from 'react';
import * as NavigationBar from 'expo-navigation-bar';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CustomDrawerContent } from '../../src/components/ui/CustomDrawerContent';

export default function AppLayout() {
  const { token, isHydrated } = useAuthStore();
  const { theme } = useThemeStore();

  // Cambiar el color de los botones (íconos de navegación) de Android según el tema
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setButtonStyleAsync(theme === 'dark' ? 'light' : 'dark').catch(() => {});
    }
  }, [theme]);

  if (isHydrated && !token) {
    return <Redirect href="/" />;
  }

  // En Android con edgeToEdge, el panel del Drawer se extiende detrás de la
  // barra de estado. Aplicamos un margen superior al propio panel para evitarlo.
  const drawerTopMargin = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{ 
          headerShown: false, 
          drawerPosition: 'right',
          drawerStyle: {
            marginTop: drawerTopMargin,
          },
        }}
      >
        <Drawer.Screen name="(tabs)" options={{ drawerLabel: 'Inicio', drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="datos-personales" options={{ drawerLabel: 'Datos Personales', drawerItemStyle: { display: 'none' } }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}
