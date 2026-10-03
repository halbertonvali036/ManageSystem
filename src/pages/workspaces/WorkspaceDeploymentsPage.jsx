import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Rocket } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import useWorkspace from '@/hooks/useWorkspace'
import useWorkspaceDeployments from '@/hooks/useWorkspaceDeployments'
import deploymentService from '@/services/deploymentService'
import { BackendNotConnectedError } from '@/services/httpClient'
import Card from '@/components/common/Card'
import WorkspaceBreadcrumb from '@/components/workspaces/WorkspaceBreadcrumb'
import WorkspaceSectionNav from '@/components/workspaces/WorkspaceSectionNav'
import DeploymentCard from '@/components/deployments/DeploymentCard'
import {
  DEPLOYMENT_FILTER_ALL,
  DEPLOYMENT_STATUSES,
  DEPLOYMENT_STATUS_LABEL_KEYS,
} from '@/models/deployment'

/**
 * Workspace Deployments — the publish history for every site in the workspace.
 *
 * A deployment appears here only when the backend reported one. The list starts
 * empty, not with a sample success: a fabricated "live" row would be indistinguishable
 * from a real one, and the obvious next action on it is to redeploy or roll back.
 *
 * Deploy itself lives on the site, because a deploy needs a site. The button here
 * stays disabled and says why when there is no backend to send the request to.
 */
