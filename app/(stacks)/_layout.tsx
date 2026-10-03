import { Stack } from 'expo-router';
import AppStackHeader from '../../src/components/navigation/AppStackHeader';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function StacksLayout() {
  const { palette, statusBarStyle } = useTheme();

  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: palette.background },
        header: (props) => <AppStackHeader {...props} showBackButton />,
        statusBarStyle,
      }}
    />
  );
}
