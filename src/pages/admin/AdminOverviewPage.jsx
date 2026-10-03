import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  CreditCard,
  Globe2,
  LayoutTemplate,
  PanelsTopLeft,
  ScrollText,
  ShieldCheck,
  Users,
} from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import useAdminResource from '@/hooks/useAdminResource'
import { ADMIN_METRICS, ADMIN_COLLECTIONS } from '@/models/adminPlatform'
import AdminDataTable, { AdminDataState } from '@/components/admin/AdminDataTable'
import { ADMIN_PLATFORM_VIEWS } from '@/utils/constants'
import '@/styles/admin-platform.css'
import '@/styles/dashboard-polish.css'

/**
 * The console sections reachable from the overview, in rail order.
 *
 * `Overview` and `Settings` are left out on purpose: one is the page you are
 * already on and the other is a console-level destination that belongs in the
 * rail, not in a grid of data views. `ADMIN_PLATFORM_VIEWS` is appended from the
 * same model the overview links and the route titles use, so a platform-wide view
 * cannot end up with a route but no way in.
 */
const overviewAreas = [
  ['users', Users],
  ['websites', PanelsTopLeft],
  ['templates', LayoutTemplate],
  ['domains', Globe2],
  ['billing', CreditCard],
  ...ADMIN_PLATFORM_VIEWS.map(({ key, icon: Icon }) => [key, Icon]),
  ['audit', ScrollText],
]

export default function AdminOverviewPage() {
  const { t, locale } = useTranslation()
  const { data, state, retry } = useAdminResource('overview')
  return <section className="admin-platform premium-admin" aria-label={t('admin.nav.overview')}>
    <header className="platform-overview-hero">
      <div><p className="platform-overview-hero__eyebrow"><ShieldCheck size={15} aria-hidden="true" />{t('admin.console')}</p>
        <h2>{t('dashboardPolish.adminTitle')}</h2>
        <p className="admin-intro">{t('admin.description.overview')}</p>
      </div>
      <Link to="/admin/audit" className="btn btn--outline"><ScrollText size={16} aria-hidden="true" />{t('admin.viewAudit')}</Link>
    </header>
    <div className="admin-overview-areas">{overviewAreas.map(([area, Icon]) => <Link key={area} to={`/admin/${area}`}><Icon size={19} aria-hidden="true" /><span>{t(`admin.nav.${area}`)}</span><ArrowUpRight size={13} aria-hidden="true" /></Link>)}</div>
    <AdminDataState state={state} onRetry={retry} />
    <dl className="admin-metrics">{ADMIN_METRICS.map(metric => {
      const count = data?.metrics?.[metric]
      const available = Number.isSafeInteger(count) && count >= 0
      return <div className="admin-metric" key={metric}><dt>{t(`admin.metrics.${metric}`)}</dt><dd>{available ? count.toLocaleString(locale) : '—'}</dd><span>{t(available ? 'admin.reportedByService' : 'admin.metricUnavailable')}</span></div>
    })}</dl>
    <div className="admin-section-heading"><h2>{t('admin.recentActivity')}</h2><Link to="/admin/audit">{t('admin.viewAudit')}<ArrowUpRight size={16} aria-hidden="true" /></Link></div>
    <AdminDataTable section="audit" columns={ADMIN_COLLECTIONS.audit} rows={Array.isArray(data?.activity) ? data.activity.filter(item => item && typeof item === 'object') : []} state={state} onRetry={retry} />
  </section>
}
