import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './locales/en.json';
import mr from './locales/mr.json';
import hi from './locales/hi.json';
import kn from './locales/kn.json';

export const LANGUAGE_STORAGE_KEY = 'dentai.language';
export const SUPPORTED_LANGUAGES = ['en', 'mr', 'hi', 'kn'];

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, mr: { translation: mr }, hi: { translation: hi }, kn: { translation: kn } },
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: SUPPORTED_LANGUAGES,
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

export const loadSavedLanguage = async () => {
  const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  const language = SUPPORTED_LANGUAGES.includes(savedLanguage) ? savedLanguage : 'en';
  await i18n.changeLanguage(language);
  return language;
};

export const changeLanguage = async (language) => {
  if (!SUPPORTED_LANGUAGES.includes(language)) return;
  await i18n.changeLanguage(language);
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
};

export default i18n;