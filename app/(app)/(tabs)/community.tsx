import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, typography } from '../../../src/theme';
import { useAppTheme } from '../../../src/store/themeStore';

export default function CommunityScreen() {
  const colors = useAppTheme();
  const styles = getStyles(colors);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comunidad</Text>
      <Text style={styles.subtitle}>Conéctate con tus vecinos.</Text>
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
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textSecondary,
  },
});
