import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "../locales/en.json";
import fr from "../locales/fr.json";

const LANGUAGE_KEY = "user-language";

const resources = {
  en: { translation: en },
  fr: { translation: fr },
};

// Get the device language or fallback to English
const getDeviceLanguage = (): string => {
  const locale = Localization.getLocales()[0];
  const languageCode = locale?.languageCode || "en";
  // Only return supported languages
  return languageCode in resources ? languageCode : "en";
};

// Initialize i18n
i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

// Load saved language preference
export const loadSavedLanguage = async (): Promise<void> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage && savedLanguage in resources) {
      await i18n.changeLanguage(savedLanguage);
    }
  } catch (error) {
    console.error("Failed to load saved language:", error);
  }
};

// Save language preference
export const saveLanguage = async (language: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error("Failed to save language:", error);
  }
};

// Get current language
export const getCurrentLanguage = (): string => {
  return i18n.language;
};

// Get available languages
export const getAvailableLanguages = (): { code: string; name: string }[] => {
  return [
    { code: "en", name: "English" },
    { code: "fr", name: "Français" },
  ];
};

export default i18n;
