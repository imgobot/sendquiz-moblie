import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { changeLanguage, getCurrentLanguage, loadSavedLanguage } from '../i18n';

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState(getCurrentLanguage);

  useEffect(() => {
    loadSavedLanguage().then(() => setLang(getCurrentLanguage()));
  }, []);

  const setLanguage = useCallback(async (lang: string) => {
    await changeLanguage(lang);
    setLang(lang);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
