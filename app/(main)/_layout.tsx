import { Stack } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';

export const unstable_settings = { anchor: 'index' };

export default function MainLayout() {
  const { palette, statusBarStyle } = useTheme();

  return (
    <Stack screenOptions={{
      title: '',
      contentStyle: { backgroundColor: palette.background },
      headerTintColor: palette.text,
      headerBackButtonDisplayMode: 'minimal',
      statusBarStyle,
    }} />
  );
}
