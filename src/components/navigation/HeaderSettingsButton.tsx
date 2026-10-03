import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo, useCallback } from 'react';
import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

const HeaderSettingsButton = memo(function HeaderSettingsButton() {
  const router = useRouter();
  const { t } = useTranslation();
  const { palette } = useTheme();

  const handlePress = useCallback(() => {
    router.push('/settings');
  }, [router]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('tab.settings')}
      hitSlop={8}
      onPress={handlePress}
      style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
    >
      <Ionicons name="settings-outline" size={24} color={palette.text} />
    </Pressable>
  );
});

HeaderSettingsButton.displayName = 'HeaderSettingsButton';

export default HeaderSettingsButton;
