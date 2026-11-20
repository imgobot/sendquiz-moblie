import { Stack } from 'expo-router';
import type { ReactNode } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function AppStack({ children }: { children?: ReactNode }) {
  const { palette, statusBarStyle } = useTheme();

  return (
    <Stack screenOptions={{
      title: '',
      headerTransparent: true,
      contentStyle: { backgroundColor: palette.background },
      headerTintColor: palette.text,
      headerBackButtonDisplayMode: 'minimal',
      statusBarStyle,
    }}>{children}</Stack>
  );
}
