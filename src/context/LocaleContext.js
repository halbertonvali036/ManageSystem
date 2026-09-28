import { createContext } from 'react'

/**
 * Locale context.
 *
 * `locale` is the active language code, `setLocale` changes it and `t`
 * translates a key using the active dictionary. Keeping the whole language
 * system behind this context is what stops components from growing their own
 * ad-hoc language-switch logic.
 */
const LocaleContext = createContext({
  locale: 'az',
  setLocale: () => {},
  t: (key) => key,
})

export default LocaleContext
