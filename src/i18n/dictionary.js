import az from '@/i18n/locales/az'
import en from '@/i18n/locales/en'
import { DEFAULT_LOCALE, LOCALES } from '@/models/locale'

/**
 * Dictionary registry.
 *
 * Azerbaijani is the default language, so it is also the fallback whenever a
 * key is missing from a secondary language. That way a gap degrades to readable
 * copy instead of a raw translation key on screen.
 */
export const DICTIONARIES = Object.freeze({
  [LOCALES.AZ]: az,
  [LOCALES.EN]: en,
})

const resolvePath = (dictionary, key) =>
  key.split('.').reduce((node, segment) => {
    if (node && typeof node === 'object' && segment in node) {
      return node[segment]
    }
    return undefined
  }, dictionary)

const interpolate = (template, values) => {
  if (!values) {
    return template
  }
  return Object.entries(values).reduce(
    (result, [name, value]) =>
      result.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value)),
    template,
  )
}

/**
 * Translates `key` for `locale`.
 *
 * Accepts `{placeholders}` for interpolation. Never throws: an unknown key
 * returns the key itself, which makes missing copy obvious in the UI.
 */
export const translate = (key, locale, values) => {
  const primary = DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE]
  const fallback = DICTIONARIES[DEFAULT_LOCALE]
  const value = resolvePath(primary, key) ?? resolvePath(fallback, key)

  if (typeof value !== 'string') {
    return key
  }

  return interpolate(value, values)
}

export default DICTIONARIES
