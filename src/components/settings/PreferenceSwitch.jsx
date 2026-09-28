import { useId } from 'react'
import useTranslation from '@/hooks/useTranslation'

/**
 * Boolean preference control.
 *
 * A real checkbox is used so keyboard support, focus and form semantics come
 * from the platform. `role="switch"` states that the change takes effect
 * immediately rather than needing a separate submit.
 *
 * `unknown` renders the neutral "not loaded" state: the control is disabled and
 * says so, instead of implying a preference is on or off.
 */
function PreferenceSwitch({
  label,
  description,
  checked = false,
  unknown = false,
  disabled = false,
  isPending = false,
  onChange,
}) {
  const inputId = useId()
  const { t } = useTranslation()
  const descriptionId = useId()
  const hintId = useId()
  const isDisabled = disabled || unknown
  const hint = unknown
    ? t('accountPolish.preferenceUnknown')
    : null

  return (
    <div className="preference-row" data-state={unknown ? 'unknown' : checked ? 'on' : 'off'}>
      <label className="preference-row__label" htmlFor={inputId}>
        <span className="preference-row__text">
          <span className="preference-row__title">{label}</span>
          <span className="preference-row__description" id={descriptionId}>
            {description}
          </span>
        </span>

        <span className="preference-switch">
          <input
            id={inputId}
            type="checkbox"
            role="switch"
            className="preference-switch__input"
            checked={checked}
            disabled={isDisabled}
            aria-busy={isPending || undefined}
            aria-describedby={hint ? `${descriptionId} ${hintId}` : descriptionId}
            onChange={(event) => onChange?.(event.target.checked)}
          />
          <span className="preference-switch__track" aria-hidden="true">
            <span className="preference-switch__thumb" />
          </span>
        </span>
      </label>

      {hint ? (
        <p className="preference-row__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export default PreferenceSwitch
