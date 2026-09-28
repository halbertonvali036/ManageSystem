import { Languages } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import { getAlternateLocale, LOCALES } from '@/models/locale'

/**
 * Single-button language switcher.
 *
 * It only calls `toggleLocale` from the LocaleProvider, so the switching rule
 * itself lives in exactly one place. The same control is reused on the landing
 * header, the auth shell and the authenticated app header.
 */
function LanguageSwitcher({ className = '', variant = 'default' }) {
  const { locale, toggleLocale, t } = useTranslation()
  const nextLocale = getAlternateLocale(locale)
  const isAzerbaijani = locale === LOCALES.AZ
  const label = isAzerbaijani ? t('language.switchTo') : t('language.switchBack')

  return (
    <button
      type="button"
      className={`language-switcher language-switcher--${variant}${
        className ? ` ${className}` : ''
      }`}
      onClick={toggleLocale}
      aria-label={label}
      title={label}
      lang={nextLocale}
    >
      <Languages className="language-switcher__icon" size={16} aria-hidden="true" />
      <span className="language-switcher__label">
        {isAzerbaijani ? 'EN' : 'AZ'}
      </span>
    </button>
  )
}

export default LanguageSwitcher
