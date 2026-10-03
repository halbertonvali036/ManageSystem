import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Cable } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import useWorkspace from '@/hooks/useWorkspace'
import useWorkspaceIntegrations from '@/hooks/useWorkspaceIntegrations'
import integrationService from '@/services/integrationService'
import { BackendNotConnectedError } from '@/services/httpClient'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import WorkspaceBreadcrumb from '@/components/workspaces/WorkspaceBreadcrumb'
import WorkspaceSectionNav from '@/components/workspaces/WorkspaceSectionNav'
import IntegrationCard from '@/components/integrations/IntegrationCard'
import {
  INTEGRATION_CATEGORIES,
  INTEGRATION_CATEGORY_LABEL_KEYS,
  INTEGRATION_FILTER_ALL,
  INTEGRATION_STATUSES,
} from '@/models/integration'
import { WORKSPACE_INTEGRATIONS_PATH } from '@/utils/constants'

/**
 * Workspace Integrations — the catalog of connectable external services.
 *
 * Nothing here claims a service is connected unless the backend said so. Connect
 * and disconnect are requests; the list is only re-rendered from what comes back,
 * so a refused write leaves the page exactly as it was.
 */
function WorkspaceIntegrationsPage() {
  const { workspaceId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { workspace, isLoading: workspaceLoading } = useWorkspace(workspaceId)

  // Search matches what the user can read, so the resolved labels are handed to
  // the model rather than being stored on the integration.
  const getLabels = (integration) => ({
    name: t(integration.nameKey),
    description: t(integration.descriptionKey),
  })

  const {
    visibleIntegrations,
    total,
    connectedCount,
    needsConfigCount,
    isLoading,
    error,
    query,
    setQuery,
    status,
    setStatus,
    category,
    setCategory,
    isFiltered,
    clearFilters,
    refetch,
  } = useWorkspaceIntegrations(workspaceId, { getLabels })

  const [isBusy, setIsBusy] = useState(false)
  const [pendingId, setPendingId] = useState(null)
  const [actionError, setActionError] = useState(null)

  const integrationsPath = WORKSPACE_INTEGRATIONS_PATH(workspaceId)

  const runAction = async (id, action) => {
    setIsBusy(true)
    setActionError(null)
    try {
      await action()
      setPendingId(null)
      refetch()
    } catch (err) {
      setActionError(
        err instanceof BackendNotConnectedError
          ? t('workspaceIntegrations.unavailableNotice')
          : t('workspaceIntegrations.actionFailed')
      )
    } finally {
      setIsBusy(false)
    }
  }

  // Connecting opens the detail view, because most services need a configuration
  // before they can be connected at all.
  const handleConnect = (integration) => {
    setActionError(null)
    navigate(`${integrationsPath}/${integration.id}?action=connect`)
  }

  // Switching one off removes live access, so it goes through the shared confirm.
  const handleDisconnect = (integration) => {
    setActionError(null)
    setPendingId(integration.id)
  }

  const pendingIntegration = visibleIntegrations.find(
    (item) => item.id === pendingId
  )

  return (
    <div className="workspaces-page int-page">
      <WorkspaceBreadcrumb workspace={workspace} section="integrations" />
      <WorkspaceSectionNav workspaceId={workspaceId} />

      <header className="workspaces-page__head">
        <div className="workspaces-page__headline">
          <h1 className="workspaces-page__title">
            <Cable size={22} aria-hidden="true" />
            {t('workspaceIntegrations.pageTitle')}
          </h1>
          <p className="page-description">
            {t('workspaceIntegrations.pageDescription')}
          </p>
        </div>

        <div className="int-page__summary" role="status">
          <span className="int-page__count">
            {t('workspaceIntegrations.totalCount', { count: total })}
          </span>
          <span className="int-page__count">
            {t('workspaceIntegrations.connectedCount', { count: connectedCount })}
          </span>
          <span className="int-page__count">
            {t('workspaceIntegrations.needsConfigCount', { count: needsConfigCount })}
          </span>
        </div>
      </header>

      {actionError ? (
        <div className="form-notice form-notice--error" role="alert">
          {actionError}
        </div>
      ) : null}

      <div className="int-page__toolbar">
        <div className="db-search">
          <label className="db-search__label" htmlFor="int-search">
            {t('workspaceIntegrations.searchLabel')}
          </label>
          <input
            id="int-search"
            type="search"
            className="form__input db-search__input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('workspaceIntegrations.searchPlaceholder')}
          />
        </div>

        <div className="int-page__filters">
          <label className="int-page__filter" htmlFor="int-status">
            <span className="visually-hidden">
              {t('workspaceIntegrations.filterStatusLabel')}
            </span>
            <select
              id="int-status"
              className="form__select"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value={INTEGRATION_FILTER_ALL}>
                {t('workspaceIntegrations.filterAllStatus')}
              </option>
              {INTEGRATION_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {t(`workspaceIntegrations.status.${statusKeySuffix(item)}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="int-page__filter" htmlFor="int-category">
            <span className="visually-hidden">
              {t('workspaceIntegrations.filterCategoryLabel')}
            </span>
            <select
              id="int-category"
              className="form__select"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value={INTEGRATION_FILTER_ALL}>
                {t('workspaceIntegrations.filterAllCategories')}
              </option>
              {INTEGRATION_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {t(INTEGRATION_CATEGORY_LABEL_KEYS[item])}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {error ? (
        <Card>
          <div className="table-state table-state--error">
            <h3 className="table-state__title">
              {t('workspaceIntegrations.loadFailed')}
            </h3>
            <p className="table-state__text">
              {t('workspaceIntegrations.loadFailedText')}
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
            {t('workspaceIntegrations.loading')}
          </div>
        </Card>
      ) : isFiltered && visibleIntegrations.length === 0 ? (
        <Card>
          <div className="sites-no-results">
            <h3 className="sites-no-results__title">
              {t('workspaceIntegrations.noResultsTitle')}
            </h3>
            <p className="sites-no-results__text">
              {t('workspaceIntegrations.noResultsText')}
            </p>
            <button type="button" className="btn btn--outline" onClick={clearFilters}>
              {t('workspaceIntegrations.clearFilters')}
            </button>
          </div>
        </Card>
      ) : (
        <ul className="int-list">
          {visibleIntegrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              workspaceId={workspaceId}
              isBusy={isBusy || workspaceLoading}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onConfigure={(item) => navigate(`${integrationsPath}/${item.id}`)}
            />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(pendingId)}
        title={t('workspaceIntegrations.confirm.disconnectTitle')}
        message={t('workspaceIntegrations.confirm.disconnectText', {
          name: pendingIntegration ? t(pendingIntegration.nameKey) : '',
        })}
        confirmLabel={t('workspaceIntegrations.card.disconnectCta')}
        confirmingLabel={t('workspaceIntegrations.confirm.disconnecting')}
        cancelLabel={t('workspaceIntegrations.settings.cancel')}
        isConfirming={isBusy}
        error={actionError}
        onConfirm={() =>
          runAction(pendingId, () =>
            integrationService.disconnectIntegration(pendingId, workspaceId)
          )
        }
        onCancel={() => {
          setPendingId(null)
          setActionError(null)
        }}
      />
    </div>
  )
}

/** `not_connected` reads as `notConnected` in the locale files. */
function statusKeySuffix(status) {
  return status.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

export default WorkspaceIntegrationsPage
