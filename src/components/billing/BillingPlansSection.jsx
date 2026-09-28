import useTranslation from '@/hooks/useTranslation'
import { Layers } from 'lucide-react'
import BillingNotice from '@/components/billing/BillingNotice'
import BillingPlanCard from '@/components/billing/BillingPlanCard'
import BillingSection from '@/components/billing/BillingSection'

/**
 * Plan comparison section.
 *
 * `plans` is either the backend catalogue or the frontend configuration
 * placeholder — `isPlaceholderCatalogue` makes that explicit in the UI so no
 * one mistakes the placeholder for a purchasable offer.
 */
function BillingPlansSection({
  plans,
  isPlaceholderCatalogue,
  currentPlanId,
  canSelect,
  onSelect,
}) {
  const { t } = useTranslation()
  const currentIndex = currentPlanId
    ? plans.findIndex((plan) => plan.id === currentPlanId)
    : -1

  const resolveRelation = (plan, index) => {
    if (currentIndex < 0) {
      return 'select'
    }
    if (index === currentIndex) {
      return 'current'
    }
    return index > currentIndex ? 'upgrade' : 'downgrade'
  }

  return (
    <BillingSection
      id="billing-plans"
      className="plans-section"
      eyebrow={t('accountPolish.planOptions')}
      title={t('accountPolish.comparePlans')}
      description={t('accountPolish.planStructureForThisWorkspacePricingAndCheckoutAre')}
      icon={<Layers size={20} aria-hidden="true" />}
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
              relation={resolveRelation(plan, index)}
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
