import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Theme as NavigationTheme } from "expo-router/react-navigation";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, Platform, PlatformColor, useColorScheme } from 'react-native';
import { APP_PALETTE } from '../constants/palette';
import type { Palette } from '../constants/palette';
import {
  createNavigationTheme,
  DEFAULT_THEME_MODE,
  getAppearanceScheme,
  getStatusBarStyle,
  getThemePalette,
  isThemeMode,
  resolveTheme,
  THEME_STORAGE_KEY,
} from '../theme';
import type { AppStatusBarStyle, ResolvedTheme, ThemeMode } from '../theme';
export type { ThemeMode } from '../theme';

type ThemeContextType = {
  isDark: boolean;
  resolvedTheme: ResolvedTheme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  palette: Palette;
  navigationTheme: NavigationTheme;
  statusBarStyle: AppStatusBarStyle;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  resolvedTheme: 'light',
  themeMode: DEFAULT_THEME_MODE,
  setThemeMode: () => {},
  palette: APP_PALETTE,
  navigationTheme: createNavigationTheme('light', APP_PALETTE),
  statusBarStyle: 'dark',
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(DEFAULT_THEME_MODE);
  const resolvedTheme = resolveTheme(themeMode, systemColorScheme);
  const isDark = resolvedTheme === 'dark';
  const palette = getThemePalette(resolvedTheme);
  const statusBarStyle = getStatusBarStyle(resolvedTheme);
  const navigationTheme = useMemo(
    () => createNavigationTheme(resolvedTheme, palette),
    [palette, resolvedTheme]
  );

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((v) => {
      if (isThemeMode(v)) {
        setThemeModeState(v);
      }
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    Appearance.setColorScheme(getAppearanceScheme(themeMode));
  }, [themeMode]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => undefined);
  };

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        resolvedTheme,
        themeMode,
        setThemeMode,
        palette,
        navigationTheme,
        statusBarStyle,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

export function useButtonBlue() {
  const { isDark } = useTheme();
  return Platform.OS === 'ios' ? PlatformColor('systemBlue') : isDark ? '#0A84FF' : '#007AFF';
}
