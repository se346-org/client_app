import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import "intl-pluralrules";

// Import translations
import enTranslation from "./locales/en.json";
import viTranslation from "./locales/vi.json";

const resources = {
  en: {
    translation: enTranslation,
  },
  vi: {
    translation: viTranslation,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: Localization.locale.split("-")[0], // Get language code from device locale
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: "v3",
});

export default i18n;
