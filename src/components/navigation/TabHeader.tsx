import type { ReactNode } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../contexts/ThemeContext';

const CONTENT_HEIGHT = 50;

export type TabHeaderProps = {
  title: string;
  right?: ReactNode;
};

export function TabHeader({ title, right }: TabHeaderProps) {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: palette.background,
      }}>
      <View style={styles.content}>
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          maxFontSizeMultiplier={1.4}
          style={[styles.title, { color: palette.text }]}>
          {title}
        </Text>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    height: CONTENT_HEIGHT,
    paddingHorizontal: 20,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    ...Platform.select({
      ios: { letterSpacing: -0.4 },
      default: {},
    }),
  },
  right: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
