import { Ionicons } from '@expo/vector-icons';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import { useMenuPanel } from '../../contexts/MenuPanelContext';
import { useTheme } from '../../contexts/ThemeContext';

const HeaderMenuButton = memo(function HeaderMenuButton() {
  const { openMenu } = useMenuPanel();
  const { palette } = useTheme();
  const { t } = useTranslation();

  const handlePress = useCallback(() => {
    openMenu();
  }, [openMenu]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('menu.open')}
      hitSlop={8}
      onPress={handlePress}
      style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
    >
      <Ionicons name="menu-outline" size={28} color={palette.text} />
    </Pressable>
  );
});

HeaderMenuButton.displayName = 'HeaderMenuButton';

export default HeaderMenuButton;
