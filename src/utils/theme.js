export const THEME_STORAGE_KEY = 'sms.theme'

export const THEME_META_SELECTOR = 'meta[name="theme-color"]'

export const THEME_META_LIGHT = '#f4f7f4'
export const THEME_META_DARK = '#050b07'

/**
 * Dark is the design system's default. The OS preference is not consulted:
 * the neon direction reads best on the dark canvas, and light mode is the
 * deliberate alternative rather than a fallback. An explicit saved choice
 * always wins.
 */
export const DEFAULT_THEME = 'dark'

export function getSystemTheme() {
  return DEFAULT_THEME
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
  return readStoredTheme() ?? DEFAULT_THEME
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