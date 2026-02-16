import { createI18n } from 'vue-i18n'
import cs from './locales/cs'
import en from './locales/en'

// Get saved language preference from localStorage, default to Czech
const savedLocale = localStorage.getItem('fleetview-locale') || 'cs'

const i18n = createI18n({
  legacy: false,          // Use Composition API mode
  locale: savedLocale,
  fallbackLocale: 'cs',
  messages: { cs, en },
})

export default i18n
