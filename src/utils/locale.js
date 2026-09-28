import {
  DEFAULT_LOCALE,
  HTML_LANG_ATTRIBUTE,
  isSupportedLocale,
  LOCALE_STORAGE_KEY,
} from '@/models/locale'

export function readStoredLocale() {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    return isSupportedLocale(stored) ? stored : null
  } catch {
    return null
  }
}

export function resolveInitialLocale() {
  return readStoredLocale() ?? DEFAULT_LOCALE
}

export function applyDocumentLocale(locale) {
  document.documentElement.setAttribute(HTML_LANG_ATTRIBUTE, locale)
}

export function readAppliedLocale() {
  const applied = document.documentElement.getAttribute(HTML_LANG_ATTRIBUTE)
  return isSupportedLocale(applied) ? applied : null
}

export function persistLocale(locale) {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    /* storage unavailable — the locale still applies for the session */
  }
}
