import useAccountCopy from '@/hooks/useAccountCopy'
import useTranslation from '@/hooks/useTranslation'
import { ArrowRight, Check, Minus } from 'lucide-react'
import BillingStatusBadge from '@/components/billing/BillingStatusBadge'
import { BILLING_PRICE_PENDING_LABEL } from '@/config/billing'
import {
  formatBillingAmount,
  getBillingCycleLabel,
} from '@/models/billing'

const RELATION_LABELS = {
  upgrade: 'Upgrade',
  downgrade: 'Change plan',
  current: 'Current plan',
  select: 'Select plan',
}

/**
 * Plan option card.
 *
 * Price, cycle and checkout state come from real data only: an unpublished
 * price renders as an explicit pending label and the CTA stays unavailable
 * until a payment provider is connected. `relation` is only ever set from a
 * plan the backend reports as current.
 */
function BillingPlanCard({ plan, relation, canSelect, isPlaceholder, onSelect }) {
  const copy = useAccountCopy()
  const { t } = useTranslation()
  const amount = formatBillingAmount(plan.price, plan.currency)
  const isCurrent = relation === 'current'
  const ctaLabel = RELATION_LABELS[relation] ?? RELATION_LABELS.select
  const ctaDisabled = isCurrent || !canSelect

  const cardClassName = [
    'plan-card',
    isCurrent ? 'plan-card--current' : '',
    plan.recommended ? 'plan-card--recommended' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article className={cardClassName} aria-labelledby={`plan-${plan.id}-title`}>
      <header className="plan-card__header">
        <p className="plan-card__eyebrow">{copy(plan.eyebrow) ?? copy('Plan')}</p>
        <h3 id={`plan-${plan.id}-title`} className="plan-card__name">
          {plan.name}
        </h3>
        {plan.tagline ? <p className="plan-card__tagline">{copy(plan.tagline)}</p> : null}
        <div className="plan-card__badges">
          {isCurrent ? (
            <BillingStatusBadge status="active" className="plan-card__badge" />
          ) : null}
          {plan.recommended ? (
            <span className="plan-card__badge plan-card__badge--recommended">{t('accountPolish.recommended')}</span>
          ) : null}
        </div>
      </header>

      <div className="plan-card__price">
        {amount ? (
          <>
            <span className="plan-card__amount">{amount}</span>
            <span className="plan-card__cycle">
              {getBillingCycleLabel(plan.cycle)}
            </span>
          </>
        ) : (
          <span className="plan-card__amount plan-card__amount--pending">
            {copy(BILLING_PRICE_PENDING_LABEL)}
          </span>
        )}
      </div>

      {plan.description ? (
        <p className="plan-card__description">{copy(plan.description)}</p>
      ) : null}

      <ul className="plan-card__features">
        {plan.features.map((feature) => (
          <li
            key={copy(feature.label)}
            className={`plan-card__feature${
              feature.included ? '' : ' plan-card__feature--excluded'
            }`}
          >
            <span className="plan-card__feature-icon" aria-hidden="true">
              {feature.included ? <Check size={14} /> : <Minus size={14} />}
            </span>
            <span className="plan-card__feature-label">
              {copy(feature.label)}
              <span className="visually-hidden">
                {feature.included ? ' (included)' : ' (not included)'}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <footer className="plan-card__footer">
        <button
          type="button"
          className={`btn btn--block${
            isCurrent ? '' : ' btn--primary'
          } plan-card__cta`}
          disabled={ctaDisabled}
          aria-disabled={ctaDisabled}
          onClick={() => onSelect?.(plan)}
          title={
            isCurrent
              ? copy('This is your current plan')
              : canSelect
                ? `Continue to secure checkout for ${plan.name}`
                : copy('Checkout becomes available once the payment provider is connected')
          }
        >
          {copy(ctaLabel)}
          {!isCurrent ? <ArrowRight size={16} aria-hidden="true" /> : null}
        </button>
        <p className="plan-card__cta-note">
          {isPlaceholder
            ? copy('Configuration placeholder — not purchasable.')
            : ctaDisabled
              ? copy('Checkout is not available yet.')
              : copy('You continue to the payment provider to confirm.')}
        </p>
      </footer>
    </article>
  )
}

export default BillingPlanCard
