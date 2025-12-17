export const palette = {
  surface: '#FFFFFF',
  surfaceSubtle: '#F8F9FC',
  chipBackground: '#F5F6FA',
  neutralLight: '#EBEBEB',
  navy: '#202F46',
  navyMuted: '#2F5A9C',
  blueBright: '#3DA7FF',
  textMuted: '#4D566D',
  textSecondary: '#6B7388',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
  pill: 999,
};

export const buttons = {
  primaryBackground: palette.navyMuted,
  primaryText: palette.surface,
  secondaryBackground: palette.neutralLight,
  secondaryText: palette.navy,
};

export const typography = {
  headline: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: palette.navy,
  },
  body: {
    fontSize: 16,
    color: palette.textMuted,
  },
};

