import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, CircleDashed } from 'lucide-react'
import BillingCycleToggle from '@/components/billing/BillingCycleToggle'
import useAuth from '@/hooks/useAuth'
import usePublicPlans from '@/hooks/usePublicPlans'
import useTranslation from '@/hooks/useTranslation'
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
} from '@/models/billing'
import {
  CAPABILITY_AVAILABILITY,
  CAPABILITY_STATUS,
  CAPABILITY_STATUS_LABEL_KEYS,
  getPricingCta,
  PRICING_AVAILABILITY_TITLE_KEY,
  PRICING_FOOTNOTE_AUTHENTICATED_KEY,
  PRICING_FOOTNOTE_GUEST_KEY,
} from '@/models/landingPricing'

const SKELETON_CARDS = [0, 1, 2]

/**
 * Landing pricing.
 *
 * The cards are the catalogue the backend publishes — real names, real
 * descriptions, real prices — read without a token, so a guest (or a visitor
 * whose session has expired) sees the same offer and is never bounced to
 * sign-in by this read.
 *
 * The monthly / yearly switch only re-selects the published price for that
 * cycle. While the catalogue loads the grid shows skeleton cards, and a failed
 * or empty catalogue degrades to a neutral "pricing unavailable" line. Neither
 * state invents a price.
 */
function PricingSection() {
  const { isAuthenticated } = useAuth()
  const { t } = useTranslation()
  const { plans, isLoading, isUnavailable } = usePublicPlans()
  const [cycle, setCycle] = useState(BILLING_CYCLE.MONTHLY)
  const cta = getPricingCta(isAuthenticated)
  const hasPlans = !isLoading && !isUnavailable && plans.length > 0

  return (
    <section className="landing-section landing-pricing" id="pricing" aria-labelledby="pricing-title">
      <div className="landing-section__heading anim-fade-up">
        <p className="landing-eyebrow">{t('pricing.eyebrow')}</p>
        <h2 id="pricing-title">{t('pricing.title')}</h2>
        <p>{t('pricing.description')}</p>
      </div>

      {isLoading ? (
        <div className="landing-pricing__grid" aria-busy="true">
          {SKELETON_CARDS.map((index) => (
            <div className="landing-plan landing-plan--skeleton" key={index} aria-hidden="true">
              <span className="landing-plan__skeleton-line landing-plan__skeleton-line--title" />
              <span className="landing-plan__skeleton-line" />
              <span className="landing-plan__skeleton-line landing-plan__skeleton-line--price" />
              <span className="landing-plan__skeleton-line" />
              <span className="landing-plan__skeleton-line landing-plan__skeleton-line--short" />
              <span className="landing-plan__skeleton-button" />
            </div>
          ))}
          <p className="visually-hidden" role="status">
            {t('pricing.loading')}
          </p>
        </div>
      ) : hasPlans ? (
        <>
          <div className="landing-pricing__controls anim-fade-up">
            <BillingCycleToggle cycle={cycle} onChange={setCycle} />
          </div>

          <div className="landing-pricing__grid">
            {plans.map((plan) => {
              const price = getPlanPriceForCycle(plan, cycle)
              const amount = price ? formatBillingAmount(price.amount, price.currency) : null
              const period = amount ? getBillingCyclePeriod(price?.cycle ?? cycle) : null
              const savingPercent = getAnnualSavingPercent(plan)
              const monthlyEquivalent =
                cycle === BILLING_CYCLE.ANNUAL ? getMonthlyEquivalent(plan) : null
              const equivalentAmount =
                monthlyEquivalent && monthlyEquivalent.amount
                  ? formatBillingAmount(monthlyEquivalent.amount, monthlyEquivalent.currency)
                  : null
              const tagline = getPlanTagline(t, plan)
              const description = getPlanDescription(t, plan)

              return (
                <article
                  className={`landing-plan${plan.recommended ? ' landing-plan--featured' : ''}`}
                  key={plan.id}
                >
                  {plan.recommended ? (
                    <span className="landing-plan__badge">{t('accountPolish.recommended')}</span>
                  ) : null}

                  <h3 className="landing-plan__name">{getPlanName(t, plan)}</h3>
                  {tagline ? <p className="landing-plan__tagline">{tagline}</p> : null}

                  <div className="landing-plan__price">
                    <p className="landing-plan__price-row">
                      <span className="landing-plan__amount">
                        {amount ?? t('accountPolish.pricingNotPublished')}
                      </span>
                      {period ? <span className="landing-plan__period">{period}</span> : null}
                    </p>
                    {equivalentAmount ? (
                      <span className="landing-plan__equivalent">
                        {t('accountPolish.billedYearly')}: {equivalentAmount}
                        {getBillingCyclePeriod(BILLING_CYCLE.MONTHLY)}
                      </span>
                    ) : null}
                    {savingPercent ? (
                      <span className="landing-plan__saving">
                        {t('accountPolish.savePercent', { percent: savingPercent })}
                      </span>
                    ) : null}
                  </div>

                  {description ? (
                    <p className="landing-plan__description">{description}</p>
                  ) : null}

                  <ul className="landing-plan__highlights">
                    {plan.features.map((feature) => (
                      <li
                        key={feature.label}
                        className={
                          feature.included ? undefined : 'landing-plan__highlight--excluded'
                        }
                      >
                        {feature.included ? (
                          <Check size={14} aria-hidden="true" />
                        ) : (
                          <CircleDashed size={14} aria-hidden="true" />
                        )}
                        <span>{getPlanFeatureLabel(t, plan, feature.label)}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    className={`landing-button ${
                      plan.recommended ? 'landing-button--primary' : 'landing-button--secondary'
                    } landing-plan__cta`}
                    to={cta.to}
                  >
                    {t(cta.labelKey)}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </article>
              )
            })}
          </div>
        </>
      ) : (
        <p className="landing-pricing__unavailable anim-fade-up" role="status">
          {t('pricing.unavailable')}
        </p>
      )}

      <div className="landing-pricing__availability anim-fade-up">
        <h3 className="landing-pricing__availability-title">{t(PRICING_AVAILABILITY_TITLE_KEY)}</h3>
        <ul className="landing-pricing__list">
          {CAPABILITY_AVAILABILITY.map((capability) => {
            const isAvailable = capability.status === CAPABILITY_STATUS.AVAILABLE
            return (
              <li
                className="landing-pricing__item"
                data-status={capability.status}
                key={capability.labelKey}
              >
                {isAvailable ? (
                  <Check size={15} aria-hidden="true" />
                ) : (
                  <CircleDashed size={15} aria-hidden="true" />
                )}
                <span className="landing-pricing__item-label">{t(capability.labelKey)}</span>
                <span className="landing-pricing__item-status">
                  {t(CAPABILITY_STATUS_LABEL_KEYS[capability.status])}
                </span>
              </li>
            )
          })}
        </ul>
        <p className="landing-pricing__footnote">
          {t(
            isAuthenticated
              ? PRICING_FOOTNOTE_AUTHENTICATED_KEY
              : PRICING_FOOTNOTE_GUEST_KEY,
          )}
        </p>
      </div>
    </section>
  )
}

export default PricingSection
