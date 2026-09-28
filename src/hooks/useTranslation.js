import { useContext } from 'react'
import LocaleContext from '@/context/LocaleContext'

/**
 * Reads the active locale from the single LocaleProvider.
 *
 * `t` is memoized per locale, so components can call it during render without
 * creating new objects on every pass.
 */
export function useTranslation() {
  const { locale, setLocale, toggleLocale, t } = useContext(LocaleContext)

  return { locale, setLocale, toggleLocale, t }
}

export default useTranslation
