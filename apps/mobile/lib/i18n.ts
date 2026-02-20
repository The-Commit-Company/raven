/**
 * Frappe-style i18n integration for React Native
 *
 * This module integrates with Frappe's translation system by:
 * 1. Using the same string-as-key format as Frappe: __("English string")
 * 2. Fetching translations from the Frappe server (when available)
 * 3. Falling back to bundled translations when offline
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Shared translations with Frappe (single source of truth)
// Location: raven/locale/translations/ (symlinked to mobile/locales/)
import en from "../locales/en.json";
import fr from "../locales/fr.json";

// Storage keys
const LANGUAGE_KEY = "user-language";
const TRANSLATIONS_CACHE_KEY = "translations-cache";
const TRANSLATIONS_CACHE_TIMESTAMP = "translations-timestamp";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Type for translations
type Translations = Record<string, string>;

// Supported languages with bundled translations
const bundledResources: Record<string, Translations> = {
  en,
  fr,
};

/**
 * Get the device language code
 */
const getDeviceLanguage = (): string => {
  const locale = Localization.getLocales()[0];
  const languageCode = locale?.languageCode || "en";
  // Only return supported languages
  return languageCode in bundledResources ? languageCode : "en";
};

/**
 * Fetch translations from Frappe server
 * Frappe provides translations via /api/method/frappe.translate.get_all_translations
 */
export const fetchTranslationsFromServer = async (
  siteUrl: string,
  language: string
): Promise<Translations | null> => {
  try {
    const response = await fetch(
      `${siteUrl}/api/method/frappe.translate.get_all_translations?lang=${language}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.warn(`Failed to fetch translations: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.message) {
      return data.message as Translations;
    }

    return null;
  } catch (error) {
    console.warn("Error fetching translations from server:", error);
    return null;
  }
};

/**
 * Cache translations to AsyncStorage
 */
const cacheTranslations = async (
  language: string,
  translations: Translations
): Promise<void> => {
  try {
    const existingCache = await AsyncStorage.getItem(TRANSLATIONS_CACHE_KEY);
    const cache = existingCache ? JSON.parse(existingCache) : {};
    cache[language] = translations;

    await AsyncStorage.setItem(TRANSLATIONS_CACHE_KEY, JSON.stringify(cache));
    await AsyncStorage.setItem(
      TRANSLATIONS_CACHE_TIMESTAMP,
      Date.now().toString()
    );
  } catch (error) {
    console.warn("Error caching translations:", error);
  }
};

/**
 * Load cached translations from AsyncStorage
 */
const loadCachedTranslations = async (
  language: string
): Promise<Translations | null> => {
  try {
    const timestamp = await AsyncStorage.getItem(TRANSLATIONS_CACHE_TIMESTAMP);
    if (timestamp) {
      const cacheAge = Date.now() - parseInt(timestamp, 10);
      if (cacheAge > CACHE_DURATION) {
        return null;
      }
    }

    const cache = await AsyncStorage.getItem(TRANSLATIONS_CACHE_KEY);
    if (cache) {
      const parsed = JSON.parse(cache);
      return parsed[language] || null;
    }
    return null;
  } catch (error) {
    console.warn("Error loading cached translations:", error);
    return null;
  }
};

// Initialize i18n with Frappe-style configuration
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: getDeviceLanguage(),
  fallbackLng: "en",
  // IMPORTANT: Frappe style uses the source string as key
  // No namespace separator or key separator
  nsSeparator: false,
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  // Return key if translation not found (shows English text)
  returnEmptyString: false,
  returnNull: false,
});

/**
 * Load saved language preference
 */
export const loadSavedLanguage = async (): Promise<void> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage) {
      // Try to load cached translations first
      const cachedTranslations = await loadCachedTranslations(savedLanguage);
      if (cachedTranslations) {
        i18n.addResourceBundle(
          savedLanguage,
          "translation",
          cachedTranslations,
          true,
          true
        );
      }
      await i18n.changeLanguage(savedLanguage);
    }
  } catch (error) {
    console.error("Failed to load saved language:", error);
  }
};

/**
 * Load translations from server and update i18next
 * Call this after the user logs in and we have the site URL
 */
export const loadServerTranslations = async (siteUrl: string): Promise<void> => {
  const language = i18n.language;

  if (language === "en") {
    // English is the source language, no need to fetch
    return;
  }

  const serverTranslations = await fetchTranslationsFromServer(siteUrl, language);

  if (serverTranslations) {
    await cacheTranslations(language, serverTranslations);
    i18n.addResourceBundle(language, "translation", serverTranslations, true, true);
    console.log(
      `Loaded ${Object.keys(serverTranslations).length} translations for ${language}`
    );
  }
};

/**
 * Save language preference and change language
 */
export const saveLanguage = async (language: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error("Failed to save language:", error);
  }
};

/**
 * Get current language
 */
export const getCurrentLanguage = (): string => {
  return i18n.language;
};

/**
 * Get available languages
 */
export const getAvailableLanguages = (): { code: string; name: string }[] => {
  return [
    { code: "en", name: "English" },
    { code: "fr", name: "Français" },
  ];
};

// Re-export useTranslation for components that need to react to language changes
export { useTranslation } from "react-i18next";

/**
 * Translation function - Frappe style
 * This is a simple wrapper that works but doesn't trigger re-renders.
 * For components, use the __ from useTranslation() hook instead.
 *
 * Usage in components:
 * const { t: __ } = useTranslation();
 * __("Hello World")
 */
export const __ = (
  key: string,
  options?: Record<string, unknown>
): string => {
  return i18n.t(key, options);
};

export default i18n;
