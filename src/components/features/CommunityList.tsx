import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft, Building2, Battery, BatteryMedium, BatteryFull } from 'lucide-react-native';
import { spacing, typography, radius } from '../../theme';
import { PointOfInterest } from './MapViewer';

interface CommunityListProps {
  points: PointOfInterest[];
  role: string;
  loading: boolean;
  onBack: () => void;
  onUpdateStatus?: (id: string | number | undefined, estado: string) => void;
  colors: any;
}

export function CommunityList({ points, role, loading, onBack, onUpdateStatus, colors }: CommunityListProps) {
  const styles = getStyles(colors);

  return (
    <ScrollView style={styles.fullContainer} contentContainerStyle={styles.listContent}>
      {role === 'SUPERADMIN' && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color={colors.text} />
          <Text style={styles.backText}>Volver al menú</Text>
        </TouchableOpacity>
      )}

      {points.length > 0 ? (
        points.map((p, index) => (
          <View key={p.id || index} style={styles.condoCard}>
            <View style={styles.condoHeader}>
              <View style={{ flex: 1, paddingRight: spacing.sm }}>
                <Text style={styles.condoName}>{p.name || p.nombre || 'Condominio'}</Text>
                <Text style={styles.condoAddress}>{p.direccion || p.description || 'Sin dirección'}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.statusText, { color: colors.primary }]}>
                  {p.estado || 'Desconocido'}
                </Text>
              </View>
            </View>

            {onUpdateStatus && (
              <>
                <Text style={styles.reportTitle}>Actualizar Estado:</Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { borderColor: '#10b981' }]}
                    onPress={() => onUpdateStatus(p.id, 'vacio')}
                  >
                    <Battery size={20} color="#10b981" />
                    <Text style={[styles.actionText, { color: '#10b981' }]}>Vacío</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { borderColor: '#f59e0b' }]}
                    onPress={() => onUpdateStatus(p.id, 'medio_lleno')}
                  >
                    <BatteryMedium size={20} color="#f59e0b" />
                    <Text style={[styles.actionText, { color: '#f59e0b' }]}>Medio</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { borderColor: '#ef4444' }]}
                    onPress={() => onUpdateStatus(p.id, 'lleno')}
                  >
                    <BatteryFull size={20} color="#ef4444" />
                    <Text style={[styles.actionText, { color: '#ef4444' }]}>Lleno</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        ))
      ) : (
        <View style={styles.listEmptyContainer}>
           <Building2 size={48} color={colors.textSecondary} />
           <Text style={styles.placeholderTitle}>Sin Elementos</Text>
           <Text style={styles.placeholderText}>
             {loading ? 'Cargando datos...' : 'Aún no se han registrado elementos.'}
           </Text>
        </View>
      )}
    </ScrollView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    elevation: 2,
  },
  backText: {
    ...typography.h2,
    fontSize: 18,
    color: colors.text,
    marginLeft: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  condoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  condoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  condoName: {
    ...typography.h2,
    fontSize: 18,
    color: colors.text,
    marginBottom: 4,
  },
  condoAddress: {
    ...typography.caption,
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  reportTitle: {
    ...typography.caption,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  listEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xxl,
  },
  placeholderTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  placeholderText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
