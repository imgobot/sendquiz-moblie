import { useEffect } from 'react';
import { ThemeProvider as NavigationThemeProvider } from "expo-router/react-navigation";
import { usePathname } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import * as SystemUI from 'expo-system-ui';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../src/i18n';
import { LanguageProvider } from '../src/contexts/LanguageContext';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import AppDrawerContent from '../src/components/navigation/AppDrawerContent';
import { QuizThreadProvider } from '../src/contexts/QuizThreadContext';
import { startAdMobIfNeeded } from '../src/utils/adMobStartup';

function RootNavigator() {
  const pathname = usePathname();
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
              <Drawer
                drawerContent={(props) => <AppDrawerContent {...props} />}
                screenOptions={{
                  headerShown: false,
                  swipeEnabled: pathname === '/',
                  drawerStyle: { backgroundColor: palette.background },
                }}
              >
                <Drawer.Screen name="(main)" />
              </Drawer>
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
