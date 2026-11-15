import { useDrawerStatus, type DrawerContentComponentProps } from 'expo-router/drawer';
import { useCallback } from 'react';
import AppMenuPanelContent from './AppMenuPanelContent';

export default function AppDrawerContent({ navigation }: DrawerContentComponentProps) {
  const status = useDrawerStatus();
  const closeDrawer = useCallback(() => navigation.closeDrawer(), [navigation]);

  return (
    <AppMenuPanelContent
      isOpen={status === 'open'}
      onClose={closeDrawer}
    />
  );
}
