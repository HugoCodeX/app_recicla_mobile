import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacityProps,
  View
} from 'react-native';
import { radius, spacing, typography } from '../../theme';
import { useAppTheme } from '../../store/themeStore';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  outline?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = ({ 
  title, 
  outline = false, 
  loading = false, 
  icon,
  style, 
  disabled,
  ...props 
}: ButtonProps) => {
  const colors = useAppTheme();
  const styles = getStyles(colors);
  
  const isSecondary = outline;
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isSecondary ? styles.buttonOutline : styles.buttonPrimary,
        isDisabled && styles.buttonDisabled,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={isSecondary ? colors.primary : colors.surface} />
        ) : (
          <>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text
              style={[
                styles.text,
                isSecondary ? styles.textOutline : styles.textPrimary,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  button: {
    height: 52,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  text: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  textPrimary: {
    color: colors.surface,
  },
  textOutline: {
    color: colors.textSecondary,
  },
});
