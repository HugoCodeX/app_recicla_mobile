export const lightColors = {
  primary: '#2DB298',
  primaryDark: '#1E8F78',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#0f172a',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  error: '#ef4444',
  success: '#10b981',
};

export const darkColors = {
  primary: '#2DB298',
  primaryDark: '#1E8F78',
  background: '#000000',
  surface: '#121212',
  text: '#ffffff',
  textSecondary: '#a1a1aa',
  border: '#27272A',
  error: '#f87171',
  success: '#34d399',
};

// Default static export for components not yet migrated to useAppTheme hook
export const colors = lightColors;

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
  },
  caption: {
    fontSize: 14,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
