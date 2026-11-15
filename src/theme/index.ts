import { DarkTheme, DefaultTheme, type Theme as NavigationTheme } from "expo-router/react-navigation";
import type { Appearance, ColorSchemeName } from 'react-native';
import { APP_PALETTE, DARK_PALETTE } from '../constants/palette';
import type { Palette } from '../constants/palette';

export type ThemeMode = 'system' | 'dark' | 'light';
export type ResolvedTheme = 'dark' | 'light';
export type AppStatusBarStyle = 'dark' | 'light';

export const DEFAULT_THEME_MODE: ThemeMode = 'system';
export const THEME_STORAGE_KEY = 'app_theme';

export function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'system' || value === 'dark' || value === 'light';
}

export function getAppearanceScheme(themeMode: ThemeMode): Parameters<typeof Appearance.setColorScheme>[0] {
  return themeMode === 'system' ? 'unspecified' : themeMode;
}

export function resolveTheme(themeMode: ThemeMode, systemColorScheme: ColorSchemeName | null | undefined): ResolvedTheme {
  if (themeMode !== 'system') return themeMode;
  return systemColorScheme === 'dark' ? 'dark' : 'light';
}

export function getThemePalette(resolvedTheme: ResolvedTheme): Palette {
  return resolvedTheme === 'dark' ? DARK_PALETTE : APP_PALETTE;
}

export function getStatusBarStyle(resolvedTheme: ResolvedTheme): AppStatusBarStyle {
  return resolvedTheme === 'dark' ? 'light' : 'dark';
}

export function createNavigationTheme(resolvedTheme: ResolvedTheme, palette: Palette): NavigationTheme {
  const baseTheme = resolvedTheme === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...baseTheme,
    dark: resolvedTheme === 'dark',
    colors: {
      ...baseTheme.colors,
      primary: palette.primary,
      background: palette.background,
      card: palette.card,
      text: palette.text,
      border: palette.border,
      notification: palette.error,
    },
  };
}
