import { Stack } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import AppStackHeader from './AppStackHeader';
import HeaderSettingsButton from './HeaderSettingsButton';

export default function AppHomeStackLayout() {
  const { palette, statusBarStyle } = useTheme();

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: palette.background },
        headerRight: () => <HeaderSettingsButton />,
        header: (props) => <AppStackHeader {...props} showBackButton showBrandTitle showMenuButton />,
        statusBarStyle,
      }}
    >
      <Stack.Screen name="index" options={{ title: '' }} />
      <Stack.Screen name="rename-chat" options={{ title: '', headerRight: () => null }} />
      <Stack.Screen name="edit-quiz-item" options={{ title: '', headerRight: () => null }} />
    </Stack>
  );
}
