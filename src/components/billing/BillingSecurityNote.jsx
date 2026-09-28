import useAccountCopy from '@/hooks/useAccountCopy'
import useTranslation from '@/hooks/useTranslation'
import { Lock, ServerCog, ShieldQuestion } from 'lucide-react'
import BillingSection from '@/components/billing/BillingSection'

/**
 * Payment security / trust copy.
 *
 * Deliberately describes only what this codebase actually does. No payment
 * provider is named and no certification is claimed, because none is
 * configured yet.
 */
const SECURITY_POINTS = [
  {
    icon: Lock,
    title: 'Provider-hosted card entry',
    text: 'Card details are captured on the payment provider’s secure page, never in this app.',
  },
  {
    icon: ServerCog,
    title: 'Backend-owned billing data',
    text: 'Plans, payment methods and invoices are served by the backend for your signed-in account only.',
  },
  {
    icon: ShieldQuestion,
    title: 'Nothing stored in the browser',
    text: 'No payment details are written to this browser. No provider is connected yet, so no charge can be made.',
  },
]

function BillingSecurityNote() {
  const copy = useAccountCopy()
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
        {SECURITY_POINTS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="security-item">
            <span className="security-item__icon" aria-hidden="true">
              <Icon size={17} />
            </span>
            <div className="security-item__body">
              <h3 className="security-item__title">{copy(title)}</h3>
              <p className="security-item__text">{copy(text)}</p>
            </div>
          </li>
        ))}
      </ul>
    </BillingSection>
  )
}

export default BillingSecurityNote
