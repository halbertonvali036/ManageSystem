import useTranslation from '@/hooks/useTranslation'
import { Layers } from 'lucide-react'
import BillingCycleToggle from '@/components/billing/BillingCycleToggle'
import BillingNotice from '@/components/billing/BillingNotice'
import BillingPlanCard from '@/components/billing/BillingPlanCard'
import BillingSection from '@/components/billing/BillingSection'
import { getPlanRelation } from '@/models/billing'

/**
 * Plan comparison section.
 *
 * `plans` is either the backend catalogue or the frontend configuration
 * placeholder — `isPlaceholderCatalogue` makes that explicit in the UI so no
 * one mistakes the placeholder for a purchasable offer.
 *
 * The cycle switch re-reads published prices for the chosen period. It does not
 * subscribe anyone to anything: checkout stays a separate, explicit step.
 */
function BillingPlansSection({
  plans,
  isPlaceholderCatalogue,
  currentPlan,
  currentStatus,
  cycle,
  onCycleChange,
  canSelect,
  onSelect,
}) {
  const { t } = useTranslation()
  const currentIndex = currentPlan
    ? plans.findIndex((plan) => plan.id === currentPlan.id)
    : -1

  return (
    <BillingSection
      id="billing-plans"
      className="plans-section"
      eyebrow={t('accountPolish.planOptions')}
      title={t('accountPolish.comparePlans')}
      description={t('accountPolish.planStructureForThisWorkspacePricingAndCheckoutAre')}
      icon={<Layers size={20} aria-hidden="true" />}
      action={
        <BillingCycleToggle cycle={cycle} onChange={onCycleChange} />
      }
    >
      {isPlaceholderCatalogue ? (
        <BillingNotice tone="pending" title={t('accountPolish.frontendConfiguration')} className="plans-section__notice">{t('accountPolish.thisCatalogueIsPlaceholderConfigurationUsedToLayOut')}</BillingNotice>
      ) : null}

      {plans.length ? (
        <div className="plans-grid">
          {plans.map((plan, index) => (
            <BillingPlanCard
              key={plan.id}
              plan={plan}
              relation={getPlanRelation(plan, currentPlan, index, currentIndex)}
              cycle={cycle}
              currentStatus={currentStatus}
              canSelect={canSelect}
              isPlaceholder={isPlaceholderCatalogue || plan.purchasable !== true}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : (
        <div className="table-state plans-section__empty">
          <h3 className="table-state__title">{t('accountPolish.noPlansPublishedYet')}</h3>
          <p className="table-state__text">{t('accountPolish.planOptionsAppearHereOnceTheBackendPublishesA')}</p>
        </div>
      )}
    </BillingSection>
  )
}

export default BillingPlansSection