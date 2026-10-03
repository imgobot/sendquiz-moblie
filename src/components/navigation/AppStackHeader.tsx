import { Ionicons } from '@expo/vector-icons';
import type { NativeStackHeaderProps } from 'expo-router/build/react-navigation/native-stack';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import HeaderMenuButton from './HeaderMenuButton';

type AppStackHeaderProps = NativeStackHeaderProps & {
  showBackButton?: boolean;
  showBrandTitle?: boolean;
  showMenuButton?: boolean;
};

export default function AppStackHeader({
  navigation,
  route,
  options,
  back,
  showBackButton = false,
  showBrandTitle = false,
  showMenuButton = false,
}: AppStackHeaderProps) {
  const router = useRouter();
  const { palette } = useTheme();
  const { t } = useTranslation();
  const title = typeof options.title === 'string' ? options.title : route.name;
  const canGoBack = Boolean(back) || navigation.canGoBack() || router.canGoBack();
  const shouldShowBackButton = showBackButton && canGoBack;
  const shouldShowBrandTitle = showBrandTitle && !title && !shouldShowBackButton;
  const headerRight = options.headerRight?.({ tintColor: palette.text, canGoBack });

  const handleGoBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    if (router.canGoBack()) {
      router.back();
    }
  }, [navigation, router]);

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: palette.card }]}>
      <View style={styles.container}>
        {shouldShowBackButton ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('navigation.goBack')}
            hitSlop={8}
            onPress={handleGoBack}
            style={styles.iconButton}
          >
            <Ionicons name="chevron-back" size={28} color={palette.text} />
          </Pressable>
        ) : shouldShowBrandTitle ? (
          <View style={styles.brandContainer}>
            {showMenuButton ? <HeaderMenuButton /> : null}
            <Text numberOfLines={1} style={[styles.brandText, { color: palette.text }]}>
              SEND
            </Text>
          </View>
        ) : showMenuButton ? (
          <View style={styles.iconButton}>
            <HeaderMenuButton />
          </View>
        ) : (
          <View style={styles.iconButton} />
        )}
        {shouldShowBrandTitle ? (
          <View style={styles.titleSpacer} />
        ) : (
          <Text numberOfLines={1} style={[styles.title, { color: palette.text }]}>
            {title}
          </Text>
        )}
        <View style={styles.rightSlot}>{headerRight}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    width: '100%',
  },
  container: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandContainer: {
    minWidth: 132,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    flexShrink: 1,
    paddingHorizontal: 4,
    fontSize: 20,
    fontWeight: '800',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  titleSpacer: {
    flex: 1,
  },
  rightSlot: {
    width: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
