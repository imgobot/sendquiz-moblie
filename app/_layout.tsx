import { useEffect } from 'react';
import { ThemeProvider as NavigationThemeProvider } from "expo-router/react-navigation";
import { Stack } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../src/i18n';
import { LanguageProvider } from '../src/contexts/LanguageContext';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import { startAdMobIfNeeded } from '../src/utils/adMobStartup';

function RootStack() {
  const { navigationTheme, palette, statusBarStyle } = useTheme();

  useEffect(() => {
    void (async () => {
      try {
        await startAdMobIfNeeded();
      } catch (error) {
        console.warn('ADMOB_STARTUP_FAILED', error);
      }
    })();
  }, []);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(palette.background).catch((error) => {
      console.warn('SYSTEM_UI_BACKGROUND_FAILED', error);
    });
  }, [palette.background]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.background }}>
      <NavigationThemeProvider value={navigationTheme}>
        <SafeAreaProvider>
          <KeyboardProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: palette.background },
                statusBarStyle,
              }}
            >
              <Stack.Screen name="(drawer)" />
              <Stack.Screen
                name="(stacks)"
                options={{ animation: 'slide_from_right' }}
              />
            </Stack>
          </KeyboardProvider>
        </SafeAreaProvider>
      </NavigationThemeProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <RootStack />
      </ThemeProvider>
    </LanguageProvider>
  );
}
