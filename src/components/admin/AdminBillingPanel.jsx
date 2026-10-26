import useTranslation from '@/hooks/useTranslation'
import { ADMIN_PLANS } from '@/models/adminPlan'
import { BILLING_PLANS } from '@/config/billing'
import '@/styles/admin-platform.css'

function AdminBillingPanel() {
  const { t } = useTranslation()

  return (
    <section className="admin-foundation" aria-labelledby="admin-billing-panel">
      <h2 id="admin-billing-panel">{t('admin.plansTitle')}</h2>
      <p>{t('admin.accountPlansHint')}</p>
      <div className="admin-catalogue">
        {ADMIN_PLANS.map((plan) => (
          <article key={plan.id}>
            <h3>{t(plan.nameKey)}</h3>
            <p>{t(plan.descriptionKey)}</p>
            <p><strong>{t('admin.limitsAndQuotas')}</strong></p>
            <ul className="admin-list">
              <li>{t('admin.limitSites')}: {plan.limits.sites ?? t('admin.limitUnknown')}</li>
            </ul>
            <span className="admin-source-label">{t('admin.frontendConfiguration')}</span>
          </article>
        ))}
      </div>
      <section className="admin-foundation" aria-labelledby="admin-commercial-catalogue">
        <h3 id="admin-commercial-catalogue">{t('admin.commercialCatalogue')}</h3>
        <p>{t('admin.billingHint')}</p>
        <div className="admin-catalogue">
          {BILLING_PLANS.map((plan) => (
            <article key={plan.id}>
              <h4>{plan.name}</h4>
              <p>{t('admin.pricingPending')}</p>
              <span className="admin-source-label">{t('admin.frontendConfiguration')}</span>
            </article>
          ))}
        </div>
      </section>
      <section className="admin-foundation" aria-labelledby="admin-feature-visibility">
        <h3 id="admin-feature-visibility">{t('admin.featureVisibility')}</h3>
        <p>{t('admin.featureVisibilityHint')}</p>
        <div className="admin-pending-actions">
          <button type="button" className="btn btn--outline" disabled>{t('admin.openUserManagement')}</button>
        </div>
      </section>
    </section>
  )
}

export default AdminBillingPanel
