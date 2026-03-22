import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { spacing, typography } from '../../../src/theme';
import { useAppTheme } from '../../../src/store/themeStore';
import { Button } from '../../../src/components/ui/Button';
import { useAuthStore } from '../../../src/store/authStore';

export default function HomeScreen() {
  const { logout } = useAuthStore();
  const colors = useAppTheme();
  const styles = getStyles(colors);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Vista General</Text>
        <Text style={styles.bodyText}>
          Bienvenido a la pantalla de Inicio. Aquí puedes ver el resumen de tu cuenta, similar a la experiencia Tenpo.
        </Text>
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
  welcomeTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  welcomeSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
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
  logoutButton: {
    marginTop: spacing.xl,
  },
});
