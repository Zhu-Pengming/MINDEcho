import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          // English translations will go here
        }
      },
      zh: {
        translation: {
          // Chinese translations will go here
        }
      }
    }
  });

export default i18n;