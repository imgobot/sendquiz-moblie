import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ko from '../locales/ko.json';
import en from '../locales/en.json';
import ja from '../locales/ja.json';
import zh from '../locales/zh.json';
import hi from '../locales/hi.json';
import ptBR from '../locales/pt-BR.json';
import id from '../locales/id.json';
import es from '../locales/es.json';
import tr from '../locales/tr.json';
import de from '../locales/de.json';

const LANGUAGE_KEY = 'app_language';

const resources = {
  ko: { translation: ko },
  en: { translation: en },
  ja: { translation: ja },
  zh: { translation: zh },
  hi: { translation: hi },
  'pt-BR': { translation: ptBR },
  id: { translation: id },
  es: { translation: es },
  tr: { translation: tr },
  de: { translation: de },
};

const getDeviceLanguage = (): string => {
  const locale = getLocales()[0]?.languageCode ?? 'ko';
  return locale in resources ? locale : 'ko';
};

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: 'ko',
  interpolation: { escapeValue: false },
});

export const loadSavedLanguage = async () => {
  const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
  if (saved && saved in resources) {
    i18n.changeLanguage(saved);
  }
};

export const changeLanguage = async (lang: string) => {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  i18n.changeLanguage(lang);
};

export const getCurrentLanguage = () => i18n.language;

export default i18n;
