export const LOCALES = Object.freeze({
  AZ: 'az',
  EN: 'en',
})

/** Azerbaijani is the product's first language. English is the secondary one. */
export const DEFAULT_LOCALE = LOCALES.AZ

export const SUPPORTED_LOCALES = Object.freeze([LOCALES.AZ, LOCALES.EN])

export const LOCALE_LABELS = Object.freeze({
  [LOCALES.AZ]: 'Azərbaycanca',
  [LOCALES.EN]: 'English',
})

/** Short codes for the compact switcher control. */
export const LOCALE_SHORT_LABELS = Object.freeze({
  [LOCALES.AZ]: 'AZ',
  [LOCALES.EN]: 'EN',
})

export const LOCALE_STORAGE_KEY = 'sms.locale'

export const HTML_LANG_ATTRIBUTE = 'lang'

export const isSupportedLocale = (value) =>
  SUPPORTED_LOCALES.includes(value)

/** The other language, used by the single-button switcher. */
export const getAlternateLocale = (locale) =>
  locale === LOCALES.EN ? LOCALES.AZ : LOCALES.EN
