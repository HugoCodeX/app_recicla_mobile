import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Map, Building2 } from 'lucide-react-native';
import { spacing, typography, radius } from '../../theme';

interface RoleMenuProps {
  onSelectView: (view: 'MAP' | 'LIST') => void;
  colors: any;
}

export function RoleMenu({ onSelectView, colors }: RoleMenuProps) {
  const styles = getStyles(colors);

  return (
    <View style={styles.menuContainer}>
      <Text style={styles.menuTitle}>Panel de Control</Text>
      <Text style={styles.menuSubtitle}>¿Qué vista deseas abrir?</Text>

      <View style={styles.cardsContainer}>
        <TouchableOpacity style={styles.roleCard} onPress={() => onSelectView('MAP')} activeOpacity={0.8}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
            <Map size={36} color={colors.primary} />
          </View>
          <Text style={styles.cardTitle}>Vista Reciclador</Text>
          <Text style={styles.cardDesc}>Ver mapa de recolección</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.roleCard} onPress={() => onSelectView('LIST')} activeOpacity={0.8}>
          <View style={[styles.iconCircle, { backgroundColor: '#3b82f6' + '20' }]}>
            <Building2 size={36} color="#3b82f6" />
          </View>
          <Text style={styles.cardTitle}>Vista Comunidad</Text>
          <Text style={styles.cardDesc}>Gestionar mis condominios</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  menuContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  menuTitle: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  menuSubtitle: {
    ...typography.body,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  cardsContainer: {
    gap: spacing.lg,
  },
  roleCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.lg,
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.h2,
    fontSize: 22,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardDesc: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
