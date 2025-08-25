import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enLang from "./locales/en/en.json";
import hiLang from "./locales/hi/hi.json";

const resources = {
  en: {
    translation: enLang,
  },
  hi: {
    translation: hiLang,
  },
};

// Get saved language from localStorage or default to English
const savedLanguage = localStorage.getItem("language") || "en";

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: "en",

    interpolation: {
      escapeValue: false
    }
  });