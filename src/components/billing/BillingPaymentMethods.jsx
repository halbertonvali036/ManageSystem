import useAccountCopy from '@/hooks/useAccountCopy'
import useTranslation from '@/hooks/useTranslation'
import { Plus, WalletCards } from 'lucide-react'
import BillingNotice from '@/components/billing/BillingNotice'
import BillingSection from '@/components/billing/BillingSection'
import {
  formatCardExpiry,
  formatPaymentMethodLabel,
  getPaymentMethodTypeLabel,
} from '@/models/billing'

const UNAVAILABLE_LABEL = 'Unavailable'

/**
 * Payment method section.
 *
 * Renders only masked metadata a payment provider returns (brand, last four,
 * expiry, default flag). Card numbers are never collected, submitted or stored
 * by this app — that happens on the provider's secure page.
 */
function BillingPaymentMethods({ paymentMethods, canManageBilling }) {
  const copy = useAccountCopy()
  const { t } = useTranslation()
  return (
    <BillingSection
      id="payment-method"
      className="payment-section"
      eyebrow={t('accountPolish.paymentMethod')}
      title={t('accountPolish.paymentMethod')}
      description={t('accountPolish.theCardOrAccountUsedForChargesOnThis')}
      icon={<WalletCards size={20} aria-hidden="true" />}
      action={
        <button
          type="button"
          className="btn btn--outline btn--icon-left payment-section__add"
          disabled={!canManageBilling}
          aria-disabled={!canManageBilling}
          title={
            canManageBilling
              ? copy('Add a payment method on the secure provider page')
              : copy('Available once a payment provider is connected')
          }
        >
          <Plus size={16} aria-hidden="true" />{t('accountPolish.addPaymentMethod')}</button>
      }
    >
      {paymentMethods.length ? (
        <ul className="payment-list">
          {paymentMethods.map((method) => {
            const label = formatPaymentMethodLabel(method)
            const expiry = formatCardExpiry(method.expiry)
            const typeLabel = getPaymentMethodTypeLabel(method)

            return (
              <li
                key={method.id}
                className={`payment-item${method.isDefault ? ' payment-item--default' : ''}`}
              >
                <span className="payment-item__icon" aria-hidden="true">
                  <WalletCards size={18} />
                </span>
                <div className="payment-item__identity">
                  <p className="payment-item__label">
                    {label ?? UNAVAILABLE_LABEL}
                    {method.isDefault ? (
                      <span className="payment-item__badge">{t('accountPolish.default')}</span>
                    ) : null}
                  </p>
                  <p className="payment-item__meta">
                    {typeLabel ? `${typeLabel} · ` : ''}
                    {expiry ? `Expires ${expiry}` : copy('Expiry not reported')}
                  </p>
                </div>
                <span className="payment-item__actions">
                  <button
                    type="button"
                    className="btn payment-item__action"
                    disabled={!canManageBilling}
                    aria-disabled={!canManageBilling}
                    title={
                      canManageBilling
                        ? copy('Replace this payment method on the secure provider page')
                        : copy('Available once a payment provider is connected')
                    }
                  >{t('accountPolish.replace')}</button>
                </span>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="table-state payment-section__empty">
          <h3 className="table-state__title">{t('accountPolish.noPaymentMethodSaved')}</h3>
          <p className="table-state__text">{t('accountPolish.aSavedPaymentMethodAppearsHereOnceTheBackend')}</p>
        </div>
      )}

      <BillingNotice tone="info" className="payment-section__notice">{t('accountPolish.cardDetailsAreEnteredOnThePaymentProviderRsquo')}</BillingNotice>
    </BillingSection>
  )
}

export default BillingPaymentMethods
