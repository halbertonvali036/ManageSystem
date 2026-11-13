import useTranslation from '@/hooks/useTranslation'
import { Lock, ServerCog, ShieldQuestion } from 'lucide-react'
import BillingSection from '@/components/billing/BillingSection'

/**
 * Payment security / trust copy.
 *
 * Deliberately describes only what this codebase actually does: card details
 * are typed on the checkout page, go straight to the backend for confirmation,
 * and nothing card-like is written to this browser.
 */
const SECURITY_POINTS = [
  {
    icon: Lock,
    titleKey: 'accountPolish.secureCheckoutCardEntry',
    textKey: 'accountPolish.secureCheckoutCardEntryText',
  },
  {
    icon: ServerCog,
    titleKey: 'accountPolish.backendOwnedBillingData',
    textKey: 'accountPolish.plansPaymentMethodsAndInvoicesAreServedByThe',
  },
  {
    icon: ShieldQuestion,
    titleKey: 'accountPolish.nothingStoredInTheBrowser',
    textKey: 'accountPolish.noPaymentDetailsAreWrittenToThisBrowser',
  },
]

function BillingSecurityNote() {
  const { t } = useTranslation()
  return (
    <BillingSection
      className="security-section"
      eyebrow={t('accountPolish.paymentSecurity')}
      title={t('accountPolish.howYourPaymentDataIsHandled')}
      description={t('accountPolish.whatThisPageDoesTodayWhileBillingIntegrationIs')}
      icon={<Lock size={20} aria-hidden="true" />}
    >
      <ul className="security-list">
        {SECURITY_POINTS.map(({ icon: Icon, titleKey, textKey }) => (
          <li key={titleKey} className="security-item">
            <span className="security-item__icon" aria-hidden="true">
              <Icon size={17} />
            </span>
            <div className="security-item__body">
              <h3 className="security-item__title">{t(titleKey)}</h3>
              <p className="security-item__text">{t(textKey)}</p>
            </div>
          </li>
        ))}
      </ul>
    </BillingSection>
  )
}

export default BillingSecurityNote
