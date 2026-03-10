import i18n from 'i18next'
import HttpBackend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'es',
    defaultNS: 'common',
    ns: [
      'common', 'auth', 'dashboard',
      'projects', 'tasks', 'calendar', 'notes',
      'contacts', 'bookmarks', 'devops',
      'forms', 'sharing', 'audit', 'reports',
      'notifications', 'support', 'settings',
      'sidebar', 'navbar', 'validation',
    ],
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'ws-lang',
    },
  })

export default i18n
