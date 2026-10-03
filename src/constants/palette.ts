export const APP_PALETTE = {
  // Base colors
  background: '#FFFFFF',
  card: '#FFFFFF',
  surface: '#EEF2FB',
  border: '#D7DFED',
  text: '#1B2533',
  muted: '#5F6977',

  // Primary
  primary: '#4B7AF9',
  primaryText: '#FFFFFF',
  primaryDark: '#6366F1',

  // Secondary
  secondary: '#83C5FF',
  secondaryText: '#10324C',

  // Accent
  accent: '#E7EEFF',
  accentText: '#2B3D5C',

  // Buttons
  buttonPrimary: '#4B7AF9',
  buttonSecondary: '#E1E8F7',

  // Status colors
  error: '#EF4444',
  errorDark: '#DC2626',
  errorLight: '#B91C1C',
  errorBg: '#FEE2E2',
  success: '#16A34A',
  successLight: '#2e7d32',
  successBg: '#D1FAE5',
  warning: '#D97706',
  warningBg: '#FEF3C7',

  // Gray scale
  gray50: '#F9FAFB',
  gray100: '#f8fafc',
  gray200: '#f1f5f9',
  gray300: '#E5E7EB',
  gray400: '#D1D5DB',
  gray500: '#9CA3AF',
  gray600: '#6B7280',
  gray700: '#374151',
  gray800: '#111827',
  gray900: '#0f172a',

  // Input
  inputBg: '#f5f5f5',
  inputBorder: '#e2e8f0',
  placeholder: '#94a3b8',

  // Icon
  icon: '#7A8AA6',
  iconMuted: '#ADB5BD',

  // Switch
  switchTrackOff: '#CBD2E1',

  // Overlay
  overlayBg: '#0008',
} satisfies Record<string, string>;

export type Palette = typeof APP_PALETTE;

export const DARK_PALETTE: Palette = {
  ...APP_PALETTE,
  background: '#000000',
  card: '#000000',
  surface: '#000000',
  border: '#3f3f46',
  text: '#f8fafc',
  muted: '#71717a',
  primary: '#38bdf8',
  primaryText: '#0f172a',
  primaryDark: '#0ea5e9',
  secondary: '#18181B',
  secondaryText: '#f8fafc',
  accent: '#000000',
  accentText: '#38bdf8',
  buttonPrimary: '#38bdf8',
  buttonSecondary: '#000000',
  error: '#f87171',
  errorDark: '#f87171',
  errorLight: '#f87171',
  errorBg: '#000000',
  success: '#4ade80',
  successLight: '#4ade80',
  successBg: '#000000',
  warning: '#fb923c',
  warningBg: '#000000',
  gray50: '#000000',
  gray100: '#000000',
  gray200: '#18181B',
  gray300: '#3f3f46',
  gray400: '#52525b',
  gray500: '#71717a',
  gray600: '#71717a',
  gray700: '#d4d4d8',
  gray800: '#f8fafc',
  gray900: '#f8fafc',
  inputBg: '#000000',
  inputBorder: '#52525b',
  placeholder: '#71717a',
  icon: '#71717a',
  iconMuted: '#71717a',
  switchTrackOff: '#3f3f46',
};
