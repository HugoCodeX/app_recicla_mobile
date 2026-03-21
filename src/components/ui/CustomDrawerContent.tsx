import { useRouter } from 'expo-router';
import { FileText, Key, LogOut, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../api/index';
import { useAuthStore } from '../../store/authStore';
import { useAppTheme } from '../../store/themeStore';
import { radius, spacing, typography } from '../../theme';

export function CustomDrawerContent(props: any) {
  const { logout } = useAuthStore();
  const colors = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [userData, setUserData] = useState<{name: string, role: string} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await api.get('/auth/get-session');
        const user = data.user || {};
        const roles = data.roles || [];
        
        let roleName = 'Usuario';
        if (roles.length > 0) {
          const rawRole = roles[0].name || roles[0]; // Ej: "SUPER_USUARIO"
          // Reemplaza guiones bajos por espacios y capitaliza cada palabra
          roleName = rawRole
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, (char: string) => char.toUpperCase());
        }
        
        setUserData({
          name: user.name || 'Usuario',
          role: roleName
        });
      } catch (error) {
        console.error('Error cargando la sesión en sidebar:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSession();
  }, []);

  const handleLogout = async () => {
    await logout();
    // Router redirect is handled automatically by the Root Layout guard
  };

  const DrawerItem = ({ icon: Icon, label, onPress }: { icon: any, label: string, onPress: () => void }) => (
    <TouchableOpacity style={styles.drawerItem} onPress={onPress}>
      <Icon size={20} color={colors.textSecondary} />
      <Text style={[styles.drawerItemText, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );

  const avatarName = userData?.name ? encodeURIComponent(userData.name) : 'Usuario';

  // En Android con edgeToEdge, useSafeAreaInsets a veces no detecta bien
  // los insets dentro del overlay del Drawer. Usamos StatusBar.currentHeight como fallback.
  const topInset = Platform.OS === 'android'
    ? Math.max(insets.top, StatusBar.currentHeight || 0)
    : insets.top;
  const bottomInset = Math.max(insets.bottom, 20);

  return (
    <SafeAreaProvider>
      <View 
        style={[styles.container, { 
          backgroundColor: colors.surface,
          paddingTop: topInset + spacing.sm,
          paddingBottom: bottomInset,
        }]}
      >
      <ScrollView 
        {...props} 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingTop: spacing.md }}
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.profileSection, { borderBottomColor: colors.border }]}>
          <Image 
            source={{ uri: `https://ui-avatars.com/api/?name=${avatarName}&background=2acf80&color=fff&size=128` }} 
            style={styles.avatar} 
          />
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: spacing.sm }} />
          ) : (
            <>
              <Text style={[styles.name, { color: colors.text }]}>{userData?.name || 'Usuario'}</Text>
              <Text style={[styles.role, { color: colors.primary }]}>{userData?.role || 'Usuario'}</Text>
            </>
          )}
        </View>

        <View style={styles.menuSection}>
          <DrawerItem 
            icon={User} 
            label="Datos Personales" 
            onPress={() => { props.navigation.closeDrawer(); router.push('/(app)/datos-personales'); }} 
          />
          <DrawerItem 
            icon={Key} 
            label="Cambiar Contraseña" 
            onPress={() => {}} 
          />
          <DrawerItem 
            icon={FileText} 
            label="Términos y Condiciones" 
            onPress={() => {}} 
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: spacing.md, borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    padding: spacing.xl,
    paddingTop: spacing.lg,
    borderBottomWidth: 1,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.md,
  },
  name: {
    ...typography.h2,
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  role: {
    ...typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  menuSection: {
    paddingHorizontal: spacing.md,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  drawerItemText: {
    ...typography.body,
    marginLeft: spacing.lg,
    fontWeight: '500',
  },
  footer: {
    padding: spacing.xl,
    borderTopWidth: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    ...typography.body,
    marginLeft: spacing.lg,
    fontWeight: '600',
  },
});
