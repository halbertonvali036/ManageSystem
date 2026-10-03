import { ArrowUpRight, History, LayoutTemplate, Plus } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import Card from '@/components/common/Card'
import SiteCard from '@/components/sites/SiteCard'
import SitesEmptyState from '@/components/sites/SitesEmptyState'
import WorkspaceBreadcrumb from '@/components/workspaces/WorkspaceBreadcrumb'
import WorkspaceSectionNav from '@/components/workspaces/WorkspaceSectionNav'
import useTranslation from '@/hooks/useTranslation'
import useWorkspace from '@/hooks/useWorkspace'
import useWorkspaceSites from '@/hooks/useWorkspaceSites'
import { WORKSPACE_ACTIVITY_PATH, WORKSPACE_SITES_PATH, WORKSPACE_NEW_SITE_PATH, WORKSPACES_PATH, TEMPLATES_PATH } from '@/utils/constants'
import '@/styles/dashboard-polish.css'

/**
 * Workspace Overview — the landing page for a single workspace.
 *
 * Shows a welcome header with the workspace name and a grid of the workspace's
 * most-recently-updated sites. Without a backend both the workspace and the site
 * list are absent, showing their respective honest empty states.
 */
function WorkspaceOverviewPage() {
  const { workspaceId } = useParams()
  const { t } = useTranslation()
  const { workspace, isLoading: workspaceLoading, error: workspaceError } = useWorkspace(workspaceId)
  const {
    visibleSites,
    total,
    isLoading: sitesLoading,
    error: sitesError,
  } = useWorkspaceSites(workspaceId, { enabled: Boolean(workspaceId) })

  if (workspaceError || (!workspaceLoading && !workspace)) {
    return (
      <div className="workspaces-page premium-dashboard">
        <WorkspaceBreadcrumb workspace={null} />
        <Card>
          <div className="table-state table-state--error">
            <h3 className="table-state__title">{t('workspaces.notFoundTitle')}</h3>
            <p className="table-state__text">{t('workspaces.notFoundText')}</p>
            <Link to={WORKSPACES_PATH} className="btn btn--primary">
              {t('workspaces.backToWorkspaces')}
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  const recentSites = [...visibleSites].slice(0, 6)

  return (
    <div className="workspaces-page workspace-overview premium-dashboard">
      <WorkspaceBreadcrumb workspace={workspace} />
      <WorkspaceSectionNav workspaceId={workspaceId} />

      {/* Overview hero */}
      <header className="workspace-overview__head platform-overview-hero">
        {workspaceLoading ? (
          <div className="page-status">
            <span className="spinner" aria-hidden="true" />
            {t('common.loading')}
          </div>
        ) : (
          <>
            <div className="workspaces-page__headline">
              <p className="platform-overview-hero__eyebrow">{t('workspaces.overview.eyebrow')}</p>
              <h1 className="workspaces-page__title">{workspace?.name}</h1>
              <p className="page-description">/{workspace?.slug}</p>
            </div>

            <Link
              to={WORKSPACE_NEW_SITE_PATH(workspaceId)}
              className="btn btn--primary workspaces-page__cta"
            >
              <Plus size={16} aria-hidden="true" />
              {t('workspaces.overview.newSiteCta')}
            </Link>
          </>
        )}
      </header>

      <div className="workspace-quick-links">
        <Link to={TEMPLATES_PATH}><LayoutTemplate size={20} aria-hidden="true" /><span><strong>{t('dashboardPolish.templates')}</strong><small>{t('dashboardPolish.templateHint')}</small></span><ArrowUpRight size={16} aria-hidden="true" /></Link>
        <Link to={WORKSPACE_ACTIVITY_PATH(workspaceId)}><History size={20} aria-hidden="true" /><span><strong>{t('dashboardPolish.activity')}</strong><small>{t('dashboardPolish.activityHint')}</small></span><ArrowUpRight size={16} aria-hidden="true" /></Link>
      </div>

      {/* Recent sites */}
      <section>
        <div className="workspaces-page__listhead">
          <h2 className="workspace-section__title">{t('workspaces.overview.sitesTitle')}</h2>
          {total > 0 && (
            <Link
              to={WORKSPACE_SITES_PATH(workspaceId)}
              className="btn btn--ghost workspace-overview__all-link"
            >
              {t('workspaces.overview.viewAll', { count: total })}
            </Link>
          )}
        </div>

        {sitesError ? (
          <Card>
            <div className="table-state table-state--error">
              <h3 className="table-state__title">{t('workspaces.loadFailed')}</h3>
              <p className="table-state__text">{t('workspaces.loadFailedText')}</p>
            </div>
          </Card>
        ) : sitesLoading ? (
          <Card>
            <div className="page-status">
              <span className="spinner" aria-hidden="true" />
              {t('sites.loading')}
            </div>
          </Card>
        ) : total === 0 ? (
          <Card>
            <SitesEmptyState
              variant="compact"
              titleKey="workspaces.overview.sitesEmptyTitle"
              textKey="workspaces.overview.sitesEmptyText"
              ctaKey="workspaces.overview.newSiteCta"
            />
          </Card>
        ) : (
          <ul className="site-grid">
            {recentSites.map((site) => (
              <li key={site.id}>
                <SiteCard site={site} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default WorkspaceOverviewPage
