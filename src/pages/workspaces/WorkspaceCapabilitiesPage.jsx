import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Boxes } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import useWorkspace from '@/hooks/useWorkspace'
import useWorkspaceCapabilities from '@/hooks/useWorkspaceCapabilities'
import capabilityService from '@/services/capabilityService'
import { BackendNotConnectedError } from '@/services/httpClient'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import WorkspaceBreadcrumb from '@/components/workspaces/WorkspaceBreadcrumb'
import WorkspaceSectionNav from '@/components/workspaces/WorkspaceSectionNav'
import CapabilityCard from '@/components/capabilities/CapabilityCard'
import { CAPABILITY_FILTER_ALL, CAPABILITY_STATUSES } from '@/models/capability'
import { WORKSPACE_CAPABILITIES_PATH } from '@/utils/constants'

/**
 * Workspace Capabilities — the catalog of reusable modules.
 *
 * Each card is a declaration, not a re-implementation: it names the module that
 * already exists in this product and links to it. Nothing is persisted locally —
 * Enable / Disable are requests, and the card only changes when the backend
 * confirms. Without a backend every write is refused with a message that says so.
 */
function WorkspaceCapabilitiesPage() {
  const { workspaceId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { workspace, isLoading: workspaceLoading } = useWorkspace(workspaceId)

  // Search matches what the user can read, so the resolved labels are handed to
  // the model rather than being stored on the capability.
  const getLabels = (capability) => ({
    name: t(capability.nameKey),
    description: t(capability.descriptionKey),
  })

  const {
    visibleCapabilities,
    total,
    enabledCount,
    integrationCount,
    isLoading,
    error,
    query,
    setQuery,
    status,
    setStatus,
    isFiltered,
    clearFilters,
    refetch,
  } = useWorkspaceCapabilities(workspaceId, { getLabels })

  const [isBusy, setIsBusy] = useState(false)
  const [pendingId, setPendingId] = useState(null)
  const [actionError, setActionError] = useState(null)

  const capabilitiesPath = WORKSPACE_CAPABILITIES_PATH(workspaceId)

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
          ? t('workspaceCapabilities.unavailableNotice')
          : t('workspaceCapabilities.actionFailed')
      )
    } finally {
      setIsBusy(false)
    }
  }

  // Switching on is reversible and asks nothing; switching off goes through the
  // shared confirm dialog, because it changes what a workspace can do.
  const handleToggle = (capability, enable) => {
    setActionError(null)

    if (!enable) {
      setPendingId(capability.id)
      return
    }

    runAction(capability.id, () =>
      capabilityService.enableCapability(workspaceId, capability.id)
    )
  }

  const pendingCapability = visibleCapabilities.find((item) => item.id === pendingId)

  return (
    <div className="workspaces-page cap-page">
      <WorkspaceBreadcrumb workspace={workspace} section="capabilities" />
      <WorkspaceSectionNav workspaceId={workspaceId} />

      <header className="workspaces-page__head">
        <div className="workspaces-page__headline">
          <h1 className="workspaces-page__title">
            <Boxes size={22} aria-hidden="true" />
            {t('workspaceCapabilities.pageTitle')}
          </h1>
          <p className="page-description">{t('workspaceCapabilities.pageDescription')}</p>
        </div>

        <div className="cap-page__summary" role="status">
          <span className="cap-page__count">
            {t('workspaceCapabilities.totalCount', { count: total })}
          </span>
          <span className="cap-page__count">{t('workspaceCapabilities.enabledCount', { count: enabledCount })}</span>
          <span className="cap-page__count">
            {t('workspaceCapabilities.integrationCount', { count: integrationCount })}
          </span>
        </div>
      </header>

      {actionError ? (
        <div className="form-notice form-notice--error" role="alert">
          {actionError}
        </div>
      ) : null}

      <div className="cap-page__toolbar">
        <div className="db-search">
          <label className="db-search__label" htmlFor="cap-search">
            {t('workspaceCapabilities.searchLabel')}
          </label>
          <input
            id="cap-search"
            type="search"
            className="form__input db-search__input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('workspaceCapabilities.searchPlaceholder')}
          />
        </div>

        <label className="cap-page__filter" htmlFor="cap-status">
          <span className="visually-hidden">{t('workspaceCapabilities.filterLabel')}</span>
          <select
            id="cap-status"
            className="form__select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value={CAPABILITY_FILTER_ALL}>{t('workspaceCapabilities.filterAll')}</option>
            {CAPABILITY_STATUSES.map((item) => (
              <option key={item} value={item}>
                {t(`capabilities.status.${item}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <Card>
          <div className="table-state table-state--error">
            <h3 className="table-state__title">{t('workspaceCapabilities.loadFailed')}</h3>
            <p className="table-state__text">{t('workspaceCapabilities.loadFailedText')}</p>
            <button type="button" className="btn btn--primary" onClick={refetch}>
              {t('common.retry')}
            </button>
          </div>
        </Card>
      ) : isLoading ? (
        <Card>
          <div className="page-status">
            <span className="spinner" aria-hidden="true" />
            {t('workspaceCapabilities.loading')}
          </div>
        </Card>
      ) : isFiltered && visibleCapabilities.length === 0 ? (
        <Card>
          <div className="sites-no-results">
            <h3 className="sites-no-results__title">{t('workspaceCapabilities.noResultsTitle')}</h3>
            <p className="sites-no-results__text">{t('workspaceCapabilities.noResultsText')}</p>
            <button type="button" className="btn btn--outline" onClick={clearFilters}>
              {t('workspaceCapabilities.clearFilters')}
            </button>
          </div>
        </Card>
      ) : (
        <ul className="cap-list">
          {visibleCapabilities.map((capability) => (
            <CapabilityCard
              key={capability.id}
              capability={capability}
              workspaceId={workspaceId}
              isBusy={isBusy || workspaceLoading}
              onToggle={handleToggle}
              onConfigure={(item) =>
                navigate(`${capabilitiesPath}/${item.id}`)
              }
            />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(pendingId)}
        title={t('workspaceCapabilities.confirm.disableTitle')}
        message={t('workspaceCapabilities.confirm.disableText', {
          name: pendingCapability ? t(pendingCapability.nameKey) : '',
        })}
        confirmLabel={t('workspaceCapabilities.card.disableCta')}
        cancelLabel={t('workspaceCapabilities.settings.cancel')}
        isConfirming={isBusy}
        error={actionError}
        onConfirm={() =>
          runAction(pendingId, () =>
            capabilityService.disableCapability(workspaceId, pendingId)
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

export default WorkspaceCapabilitiesPage
