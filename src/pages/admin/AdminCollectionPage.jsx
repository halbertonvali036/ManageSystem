import useTranslation from '@/hooks/useTranslation'
import useAdminResource from '@/hooks/useAdminResource'
import { ADMIN_COLLECTIONS } from '@/models/adminPlatform'

import AdminDataTable from '@/components/admin/AdminDataTable'
import AdminBillingPanel from '@/components/admin/AdminBillingPanel'
import AdminTemplateManager from '@/components/admin/AdminTemplateManager'
import '@/styles/admin-platform.css'

export default function AdminCollectionPage({ section }) {
  const { t } = useTranslation()
  const { data, state, retry } = useAdminResource(section)
  return (
    <section className="admin-platform premium-admin" aria-label={t(`admin.nav.${section}`)}>
      <p className="admin-intro">{t(`admin.description.${section}`)}</p>
      <AdminDataTable
        section={section}
        columns={ADMIN_COLLECTIONS[section]}
        rows={data ?? []}
        state={state}
        onRetry={retry}
      />
      {section === 'templates' && <AdminTemplateManager />}
      {section === 'billing' && (
        <>
          <AdminBillingPanel />
        </>
      )}
    </section>
  )
}
