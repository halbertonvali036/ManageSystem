import { useId } from 'react'
import useTranslation from '@/hooks/useTranslation'
import { BILLING_CYCLE_TOGGLE } from '@/models/billing'

const CYCLE_LABEL_KEYS = Object.freeze({
  monthly: 'accountPolish.billingCycleMonthly',
  annual: 'accountPolish.billingCycleYearly',
})

/**
 * Monthly / yearly billing cycle switch.
 *
 * Built as a native radio group rather than a row of buttons: the choice is a
 * single exclusive value, so arrow-key navigation, focus order and the announced
 * selected state come from the platform instead of being re-implemented here.
 *
 * Switching cycles only re-reads published prices — it never starts a checkout
 * and never changes what the account is billed for. That stays a decision the
 * backend owns.
 */
function BillingCycleToggle({ cycle, onChange, disabled = false }) {
  const { t } = useTranslation()
  const groupName = `${useId()}-cycle`

  return (
    <fieldset className="cycle-toggle" disabled={disabled}>
      <legend className="cycle-toggle__legend">{t('accountPolish.billingCycle')}</legend>
      <div className="cycle-toggle__options">
        {BILLING_CYCLE_TOGGLE.map((option) => {
          const isSelected = option === cycle
          return (
            <label
              key={option}
              className={`cycle-toggle__option${isSelected ? ' cycle-toggle__option--selected' : ''}`}
            >
              <input
                type="radio"
                name={groupName}
                className="cycle-toggle__input"
                value={option}
                checked={isSelected}
                onChange={() => onChange?.(option)}
              />
              <span className="cycle-toggle__text">
                {t(CYCLE_LABEL_KEYS[option] ?? 'accountPolish.billingCycleMonthly')}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export default BillingCycleToggle