import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

type MenuPanelContextValue = {
  isOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
};

const MenuPanelContext = createContext<MenuPanelContextValue | null>(null);

export function MenuPanelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openMenu = useCallback(() => setIsOpen(true), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);
  const toggleMenu = useCallback(() => setIsOpen((value) => !value), []);

  const value = useMemo(
    () => ({
      isOpen,
      openMenu,
      closeMenu,
      toggleMenu,
    }),
    [closeMenu, isOpen, openMenu, toggleMenu]
  );

  return <MenuPanelContext.Provider value={value}>{children}</MenuPanelContext.Provider>;
}

export function useMenuPanel() {
  const value = useContext(MenuPanelContext);

  if (!value) {
    throw new Error('useMenuPanel must be used inside MenuPanelProvider');
  }

  return value;
}
