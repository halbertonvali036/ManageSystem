import useTranslation from '@/hooks/useTranslation'
import useAdminResource from '@/hooks/useAdminResource'
import { ADMIN_COLLECTIONS } from '@/models/adminPlatform'
import { SITE_TEMPLATES } from '@/models/siteTemplate'
import { BILLING_PLANS } from '@/config/billing'
import AdminDataTable from '@/components/admin/AdminDataTable'
import '@/styles/admin-platform.css'

export default function AdminCollectionPage({ section }) {
  const { t } = useTranslation()
  const { data, state, retry } = useAdminResource(section)
  return <section className="admin-platform premium-admin" aria-label={t(`admin.nav.${section}`)}>
    <p className="admin-intro">{t(`admin.description.${section}`)}</p>
    <AdminDataTable section={section} columns={ADMIN_COLLECTIONS[section]} rows={data ?? []} state={state} onRetry={retry} />
    {section === 'templates' && <section className="admin-foundation" aria-labelledby="admin-template-foundation">
      <h2 id="admin-template-foundation">{t('admin.packagedTemplates')}</h2><p>{t('admin.templatesHint')}</p>
      <div className="admin-catalogue">{SITE_TEMPLATES.map(template => <article key={template.id}>
        <h3>{t(template.nameKey)}</h3><p>{t(template.descriptionKey)}</p><span className="admin-source-label">{t('admin.frontendConfiguration')}</span>
      </article>)}</div>
      <div className="admin-pending-actions" aria-describedby="template-actions-note">{['createTemplate', 'editTemplate', 'enableTemplate', 'disableTemplate'].map(action => <button type="button" className="btn btn--outline" disabled key={action}>{t(`admin.${action}`)}</button>)}</div>
      <p id="template-actions-note">{t('admin.mutationsPending')}</p>
    </section>}
    {section === 'billing' && <section className="admin-foundation" aria-labelledby="admin-plan-foundation">
      <h2 id="admin-plan-foundation">{t('admin.planArchitecture')}</h2><p>{t('admin.billingHint')}</p>
      <div className="admin-catalogue">{BILLING_PLANS.map(plan => <article key={plan.id}><h3>{plan.name}</h3><p>{t('admin.pricingPending')}</p><span className="admin-source-label">{t('admin.frontendConfiguration')}</span></article>)}</div>
    </section>}
  </section>
}
