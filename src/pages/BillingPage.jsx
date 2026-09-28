import useTranslation from '@/hooks/useTranslation'
import Card from '@/components/common/Card'
import BillingInvoiceHistory from '@/components/billing/BillingInvoiceHistory'
import BillingPaymentMethods from '@/components/billing/BillingPaymentMethods'
import BillingPlanSummary from '@/components/billing/BillingPlanSummary'
import BillingPlansSection from '@/components/billing/BillingPlansSection'
import BillingSecurityNote from '@/components/billing/BillingSecurityNote'
import useBillingOverview from '@/hooks/useBillingOverview'

/**
 * Plan & Billing — account page for the authenticated user.
 *
 * Everything shown here comes from `useBillingOverview`. While the billing
 * backend is absent the hook resolves safe empty values, so the page renders
 * explicit unavailable/empty states and no subscription, payment method or
 * invoice is ever fabricated.
 */
function BillingPage() {
  const { t } = useTranslation()
  const {
    overview,
    plans,
    isPlaceholderCatalogue,
    paymentMethods,
    invoices,
    canManageBilling,
    isLoading,
    loadError,
    backendUnavailable,
    actionError,
    pendingAction,
    refetch,
    startCheckout,
    openBillingPortal,
  } = useBillingOverview()

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />{t('accountPolish.loadingBillingHellip')}</div>
      </Card>
    )
  }

  if (loadError) {
    return (
      <Card>
        <div className="table-state table-state--error">
          <h2 className="table-state__title">{t('accountPolish.failedToLoadBilling')}</h2>
          <p className="table-state__text">{loadError}</p>
          <button type="button" className="btn btn--primary" onClick={refetch}>{t('accountPolish.retry')}</button>
        </div>
      </Card>
    )
  }

  return (
    <div className="billing-page">
      <p className="page-description">{t('accountPolish.reviewThePlanOnYourAccountHowItRenews')}</p>

      <BillingPlanSummary
        overview={overview}
        canManageBilling={canManageBilling}
        pendingAction={pendingAction}
        actionError={actionError}
        onManageSubscription={openBillingPortal}
      />

      <BillingPlansSection
        plans={plans}
        isPlaceholderCatalogue={isPlaceholderCatalogue}
        currentPlanId={overview?.planId ?? null}
        canSelect={canManageBilling}
        onSelect={(plan) => startCheckout(plan.id)}
      />

      <div className="billing-columns">
        <BillingPaymentMethods
          paymentMethods={paymentMethods}
          canManageBilling={canManageBilling}
        />
        <BillingInvoiceHistory
          invoices={invoices}
          canOpenInvoices={!backendUnavailable}
        />
      </div>

      <BillingSecurityNote />
    </div>
  )
}

export default BillingPage
