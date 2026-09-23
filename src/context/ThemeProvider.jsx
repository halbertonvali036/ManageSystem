import { useCallback, useEffect, useMemo, useState } from 'react'
import ThemeContext from '@/context/ThemeContext'
import {
  applyThemeAttribute,
  persistTheme,
  readAppliedTheme,
  readStoredTheme,
  updateThemeMeta,
} from '@/utils/theme'

const ANIM_CLASS = 'theme-anim'
const ANIM_DURATION = 360

function useSystemThemePreference() {
  const [prefersDark, setPrefersDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event) => setPrefersDark(event.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return prefersDark ? 'dark' : 'light'
}

function ThemeProvider({ children }) {
  // The user's explicit choice ("light" | "dark"), or null while no choice
  // has been saved yet (in which case the OS preference wins).
  const [explicitTheme, setExplicitTheme] = useState(() => readStoredTheme())
  const systemTheme = useSystemThemePreference()

  const theme = explicitTheme ?? systemTheme

  const apply = useCallback((nextTheme) => {
    applyThemeAttribute(nextTheme)
    updateThemeMeta(nextTheme)
  }, [])

  // Sync the applied DOM theme with the resolved theme (external system).
  useEffect(() => {
    if (readAppliedTheme() !== theme) {
      apply(theme)
    }
  }, [theme, apply])

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark'
    const root = document.documentElement

    root.classList.add(ANIM_CLASS)
    window.setTimeout(() => root.classList.remove(ANIM_CLASS), ANIM_DURATION)

    apply(next)
    persistTheme(next)
    setExplicitTheme(next)
  }, [theme, apply])

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export default ThemeProvider