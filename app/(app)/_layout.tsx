import { Redirect } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useAuthStore } from '../../src/store/authStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CustomDrawerContent } from '../../src/components/ui/CustomDrawerContent';

export default function AppLayout() {
  const { token, isHydrated } = useAuthStore();

  if (isHydrated && !token) {
    return <Redirect href="/" />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{ headerShown: false, drawerPosition: 'right' }}
      >
        <Drawer.Screen name="(tabs)" options={{ drawerLabel: 'Inicio', drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="datos-personales" options={{ drawerLabel: 'Datos Personales', drawerItemStyle: { display: 'none' } }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}
