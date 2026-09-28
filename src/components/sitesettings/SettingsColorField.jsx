import { useState } from 'react'
import useTranslation from '@/hooks/useTranslation'
import { expandBrandHex, isValidBrandColor } from '@/models/siteSettings'
import SettingsField from '@/components/sitesettings/SettingsField'

/**
 * The brand colour control: a native swatch and a text field that agree.
 *
 * The text field holds a draft, for the same reason the editor's colour field
 * does. A hex code is typed one character at a time, and `#`, `#1` and `#12` are
 * all steps on the way to a colour rather than colours themselves. A field bound
 * straight to the stored value would reject each of those keystrokes and be
 * rewritten under the user, making the code impossible to type at all. The draft
 * is committed as soon as it becomes a valid hex, and thrown away on blur if it
 * never did.
 *
 * The swatch is disabled while the value is not a colour rather than showing
 * black, because a black square next to an empty field reads as a deliberate
 * choice of black.
 */
function SettingsColorField({ id, label, hint, value, onChange, onClear }) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState(value ?? '')

  const swatchValue = isValidBrandColor(value) ? expandBrandHex(value) : ''
  const isDraftInvalid = draft !== '' && !isValidBrandColor(draft)

  const commitDraft = (next) => {
    setDraft(next)
    if (next === '' || isValidBrandColor(next)) {
      onChange(next)
    }
  }

  return (
    <SettingsField id={id} label={label} hint={hint}>
      <div className="settings-color">
        <label className="editor-visually-hidden" htmlFor={id}>
          {t('siteSettings.color.swatchLabel')}
        </label>
        <input
          id={id}
          type="color"
          className="settings-color__swatch"
          value={swatchValue || '#000000'}
          disabled={!swatchValue}
          onChange={(event) => onChange(event.target.value)}
        />
        <label className="editor-visually-hidden" htmlFor={`${id}-text`}>
          {t('siteSettings.color.valueLabel')}
        </label>
        <input
          id={`${id}-text`}
          type="text"
          className="editor-input editor-input--compact"
          value={draft}
          placeholder="#0a140d"
          aria-invalid={isDraftInvalid}
          onChange={(event) => commitDraft(event.target.value)}
          onBlur={() => setDraft(value ?? '')}
        />
        {onClear ? (
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={() => {
              setDraft('')
              onClear()
            }}
          >
            {t('siteSettings.color.clear')}
          </button>
        ) : null}
      </div>
      {isDraftInvalid ? (
        <p className="settings-field__error" role="status">
          {t('siteSettings.color.invalid')}
        </p>
      ) : null}
    </SettingsField>
  )
}

export default SettingsColorField
