import { Languages } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import {
  LOCALE_LABELS,
  LOCALE_SHORT_LABELS,
  SUPPORTED_LOCALES,
} from '@/models/locale'

/**
 * Language control: a segmented pair, AZ / EN.
 *
 * It is a pair of explicit options rather than one button that flips to the
 * other language. A toggle has to be read as "the language I will get" while
 * looking like "the language I have", and people get that backwards — which is
 * exactly the reported bug: pressing the control on an Azerbaijani page seemed
 * to switch *to* Azerbaijani. Naming both options and marking the active one
 * removes the ambiguity, because there is no longer a direction to misread.
 *
 * Every option calls `setLocale` with its own locale rather than flipping
 * whatever is current, so the control is correct even if the provider and the
 * DOM disagree — a mismatch shows up as the wrong one highlighted instead of a
 * language that is neither. The active option is marked with `aria-pressed`, and
 * the full language name rides along for assistive technology next to the
 * two-letter code a sighted reader scans for.
 *
 * `LocaleProvider` owns persistence; this component only selects.
 */
function LanguageSwitcher({ className = '', variant = 'default' }) {
  const { locale, setLocale, t } = useTranslation()

  return (
    <div
      className={`language-switcher language-switcher--${variant}${
        className ? ` ${className}` : ''
      }`}
      role="group"
      aria-label={t('language.label')}
    >
      <Languages className="language-switcher__icon" size={16} aria-hidden="true" />
      <div className="language-switcher__options">
        {SUPPORTED_LOCALES.map((option) => {
          const isActive = option === locale
          return (
            <button
              key={option}
              type="button"
              className={`language-switcher__option${
                isActive ? ' language-switcher__option--active' : ''
              }`}
              onClick={() => setLocale(option)}
              // The visible code is a language code, not a label for a control.
              // `lang` tells the screen reader to pronounce "AZ" in Azerbaijani
              // and "EN" in English; `aria-pressed` states which one is active.
              lang={option}
              dir="ltr"
              aria-pressed={isActive}
              title={LOCALE_LABELS[option]}
            >
              <span aria-hidden="true">{LOCALE_SHORT_LABELS[option]}</span>
              <span className="visually-hidden">{LOCALE_LABELS[option]}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default LanguageSwitcher