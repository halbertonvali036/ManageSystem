import { Link } from 'react-router-dom'
import { ArrowRight, Check, CircleDashed, Info } from 'lucide-react'
import useAuth from '@/hooks/useAuth'
import useTranslation from '@/hooks/useTranslation'
import {
  CAPABILITY_AVAILABILITY,
  CAPABILITY_STATUS,
  CAPABILITY_STATUS_LABEL_KEYS,
  getPricingCta,
  LANDING_PLANS,
  PLAN_STATUS,
  PRICING_AVAILABILITY_TITLE_KEY,
  PRICING_BADGE_KEY,
  PRICING_DISCLOSURE_KEY,
  PRICING_FOOTNOTE_AUTHENTICATED_KEY,
  PRICING_FOOTNOTE_GUEST_KEY,
  PRICING_PRICE_PLACEHOLDER_KEY,
  PRICING_PROVISIONAL_KEY,
} from '@/models/landingPricing'

/**
 * Plan presentation.
 *
 * No price, discount or purchase flow is shown while commercial terms are open.
 * Each card states that it is provisional, and the only actions are the real
 * registration, sign-in and plan pages.
 */
function PricingSection() {
  const { isAuthenticated } = useAuth()
  const { t } = useTranslation()
  const cta = getPricingCta(isAuthenticated)

  return (
    <section className="landing-section landing-pricing" id="pricing" aria-labelledby="pricing-title">
      <div className="landing-section__heading anim-fade-up">
        <p className="landing-eyebrow">{t('pricing.eyebrow')}</p>
        <h2 id="pricing-title">{t('pricing.title')}</h2>
        <p>{t('pricing.description')}</p>
      </div>

      <p className="landing-pricing__disclosure anim-fade-up" role="note">
        <Info size={15} aria-hidden="true" />
        <span>{t(PRICING_DISCLOSURE_KEY)}</span>
      </p>

      <div className="landing-pricing__grid">
        {LANDING_PLANS.map((plan) => (
          <article
            className={`landing-plan${plan.isFeatured ? ' landing-plan--featured' : ''}`}
            key={plan.id}
          >
            {plan.isFeatured ? (
              <span className="landing-plan__badge">{t(PRICING_BADGE_KEY)}</span>
            ) : null}

            <h3 className="landing-plan__name">{t(`pricing.plans.${plan.copyKey}.name`)}</h3>
            <p className="landing-plan__audience">{t(`pricing.plans.${plan.copyKey}.audience`)}</p>

            <p className="landing-plan__price">
              <span className="landing-plan__price-label">{t(PRICING_PRICE_PLACEHOLDER_KEY)}</span>
              <span className="landing-plan__status">
                {plan.status === PLAN_STATUS.PROVISIONAL ? t(PRICING_PROVISIONAL_KEY) : null}
              </span>
            </p>

            <ul className="landing-plan__highlights">
              {t(`pricing.plans.${plan.copyKey}.highlights`).split('|').map((highlight) => (
                <li key={highlight}>
                  <Check size={14} aria-hidden="true" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>

            <Link
              className={`landing-button ${
                plan.isFeatured ? 'landing-button--primary' : 'landing-button--secondary'
              } landing-plan__cta`}
              to={cta.to}
            >
              {t(cta.labelKey)}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>

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
