import { createContext, useContext, type ReactElement } from 'react';

export const TabAdContext = createContext<ReactElement | null>(null);

export function TabContentAd() {
  return useContext(TabAdContext);
}
