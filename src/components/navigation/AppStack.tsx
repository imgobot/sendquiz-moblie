import { Stack } from 'expo-router';
import type { ReactNode } from 'react';
import { PAGE_INSET } from '../../constants/layout';
import { useTheme } from '../../contexts/ThemeContext';

export default function AppStack({ children }: { children?: ReactNode }) {
  const { palette, statusBarStyle } = useTheme();

  return (
    <Stack screenOptions={({ route }) => ({
      title: '',
      headerTransparent: true,
      contentStyle: [
        { backgroundColor: palette.background },
        route.name !== '(tabs)' && PAGE_INSET,
      ],
      headerTintColor: palette.text,
      headerBackButtonDisplayMode: 'minimal',
      statusBarStyle,
    })}>{children}</Stack>
  );
}
