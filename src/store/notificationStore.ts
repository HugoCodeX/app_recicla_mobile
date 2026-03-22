import { create } from 'zustand';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import api from '../api';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  data?: any;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  expoPushToken: string | null;
  registerForPushNotificationsAsync: () => Promise<void>;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  expoPushToken: null,

  registerForPushNotificationsAsync: async () => {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Permiso denegado para recibir notificaciones Push.');
        return;
      }
      
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        if (!projectId) {
          console.warn('No se encontró el projectId de EAS en app.json');
        }

        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        
        // Enviar silenciosamente el token al backend (upsert)
        try {
          // Si el endpoint es POST o PATCH, puedes cambiar aquí el método si tu IA usó POST
          await api.patch('/v1/usuarios/me/expo-push-token', { expoPushToken: token });
        } catch (apiError) {
          console.log("⚠️ No se pudo guardar el token en el backend. Revisar si hay sesión activa.", apiError);
        }

      } catch (e) {
        console.log("Error obteniendo el token PUSH", e);
      }
    } else {
      console.log('Debes usar un dispositivo físico para probar las Push Notifications reales.');
    }

    set({ expoPushToken: token });
  },

  addNotification: (newNotif) => {
    const fullNotif: AppNotification = {
      ...newNotif,
      id: Math.random().toString(36).substring(7) + Date.now().toString(),
      timestamp: Date.now(),
      read: false,
    };
    
    set((state) => ({
      notifications: [fullNotif, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  },

  markAllAsRead: () => set((state) => ({
    unreadCount: 0,
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
