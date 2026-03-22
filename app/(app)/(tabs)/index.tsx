import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { BatteryFull } from 'lucide-react-native';
import { spacing, typography, radius } from '../../../src/theme';
import { useAppTheme } from '../../../src/store/themeStore';
import { Button } from '../../../src/components/ui/Button';
import { useAuthStore } from '../../../src/store/authStore';
import api from '../../../src/api';
import { useNotificationStore } from '../../../src/store/notificationStore';

export default function HomeScreen() {
  const { logout } = useAuthStore();
  const colors = useAppTheme();
  const styles = getStyles(colors);

  const [llenoCount, setLlenoCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const latestNotifId = useNotificationStore(state => state.notifications[0]?.id);

  const fetchLlenoCount = () => {
    api.get('/v1/condominios')
      .then(response => {
        if (Array.isArray(response.data)) {
          const count = response.data.filter(
            (c: any) => c.estado === 'lleno'
          ).length;
          setLlenoCount(count);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // Carga inicial
  useEffect(() => { fetchLlenoCount(); }, []);

  // Actualización en tiempo real cuando llega una notificación push
  useEffect(() => {
    if (latestNotifId) fetchLlenoCount();
  }, [latestNotifId]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Vista General</Text>
        <Text style={styles.bodyText}>
          Bienvenido a la pantalla de Inicio. Aquí puedes ver el resumen de tu cuenta.
        </Text>
      </View>

      <View style={[styles.statCard, { borderLeftColor: '#ef4444' }]}>
        <View style={styles.statRow}>
          <View style={[styles.statIconCircle, { backgroundColor: '#ef444420' }]}>
            <BatteryFull size={24} color="#ef4444" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.statLabel}>Condominios Llenos</Text>
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ alignSelf: 'flex-start', marginTop: 4 }} />
            ) : (
              <Text style={[styles.statValue, { color: '#ef4444' }]}>{llenoCount ?? 0}</Text>
            )}
          </View>
        </View>
      </View>
      
      <Button 
        title="Cerrar Sesión" 
        onPress={logout} 
        outline 
        style={styles.logoutButton}
      />
    </ScrollView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 16,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  bodyText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  statCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  logoutButton: {
    marginTop: spacing.xl,
  },
});