function WorkspaceDeploymentsPage() {
  const { workspaceId } = useParams()
  const { t } = useTranslation()
  const { workspace } = useWorkspace(workspaceId)

  const {
    deployments,
    visibleDeployments,
    total,
    liveCount,
    failedCount,
    isLoading,
    error,
    query,
    setQuery,
    status,
    setStatus,
    siteId,
    setSiteId,
    isFiltered,
    clearFilters,
    liveDeployment,
    refetch,
  } = useWorkspaceDeployments(workspaceId)

  const [isBusy, setIsBusy] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const [actionError, setActionError] = useState(null)

  // The sites this workspace can publish, read from the backend like everything else.
  // Keyed by workspace so a stale response for a previous workspace is discarded, and
  // so the loading flag falls out of the key rather than being toggled in the effect.
  const [siteResult, setSiteResult] = useState({ key: null, sites: [] })
  const [selectedSiteId, setSelectedSiteId] = useState('')
  const [isDeploying, setIsDeploying] = useState(false)

  const siteKey = workspaceId ?? null

  useEffect(() => {
    if (siteKey === null) {
      return undefined
    }

    let isActive = true

    deploymentService
      .getDeployableSites(siteKey)
      .then((rows) => {
        if (isActive) setSiteResult({ key: siteKey, sites: Array.isArray(rows) ? rows : [] })
      })
      .catch(() => {
        // A missing site list is not a page-level failure: the history below is still
        // valid, and the deploy form simply stays unavailable.
        if (isActive) setSiteResult({ key: siteKey, sites: [] })
      })

    return () => {
      isActive = false
    }
  }, [siteKey])

  const sites = siteResult.key === siteKey ? siteResult.sites : []
  const isLoadingSites = siteKey !== null && siteResult.key !== siteKey

  /**
   * Requests a publish of the selected site.
   *
   * The request is fire-and-report: it is never treated as a success, and the history
   * is only re-read so the backend can state what the deploy actually became.
   */
  const handleDeploy = async (event) => {
    event.preventDefault()
    if (!selectedSiteId) return

    setIsDeploying(true)
    setActionError(null)
    try {
      await deploymentService.deploySite(selectedSiteId, workspaceId)
      refetch()
    } catch (err) {
      setActionError(
        err instanceof BackendNotConnectedError
          ? t('workspaceDeployments.unavailableNotice')
          : t('workspaceDeployments.actionFailed')
      )
    } finally {
      setIsDeploying(false)
    }
  }

  /**
   * Runs a write and re-reads the history from the backend.
   *
   * A deploy request that is accepted changes nothing here until the backend reports
   * a new row, which is why the list is only ever re-rendered from a read.
   */
  const runAction = async (deployment, action) => {
    setIsBusy(true)
    setActionError(null)
    setPendingAction(deployment.id)
    try {
      await action()
      refetch()
    } catch (err) {
      setActionError(
        err instanceof BackendNotConnectedError
          ? t('workspaceDeployments.unavailableNotice')
          : t('workspaceDeployments.actionFailed')
      )
    } finally {
      setIsBusy(false)
      setPendingAction(null)
    }
  }

  // Sites available to narrow by, taken from the rows the backend already sent.
  // An empty history means no filter options, which is accurate rather than a gap.
  const siteOptions = [...new Set(deployments.map((item) => item.siteId))].filter(Boolean)

  return (
    <div className="workspaces-page dep-page">
      <WorkspaceBreadcrumb workspace={workspace} section="deployments" />
      <WorkspaceSectionNav workspaceId={workspaceId} />

      <header className="workspaces-page__head">
        <div className="workspaces-page__headline">
          <h1 className="workspaces-page__title">
            <Rocket size={22} aria-hidden="true" />
            {t('workspaceDeployments.pageTitle')}
          </h1>
          <p className="page-description">
            {t('workspaceDeployments.pageDescription')}
          </p>
        </div>

        <div className="dep-page__summary" role="status">
          <span className="dep-page__count">
            {t('workspaceDeployments.totalCount', { count: total })}
          </span>
          <span className="dep-page__count">
            {t('workspaceDeployments.liveCount', { count: liveCount })}
          </span>
          <span className="dep-page__count">
            {t('workspaceDeployments.failedCount', { count: failedCount })}
          </span>
        </div>
      </header>

      <Card>
        <h2 className="card__title">{t('workspaceDeployments.currentTitle')}</h2>
        {liveDeployment ? (
          <div className="dep-current">
            <p className="dep-current__version">
              {liveDeployment.version ??
                t('workspaceDeployments.card.unversioned')}
            </p>
            {liveDeployment.publishedUrl ? (
              <a
                className="dep-current__url"
                href={liveDeployment.publishedUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                {liveDeployment.publishedUrl}
              </a>
            ) : null}
            <p className="form__hint">{t('workspaceDeployments.currentHint')}</p>
          </div>
        ) : (
          <p className="form__hint">{t('workspaceDeployments.noLiveText')}</p>
        )}

        <form className="dep-deploy" onSubmit={handleDeploy} noValidate>
          <div className="dep-deploy__field">
            <label className="form__label" htmlFor="dep-site-select">
              {t('workspaceDeployments.deploy.siteLabel')}
            </label>
            <select
              id="dep-site-select"
              className="form__select"
              value={selectedSiteId}
              onChange={(event) => setSelectedSiteId(event.target.value)}
              disabled={isLoadingSites || sites.length === 0}
            >
              <option value="">{t('workspaceDeployments.deploy.sitePlaceholder')}</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name ?? site.id}
                </option>
              ))}
            </select>
            <p className="form__hint" id="dep-deploy-hint">
              {sites.length === 0 && !isLoadingSites
                ? t('workspaceDeployments.deploy.noSites')
                : t('workspaceDeployments.deploy.hint')}
            </p>
          </div>

          <button
            type="submit"
            className="btn btn--primary dep-deploy__submit"
            // Disabled until a site is named: the request cannot go out otherwise.
            disabled={isDeploying || !selectedSiteId || sites.length === 0}
            aria-describedby="dep-deploy-hint"
          >
            <Rocket size={15} aria-hidden="true" />
            {isDeploying
              ? t('workspaceDeployments.deploy.requesting')
              : t('workspaceDeployments.deployCta')}
          </button>
        </form>
      </Card>

      {actionError ? (
        <div className="form-notice form-notice--error" role="alert">
          {actionError}
        </div>
      ) : null}

      <div className="dep-page__toolbar">
        <div className="db-search">
          <label className="db-search__label" htmlFor="dep-search">
            {t('workspaceDeployments.searchLabel')}
          </label>
          <input
            id="dep-search"
            type="search"
            className="form__input db-search__input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('workspaceDeployments.searchPlaceholder')}
          />
        </div>

        <div className="dep-page__filters">
          <label className="dep-page__filter" htmlFor="dep-status">
            <span className="visually-hidden">
              {t('workspaceDeployments.filterStatusLabel')}
            </span>
            <select
              id="dep-status"
              className="form__select"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value={DEPLOYMENT_FILTER_ALL}>
                {t('workspaceDeployments.filterAllStatus')}
              </option>
              {DEPLOYMENT_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {t(DEPLOYMENT_STATUS_LABEL_KEYS[item])}
                </option>
              ))}
            </select>
          </label>

          {siteOptions.length > 0 ? (
            <label className="dep-page__filter" htmlFor="dep-site">
              <span className="visually-hidden">
                {t('workspaceDeployments.filterSiteLabel')}
              </span>
              <select
                id="dep-site"
                className="form__select"
                value={siteId ?? ''}
                onChange={(event) =>
                  setSiteId(event.target.value ? event.target.value : null)
                }
              >
                <option value="">{t('workspaceDeployments.filterAllSites')}</option>
                {siteOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      </div>

      {error ? (
        <Card>
          <div className="table-state table-state--error">
            <h3 className="table-state__title">
              {t('workspaceDeployments.loadFailed')}
            </h3>
            <p className="table-state__text">
              {t('workspaceDeployments.loadFailedText')}
            </p>
            <button type="button" className="btn btn--primary" onClick={refetch}>
              {t('common.retry')}
            </button>
          </div>
        </Card>
      ) : isLoading ? (
        <Card>
          <div className="page-status">
            <span className="spinner" aria-hidden="true" />
            {t('workspaceDeployments.loading')}
          </div>
        </Card>
      ) : isFiltered && visibleDeployments.length === 0 ? (
        <Card>
          <div className="sites-no-results">
            <h3 className="sites-no-results__title">
              {t('workspaceDeployments.noResultsTitle')}
            </h3>
            <p className="sites-no-results__text">
              {t('workspaceDeployments.noResultsText')}
            </p>
            <button type="button" className="btn btn--outline" onClick={clearFilters}>
              {t('workspaceDeployments.clearFilters')}
            </button>
          </div>
        </Card>
      ) : visibleDeployments.length === 0 ? (
        <Card>
          <div className="dep-empty">
            <Rocket size={20} aria-hidden="true" />
            <h3 className="dep-empty__title">
              {t('workspaceDeployments.emptyTitle')}
            </h3>
            <p className="dep-empty__text">{t('workspaceDeployments.emptyText')}</p>
            <p className="form__hint">
              {t('workspaceDeployments.deployHint')}
            </p>
          </div>
        </Card>
      ) : (
        <ul className="dep-list">
          {visibleDeployments.map((deployment) => (
            <DeploymentCard
              key={deployment.id}
              deployment={deployment}
              workspaceId={workspaceId}
              latestLive={liveDeployment}
              isBusy={isBusy && pendingAction === deployment.id}
              onStop={(item) =>
                runAction(item, () => deploymentService.stopDeployment(item.id, workspaceId))
              }
              onRedeploy={(item) =>
                runAction(item, () => deploymentService.redeploy(item.id, workspaceId))
              }
              onRollback={(item) =>
                runAction(item, () => deploymentService.rollbackDeployment(item.id, workspaceId))
              }
            />
          ))}
        </ul>
      )}
    </div>
  )
}

export default WorkspaceDeploymentsPage
