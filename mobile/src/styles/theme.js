/**
 * PayVault Mobile Design System & Theme Tokens
 * Direct native mapping of web CSS variables from index.css
 */

export const colors = {
  // Brand colors
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  primaryLight: '#eff6ff',
  primaryBorder: '#bfdbfe',

  // Backgrounds
  background: '#f4f6fa',
  card: '#ffffff',
  inputBg: '#f8fafc',
  pillBg: '#f1f5f9',
  pillActive: '#2563eb',

  // Typography
  textMain: '#0f172a',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  textInverse: '#ffffff',

  // Borders
  borderSubtle: '#e2e8f0',
  borderCard: '#e5e7eb',
  borderFocus: '#3b82f6',

  // Status Colors
  success: '#10b981',
  successLight: '#ecfdf5',
  successBorder: '#a7f3d0',

  danger: '#ef4444',
  dangerLight: '#fef2f2',
  dangerDark: '#dc2626',
  dangerBorder: '#fecaca',

  warning: '#f59e0b',
  warningLight: '#fffbeb',
  warningBorder: '#fde68a',

  // Payment Channel Accent Colors & Backgrounds
  channels: {
    Bank: {
      color: '#2563eb',
      bg: '#eff6ff',
      border: '#bfdbfe',
    },
    Paytm: {
      color: '#0284c7',
      bg: '#f0f9ff',
      border: '#bae6fd',
    },
    UPI: {
      color: '#7c3aed',
      bg: '#f5f3ff',
      border: '#ddd6fe',
    },
    PayPal: {
      color: '#1e40af',
      bg: '#eef2ff',
      border: '#c7d2fe',
    },
    USDT: {
      color: '#059669',
      bg: '#ecfdf5',
      border: '#a7f3d0',
    },
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  card: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  float: {
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  modal: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
};

export const typography = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    title: 28,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extraBold: '800',
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
};
