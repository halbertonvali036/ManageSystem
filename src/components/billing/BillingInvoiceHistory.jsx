import useTranslation from '@/hooks/useTranslation'
import { Download, FileText } from 'lucide-react'
import BillingSection from '@/components/billing/BillingSection'
import {
  formatBillingAmount,
  formatBillingDate,
  getInvoiceStatusLabel,
  getInvoiceStatusVariant,
} from '@/models/billing'
import StatusBadge from '@/components/common/StatusBadge'

const UNKNOWN_INVOICE_LABEL = 'Invoice'

/**
 * Invoice / billing history.
 *
 * Renders whatever the backend returns — no invoices are seeded, and the
 * empty state is shown when there is genuinely nothing to list.
 */
function BillingInvoiceHistory({ invoices, canOpenInvoices }) {
  const { t } = useTranslation()
  return (
    <BillingSection
      id="billing-history"
      className="invoices-section"
      eyebrow={t('accountPolish.billingHistory')}
      title={t('accountPolish.invoicesReceipts')}
      description={t('accountPolish.issuedInvoicesTheirStatusAndTheReceiptForEach')}
      icon={<FileText size={20} aria-hidden="true" />}
    >
      {invoices.length ? (
        <div className="table-responsive invoices-section__table">
          <table className="invoices-table">
            <caption className="visually-hidden">{t('accountPolish.invoicesIssuedForThisAccountMostRecentFirst')}</caption>
            <thead>
              <tr>
                <th scope="col">{t('accountPolish.invoice')}</th>
                <th scope="col">{t('accountPolish.date')}</th>
                <th scope="col">{t('accountPolish.amount')}</th>
                <th scope="col">{t('accountPolish.status')}</th>
                <th scope="col">
                  <span className="visually-hidden">{t('accountPolish.receipt')}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                const statusLabel = getInvoiceStatusLabel(invoice.status)
                const statusVariant = getInvoiceStatusVariant(invoice.status)
                const date = formatBillingDate(invoice.issuedAt)
                const amount = formatBillingAmount(invoice.amount, invoice.currency)
                const hasReceipt = Boolean(invoice.receiptUrl) && canOpenInvoices

                return (
                  <tr key={invoice.id}>
                    <th scope="row" className="invoices-table__id" data-label={t('accountPolish.invoice')}>
                      {invoice.number ?? UNKNOWN_INVOICE_LABEL}
                      {invoice.planName ? (
                        <span className="invoices-table__plan">{invoice.planName}</span>
                      ) : null}
                    </th>
                    <td className="invoices-table__date" data-label={t('accountPolish.date')}>
                      {date ?? '—'}
                    </td>
                    <td className="invoices-table__amount" data-label={t('accountPolish.amount')}>
                      {amount ?? '—'}
                    </td>
                    <td data-label={t('accountPolish.status')}>
                      <StatusBadge
                        status={statusVariant}
                        labels={{ [statusVariant]: statusLabel }}
                      />
                    </td>
                    <td className="invoices-table__action" data-label={t('accountPolish.receipt')}>
                      {hasReceipt ? (
                        <a
                          className="btn btn--icon-left invoices-table__receipt"
                          href={invoice.receiptUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          <Download size={15} aria-hidden="true" />{t('accountPolish.receipt')}</a>
                      ) : (
                        <button
                          type="button"
                          className="btn btn--icon-left invoices-table__receipt"
                          disabled
                          aria-disabled="true"
                          title={t('accountPolish.receiptsAreIssuedByTheBackendOnceBillingIs')}
                        >
                          <Download size={15} aria-hidden="true" />{t('accountPolish.receipt')}</button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-state invoices-section__empty">
          <h3 className="table-state__title">{t('accountPolish.noInvoicesYet')}</h3>
          <p className="table-state__text">{t('accountPolish.invoicesAppearHereAsSoonAsAPaymentIs')}</p>
        </div>
      )}
    </BillingSection>
  )
}

export default BillingInvoiceHistory
