import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '@/components/common/Card'
import SiteCard from '@/components/sites/SiteCard'
import SitesEmptyState from '@/components/sites/SitesEmptyState'
import SitesToolbar from '@/components/sites/SitesToolbar'
import useTranslation from '@/hooks/useTranslation'
import useSites from '@/hooks/useSites'
import { NEW_SITE_PATH } from '@/utils/constants'

/**
 * My Websites — the primary workspace after sign-in.
 *
 * Lists the account's real projects. Without a backend the list is empty and
 * the page shows an onboarding empty state; no sample project is ever rendered
 * to fill the grid.
 */
function MyWebsitesPage() {
  const { t } = useTranslation()
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
  } = useSites()

  const showToolbar = total > 0
  const hasNoResults = total > 0 && visibleSites.length === 0

  return (
    <div className="sites-page">
      <header className="sites-page__head">
        <div className="sites-page__headline">
          <h1 className="sites-page__title">{t('sites.pageTitle')}</h1>
          <p className="page-description">{t('sites.pageDescription')}</p>
        </div>

        <Link to={NEW_SITE_PATH} className="btn btn--primary sites-page__cta">
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
          <SitesEmptyState />
        </Card>
      ) : hasNoResults ? (
        <Card>
          <div className="sites-no-results">
            <h3 className="sites-no-results__title">
              {t('sites.noResultsTitle')}
            </h3>
            <p className="sites-no-results__text">{t('sites.noResultsText')}</p>
            <button
              type="button"
              className="btn btn--outline"
              onClick={clearFilters}
            >
              {t('sites.clearFilters')}
            </button>
          </div>
        </Card>
      ) : (
        <>
          <div className="sites-page__listhead">
            <h3 className="workspace-section__title">
              {isFiltered
                ? t('sites.resultsTitle')
                : t('sites.recentTitle')}
            </h3>
            <p className="sites-page__count" role="status">
              {isFiltered
                ? t('sites.resultCount', {
                    count: visibleSites.length,
                    total,
                  })
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

export default MyWebsitesPage
