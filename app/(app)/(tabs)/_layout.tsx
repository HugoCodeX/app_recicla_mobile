import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Modal, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Home, Heart, Building2, HelpCircle, Bell, User, Sun, Moon, Users } from 'lucide-react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import * as Notifications from 'expo-notifications';
import { typography, spacing, radius } from '../../../src/theme';
import { useAppTheme, useThemeStore } from '../../../src/store/themeStore';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useNotificationStore } from '../../../src/store/notificationStore';

export default function TabLayout() {
  const navigation = useNavigation();
  const colors = useAppTheme();
  const { theme, toggleTheme } = useThemeStore();
  const insets = useSafeAreaInsets();
  
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [userImage, setUserImage] = React.useState<string | null>(null);
  const { registerForPushNotificationsAsync, unreadCount, markAllAsRead, clearAll, notifications, addNotification } = useNotificationStore();

  useEffect(() => {
    registerForPushNotificationsAsync();

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      addNotification({
        title: notification.request.content.title || 'Nueva Alerta',
        message: notification.request.content.body || '',
        data: notification.request.content.data,
      });
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('El usuario tocó una notificación Push:', response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setButtonStyleAsync(theme === 'dark' ? 'light' : 'dark').catch(() => {});
    }
  }, [theme]);

  // Fetch user image from session
  React.useEffect(() => {
    const fetchImage = async () => {
      try {
        const api = (await import('../../../src/api')).default;
        const { data } = await api.get('/auth/get-session');
        const user = data.user || {};
        if (user.image) setUserImage(user.image);
      } catch (e) {}
    };
    fetchImage();
  }, []);

  return (
    <>
      <Tabs
        screenOptions={{
        header: () => (
          <View style={[
            styles.header, 
            { 
              backgroundColor: colors.surface, 
              borderBottomColor: colors.border,
              paddingTop: Math.max(insets.top, 20) + spacing.md
            }
          ]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.greetingText}>Hola, </Text>
              <Text style={[styles.userName, { color: colors.primary }]}>Hugo</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconButton} onPress={toggleTheme}>
                {theme === 'dark' ? (
                  <Sun size={24} color={colors.text} />
                ) : (
                  <Moon size={24} color={colors.text} />
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton} 
                onPress={() => {
                  setShowNotifications(true);
                  if (unreadCount > 0) markAllAsRead();
                }}
              >
                <Bell size={24} color={colors.text} />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.avatarButton, { backgroundColor: userImage ? 'transparent' : colors.primary }]}
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              >
                {userImage ? (
                  <Image source={{ uri: userImage }} style={styles.headerAvatar} />
                ) : (
                  <User size={24} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        ),
        tabBarStyle: [
          styles.tabBar, 
          { 
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          }
        ],
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarShowLabel: true,
        tabBarLabelStyle: { 
          fontSize: 10, 
          fontWeight: '600',
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="hearts"
        options={{
          title: 'Corazones',
          tabBarIcon: ({ color }) => <Heart size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="condos"
        options={{
          title: 'Condominios',
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.middleButton, 
              { 
                backgroundColor: focused ? colors.primary : colors.background,
                borderColor: colors.surface
              }
            ]}>
              <Building2 size={28} color={focused ? '#fff' : colors.primaryDark} />
            </View>
          ),
          tabBarLabel: 'Condominios',
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Comunidad',
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: 'Ayuda',
          tabBarIcon: ({ color }) => <HelpCircle size={24} color={color} />,
        }}
      />
    </Tabs>

      {/* Panel de Notificaciones (Modal) */}
      <Modal
        visible={showNotifications}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowNotifications(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowNotifications(false)} />
        <SafeAreaView style={styles.modalSafeArea} pointerEvents="box-none">
          <View style={[styles.notificationPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.notificationHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.notificationTitle, { color: colors.text }]}>Notificaciones</Text>
              {notifications.length > 0 && (
                <TouchableOpacity onPress={clearAll}>
                  <Text style={[styles.clearText, { color: colors.primary }]}>Limpiar todas</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <ScrollView style={styles.notificationList} contentContainerStyle={styles.notificationListContent}>
              {notifications.length === 0 ? (
                <View style={styles.emptyNotifContainer}>
                  <Bell size={32} color={colors.textSecondary} style={{ opacity: 0.3 }} />
                  <Text style={[styles.emptyNotifText, { color: colors.textSecondary }]}>No tienes notificaciones pendientes</Text>
                </View>
              ) : (
                notifications.map(notif => (
                  <View key={notif.id} style={[styles.notificationCard, { borderBottomColor: colors.border }]}>
                    <View style={styles.notifIconContainer}>
                      <View style={[styles.notifIcon, { backgroundColor: notif.read ? colors.background : colors.primary + '20' }]}>
                        <Bell size={18} color={notif.read ? colors.textSecondary : colors.primary} />
                      </View>
                    </View>
                    <View style={styles.notifContent}>
                      <Text style={[styles.notifTitle, { color: colors.text }]} numberOfLines={1}>{notif.title}</Text>
                      <Text style={[styles.notifMessage, { color: colors.textSecondary }]}>{notif.message}</Text>
                      <Text style={[styles.notifTime, { color: colors.textSecondary }]}>
                        {new Date(notif.timestamp).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })} · {new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
            <TouchableOpacity style={[styles.closeModalBtn, { borderTopColor: colors.border }]} onPress={() => setShowNotifications(false)}>
              <Text style={[styles.closeModalText, { color: colors.text }]}>Cerrar panel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  greetingText: {
    ...typography.caption,
    color: '#64748b', // static secondary for greeting
  },
  userName: {
    ...typography.h2,
    fontSize: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: spacing.md,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  tabBar: {
    borderTopWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
  },
  middleButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    top: -20,
    borderWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSafeArea: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 60 : 70,
    paddingHorizontal: spacing.md,
  },
  notificationPanel: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '70%',
    borderRadius: radius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
    borderWidth: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  notificationTitle: {
    ...typography.h2,
    fontSize: 16,
  },
  clearText: {
    ...typography.caption,
    fontWeight: '600',
  },
  notificationList: {
    flexGrow: 1,
  },
  notificationListContent: {
    padding: 0,
  },
  emptyNotifContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyNotifText: {
    ...typography.body,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  notificationCard: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  notifIconContainer: {
    marginRight: spacing.md,
  },
  notifIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    ...typography.h2,
    fontSize: 14,
    marginBottom: 2,
  },
  notifMessage: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  notifTime: {
    ...typography.caption,
    fontSize: 11,
  },
  closeModalBtn: {
    padding: spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  closeModalText: {
    ...typography.h2,
    fontSize: 14,
  },
});
