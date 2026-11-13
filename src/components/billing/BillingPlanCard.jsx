import useAccountCopy from '@/hooks/useAccountCopy'
import useTranslation from '@/hooks/useTranslation'
import { ArrowRight, Check, Minus } from 'lucide-react'
import BillingStatusBadge from '@/components/billing/BillingStatusBadge'
import { BILLING_PRICE_PENDING_LABEL } from '@/config/billing'
import {
  getPlanDescription,
  getPlanFeatureLabel,
  getPlanName,
  getPlanTagline,
} from '@/i18n/planCopy'
import {
  BILLING_CYCLE,
  formatBillingAmount,
  getAnnualSavingPercent,
  getBillingCyclePeriod,
  getMonthlyEquivalent,
  getPlanPriceForCycle,
  getPlanRelationLabel,
} from '@/models/billing'

/**
 * Plan option card.
 *
 * The price shown is the one published for the cycle the customer selected;
 * an unpublished price renders as an explicit pending label. The CTA starts a
 * real checkout whenever the backend serves its catalogue and published the
 * plan as purchasable — it only stays disabled for the current plan, for the
 * frontend placeholder, or when the backend explicitly withholds a plan.
 * `relation` is only ever set from a plan the backend reports as current.
 */
function BillingPlanCard({ plan, relation, cycle, currentStatus, canSelect, isPlaceholder, onSelect }) {
  const copy = useAccountCopy()
  const { t } = useTranslation()
  const name = getPlanName(t, plan)
  const tagline = getPlanTagline(t, plan)
  const description = getPlanDescription(t, plan)
  const price = getPlanPriceForCycle(plan, cycle)
  const amount = price ? formatBillingAmount(price.amount, price.currency) : null
  const period = getBillingCyclePeriod(price?.cycle ?? cycle)
  const monthlyEquivalent = cycle === BILLING_CYCLE.ANNUAL ? getMonthlyEquivalent(plan) : null
  const equivalentAmount =
    monthlyEquivalent && monthlyEquivalent.amount
      ? formatBillingAmount(monthlyEquivalent.amount, monthlyEquivalent.currency)
      : null
  const savingPercent = getAnnualSavingPercent(plan)
  const isCurrent = relation === 'current'
  const isNotPurchasable = plan.purchasable !== true
  const ctaLabel = getPlanRelationLabel(relation)
  const ctaDisabled = isCurrent || !canSelect || isNotPurchasable
  const unavailableReason = isCurrent
    ? copy('This is your current plan')
    : !canSelect
      ? copy('Checkout is unavailable while the billing backend is not reachable')
      : isNotPurchasable
        ? copy('This plan is not offered for purchase')
        : `Continue to secure checkout for ${plan.name}`
  const ctaNote = isPlaceholder
    ? copy('Configuration placeholder — not purchasable.')
    : isCurrent
      ? null
      : !canSelect
        ? copy('Checkout is unavailable while the billing backend is not reachable')
        : isNotPurchasable
          ? copy('This plan is not offered for purchase')
          : copy('Continue to secure checkout to confirm')

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
          {name}
        </h3>
        {tagline ? <p className="plan-card__tagline">{copy(tagline)}</p> : null}
        <div className="plan-card__badges">
          {isCurrent ? (
            <span className="plan-card__badge plan-card__badge--current">
              {t('accountPolish.currentPlan')}
              {currentStatus ? (
                <BillingStatusBadge status={currentStatus} className="plan-card__status" />
              ) : null}
            </span>
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
            {period ? <span className="plan-card__cycle">{period}</span> : null}
          </>
        ) : (
          <span className="plan-card__amount plan-card__amount--pending">
            {copy(BILLING_PRICE_PENDING_LABEL)}
          </span>
        )}
        {equivalentAmount ? (
          <span className="plan-card__equivalent">
            {copy('Billed yearly')}: {equivalentAmount}
            {getBillingCyclePeriod(BILLING_CYCLE.MONTHLY)}
          </span>
        ) : null}
        {savingPercent ? (
          <span className="plan-card__saving">
            {t('accountPolish.savePercent', { percent: savingPercent })}
          </span>
        ) : null}
      </div>

      {description ? (
        <p className="plan-card__description">{copy(description)}</p>
      ) : null}

      <ul className="plan-card__features">
        {plan.features.map((feature) => {
          const label = copy(getPlanFeatureLabel(t, plan, feature.label))
          return (
            <li
              key={feature.label}
              className={`plan-card__feature${
                feature.included ? '' : ' plan-card__feature--excluded'
              }`}
            >
              <span className="plan-card__feature-icon" aria-hidden="true">
                {feature.included ? <Check size={14} /> : <Minus size={14} />}
              </span>
              <span className="plan-card__feature-label">
                {label}
                <span className="visually-hidden">
                  {' ('}
                  {t(
                    feature.included
                      ? 'accountPolish.featureIncluded'
                      : 'accountPolish.featureExcluded',
                  )}
                  {')'}
                </span>
              </span>
            </li>
          )
        })}
      </ul>

      <footer className="plan-card__footer">
        <button
          type="button"
          className={`btn btn--block${
            isCurrent ? '' : plan.recommended ? ' btn--primary' : ' btn--outline'
          } plan-card__cta`}
          disabled={ctaDisabled}
          aria-disabled={ctaDisabled}
          onClick={() => onSelect?.(plan)}
          title={unavailableReason}
        >
          {copy(ctaLabel)}
          {!isCurrent ? <ArrowRight size={16} aria-hidden="true" /> : null}
        </button>
        {ctaNote ? (
          <p className="plan-card__cta-note">{ctaNote}</p>
        ) : null}
      </footer>
    </article>
  )
}

export default BillingPlanCard
