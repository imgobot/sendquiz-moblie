import { Stack } from 'expo-router';
import { View } from 'react-native';
import AppMenuPanel from '../../src/components/navigation/AppMenuPanel';
import { MenuPanelProvider } from '../../src/contexts/MenuPanelContext';
import { QuizThreadProvider } from '../../src/contexts/QuizThreadContext';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function DrawerLayout() {
  const { palette } = useTheme();

  return (
    <MenuPanelProvider>
      <QuizThreadProvider>
        <View style={{ flex: 1, backgroundColor: palette.background }}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: palette.background },
            }}
          >
            <Stack.Screen name="(home)" />
          </Stack>
          <AppMenuPanel />
        </View>
      </QuizThreadProvider>
    </MenuPanelProvider>
  );
}
