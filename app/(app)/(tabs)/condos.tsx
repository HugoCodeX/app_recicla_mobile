import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, typography } from '../../../src/theme';
import { useAppTheme } from '../../../src/store/themeStore';

export default function CondosScreen() {
  const colors = useAppTheme();
  const styles = getStyles(colors);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Condominios</Text>
      <Text style={styles.subtitle}>Gestiona tus propiedades y condominios aquí.</Text>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.sm,
    color: colors.primaryDark,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
  },
});
