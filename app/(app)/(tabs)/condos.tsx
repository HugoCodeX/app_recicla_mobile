import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import { useAppTheme, useThemeStore } from '../../../src/store/themeStore';
import { useNotificationStore } from '../../../src/store/notificationStore';
import api from '../../../src/api';
import { ArrowLeft } from 'lucide-react-native';
import { spacing, typography } from '../../../src/theme';

import { RoleMenu } from '../../../src/components/features/RoleMenu';
import { CommunityList } from '../../../src/components/features/CommunityList';
import { MapViewer, PointOfInterest } from '../../../src/components/features/MapViewer';

type Role = 'SUPERADMIN' | 'RECICLADOR' | 'COMUNIDAD';
type ViewState = 'MENU' | 'MAP' | 'LIST';

export default function CondosScreen() {
  const colors = useAppTheme();
  const { theme } = useThemeStore();
  const [role] = useState<Role>('SUPERADMIN'); 
  const [currentView, setCurrentView] = useState<ViewState>('MENU');
  
  const [points, setPoints] = useState<PointOfInterest[]>([]);
  const [loadingMap, setLoadingMap] = useState(false);
  
  const latestNotifId = useNotificationStore(state => state.notifications[0]?.id);

  const handleBack = () => setCurrentView('MENU');

  const handleUpdateStatus = async (id: string | number | undefined, nuevoEstado: string) => {
    if (!id) return;
    try {
      await api.patch(`/v1/condominios/${id}/estado`, { estado: nuevoEstado });
      setPoints(prev => prev.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
      Alert.alert('Éxito', 'Estado actualizado correctamente');
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Error desconocido';
      Alert.alert('Error del Servidor', `No se pudo actualizar: ${msg}`);
    }
  };

  useEffect(() => {
    const loadPoints = async () => {
      if ((currentView === 'MAP' || currentView === 'LIST' || role === 'RECICLADOR' || role === 'COMUNIDAD') && points.length === 0) {
        setLoadingMap(true);
        try {
          const response = await api.get('/v1/condominios');
          if (Array.isArray(response.data)) setPoints(response.data);
        } catch (error) {
          console.error("Error cargando condominios:", error);
        } finally {
          setLoadingMap(false);
        }
      }
    };
    loadPoints();
  }, [currentView, role]);

  useEffect(() => {
    if (!latestNotifId) return;
    let isMounted = true;
    api.get('/v1/condominios').then(response => {
      if (isMounted) setPoints(response.data);
    }).catch(console.error);
    return () => { isMounted = false; };
  }, [latestNotifId]);

  if (role === 'SUPERADMIN' && currentView === 'MENU') {
    return <RoleMenu onSelectView={setCurrentView} colors={colors} />;
  }

  if (role === 'RECICLADOR' || currentView === 'MAP') {
    return (
      <View style={[styles.fullContainer, { backgroundColor: colors.background }]}>
        {role === 'SUPERADMIN' && (
          <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.surface, borderBottomColor: colors.border }]} onPress={handleBack}>
            <ArrowLeft size={24} color={colors.text} />
            <Text style={[styles.backText, { color: colors.text }]}>Volver al menú</Text>
          </TouchableOpacity>
        )}
        
        {loadingMap ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <MapViewer 
            points={points} 
            mapType="condos" 
            colors={colors} 
            theme={theme} 
          />
        )}
      </View>
    );
  }

  if (role === 'COMUNIDAD' || currentView === 'LIST') {
    return (
      <CommunityList 
        points={points}
        role={role}
        loading={loadingMap}
        onBack={handleBack}
        onUpdateStatus={handleUpdateStatus}
        colors={colors}
      />
    );
  }

  return <View style={[styles.fullContainer, { backgroundColor: colors.background }]} />;
}

const styles = StyleSheet.create({
  fullContainer: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    elevation: 2,
  },
  backText: {
    ...typography.h2,
    fontSize: 18,
    marginLeft: spacing.md,
  },
});
