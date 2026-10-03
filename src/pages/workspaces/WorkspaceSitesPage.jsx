import { Plus } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import Card from '@/components/common/Card'
import SiteCard from '@/components/sites/SiteCard'
import SitesEmptyState from '@/components/sites/SitesEmptyState'
import SitesToolbar from '@/components/sites/SitesToolbar'
import WorkspaceBreadcrumb from '@/components/workspaces/WorkspaceBreadcrumb'
import WorkspaceSectionNav from '@/components/workspaces/WorkspaceSectionNav'
import useTranslation from '@/hooks/useTranslation'
import useWorkspace from '@/hooks/useWorkspace'
import useWorkspaceSites from '@/hooks/useWorkspaceSites'
import { WORKSPACE_NEW_SITE_PATH } from '@/utils/constants'

/**
 * Workspace Sites — the full site list inside a workspace.
 *
 * Reuses SitesToolbar, SiteCard and SitesEmptyState from the existing sites
 * surface. The only difference is the data source: useWorkspaceSites scopes the
 * load to this workspace instead of the whole account.
 */
function WorkspaceSitesPage() {
  const { workspaceId } = useParams()
  const { t } = useTranslation()
  const { workspace } = useWorkspace(workspaceId)
  const {
    visibleSites,
    counts,
    total,
    isLoading,
    error,
    query,
    setQuery,
    status,
    setStatus,
    isFiltered,
    clearFilters,
    refetch,
  } = useWorkspaceSites(workspaceId)

  const showToolbar = total > 0
  const hasNoResults = total > 0 && visibleSites.length === 0

  return (
    <div className="sites-page premium-dashboard">
      <WorkspaceBreadcrumb workspace={workspace} section="sites" />
      <WorkspaceSectionNav workspaceId={workspaceId} />

      <header className="sites-page__head platform-overview-hero">
        <div className="sites-page__headline">
          <h1 className="sites-page__title">{t('workspaces.sites.pageTitle')}</h1>
          <p className="page-description">{t('workspaces.sites.pageDescription')}</p>
        </div>

        <Link
          to={WORKSPACE_NEW_SITE_PATH(workspaceId)}
          className="btn btn--primary sites-page__cta"
        >
          <Plus size={16} aria-hidden="true" />
          {t('sites.newCta')}
        </Link>
      </header>

      {showToolbar ? (
        <SitesToolbar
          query={query}
          onQueryChange={setQuery}
          status={status}
          onStatusChange={setStatus}
          onClear={clearFilters}
          counts={counts}
        />
      ) : null}

      {error ? (
        <Card>
          <div className="table-state table-state--error">
            <h3 className="table-state__title">{t('sites.loadFailed')}</h3>
            <p className="table-state__text">{t('sites.loadFailedText')}</p>
            <button type="button" className="btn btn--primary" onClick={refetch}>
              {t('common.retry')}
            </button>
          </div>
        </Card>
      ) : isLoading ? (
        <Card>
          <div className="page-status">
            <span className="spinner" aria-hidden="true" />
            {t('sites.loading')}
          </div>
        </Card>
      ) : total === 0 ? (
        <Card>
          <SitesEmptyState
            titleKey="workspaces.overview.sitesEmptyTitle"
            textKey="workspaces.overview.sitesEmptyText"
            ctaKey="workspaces.overview.newSiteCta"
          />
        </Card>
      ) : hasNoResults ? (
        <Card>
          <div className="sites-no-results">
            <h3 className="sites-no-results__title">{t('sites.noResultsTitle')}</h3>
            <p className="sites-no-results__text">{t('sites.noResultsText')}</p>
            <button type="button" className="btn btn--outline" onClick={clearFilters}>
              {t('sites.clearFilters')}
            </button>
          </div>
        </Card>
      ) : (
        <>
          <div className="sites-page__listhead">
            <h3 className="workspace-section__title">
              {isFiltered ? t('sites.resultsTitle') : t('sites.recentTitle')}
            </h3>
            <p className="sites-page__count" role="status">
              {isFiltered
                ? t('sites.resultCount', { count: visibleSites.length, total })
                : t('sites.totalCount', { count: total })}
            </p>
          </div>
          <ul className="site-grid">
            {visibleSites.map((site) => (
              <li key={site.id}>
                <SiteCard site={site} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default WorkspaceSitesPage
