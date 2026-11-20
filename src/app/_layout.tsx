import { useEffect } from 'react';
import { ThemeProvider as NavigationThemeProvider } from "expo-router/react-navigation";
import { Stack } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../i18n';
import AppStack from '../components/navigation/AppStack';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { QuizThreadProvider } from '../contexts/QuizThreadContext';
import { startAdMobIfNeeded } from '../utils/adMobStartup';

export const unstable_settings = { anchor: '(tabs)' };

function RootNavigator() {
  const { navigationTheme, palette } = useTheme();

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
            <QuizThreadProvider>
              <AppStack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </AppStack>
            </QuizThreadProvider>
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
        <RootNavigator />
      </ThemeProvider>
    </LanguageProvider>
  );
}
