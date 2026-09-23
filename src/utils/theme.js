export const THEME_STORAGE_KEY = 'sms.theme'

export const THEME_META_SELECTOR = 'meta[name="theme-color"]'

export const THEME_META_LIGHT = '#f5f6fa'
export const THEME_META_DARK = '#0b101d'

export function getSystemTheme() {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark'
  }
  return 'light'
}

export function readStoredTheme() {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : null
  } catch {
    return null
  }
}

export function resolveInitialTheme() {
  return readStoredTheme() ?? getSystemTheme()
}

export function applyThemeAttribute(theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

export function readAppliedTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark'
    ? 'dark'
    : 'light'
}

export function updateThemeMeta(theme) {
  const meta = document.querySelector(THEME_META_SELECTOR)
  if (meta) {
    meta.setAttribute('content', theme === 'dark' ? THEME_META_DARK : THEME_META_LIGHT)
  }
}

export function persistTheme(theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    /* storage unavailable — theme still applies for the session */
  }
}