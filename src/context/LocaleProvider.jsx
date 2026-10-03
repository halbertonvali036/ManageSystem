import { useCallback, useEffect, useMemo, useState } from 'react'
import LocaleContext from '@/context/LocaleContext'
import { translate } from '@/i18n/dictionary'
import { getAlternateLocale, isSupportedLocale } from '@/models/locale'
import {
  applyDocumentLocale,
  persistLocale,
  readAppliedLocale,
  resolveInitialLocale,
} from '@/utils/locale'

/**
 * Locale provider.
 *
 * The single owner of the active language. Components read it through
 * `useTranslation`, so no component owns language-switch behaviour of its own.
 */
function LocaleProvider({ children }) {
  // Resolved through one helper so the stored locale, the `az` default and the
  // pre-paint script in index.html cannot drift apart. AZ always means
  // Azerbaijani and EN always means English; anything unrecognised in storage
  // falls back to the product's first language rather than to whatever was there.
  const [locale, setLocaleState] = useState(resolveInitialLocale)

  useEffect(() => {
    if (readAppliedLocale() !== locale) {
      applyDocumentLocale(locale)
    }
  }, [locale])

  const setLocale = useCallback((nextLocale) => {
    if (!isSupportedLocale(nextLocale)) {
      return
    }
    persistLocale(nextLocale)
    setLocaleState(nextLocale)
  }, [])

  /** Convenience for the single-button switcher. */
  const toggleLocale = useCallback(() => {
    setLocale(getAlternateLocale(locale))
  }, [locale, setLocale])

  const t = useCallback(
    (key, values) => translate(key, locale, values),
    [locale],
  )

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale, t }),
    [locale, setLocale, toggleLocale, t],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export default LocaleProvider
