import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Importar traducciones
import translationES from "./locales/es.json";
import translationEN from "./locales/en.json";

const resources = {
  es: {
    translation: translationES,
  },
  en: {
    translation: translationEN,
  },
};

i18n
  .use(LanguageDetector) // Detecta idioma del navegador
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "es",
    lng: localStorage.getItem("language") || "es", // Idioma guardado o español por defecto

    // Namespace support
    ns: ["translation"],
    defaultNS: "translation",

    // Debug mode for development
    debug: process.env.NODE_ENV === "development",

    interpolation: {
      escapeValue: false, // React already escapes values
      formatSeparator: ",",
    },

    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },

    // React options
    react: {
      useSuspense: false,
    },
  });

// Save language to localStorage whenever it changes
i18n.on("languageChanged", (lng) => {
  localStorage.setItem("language", lng);
});

export default i18n;
