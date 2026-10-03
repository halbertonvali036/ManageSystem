import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Globe } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import useWorkspace from '@/hooks/useWorkspace'
import useWorkspaceDomains from '@/hooks/useWorkspaceDomains'
import domainService from '@/services/domainService'
import { BackendNotConnectedError } from '@/services/httpClient'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import WorkspaceBreadcrumb from '@/components/workspaces/WorkspaceBreadcrumb'
import WorkspaceSectionNav from '@/components/workspaces/WorkspaceSectionNav'
import DomainCard from '@/components/domains/DomainCard'
import DomainForm from '@/components/domains/DomainForm'
import {
  DOMAIN_FILTER_ALL,
  DOMAIN_STATUSES,
  DOMAIN_STATUS_LABEL_KEYS,
  DOMAIN_TYPES,
  DOMAIN_TYPE_LABEL_KEYS,
} from '@/models/domain'

/**
 * Workspace Domains — every name this workspace answers on.
 *
 * The list only ever contains domains the backend reported. An unconnected workspace
 * shows the add form and an empty list, which is the truth: there are no domains yet,
 * and inventing an example.com row would invite a DNS change against a hostname
 * nobody owns.
 */
function WorkspaceDomainsPage() {
  const { workspaceId } = useParams()
  const { t } = useTranslation()
  const { workspace, isLoading: workspaceLoading } = useWorkspace(workspaceId)

  const {
    domains,
    visibleDomains,
    total,
    connectedCount,
    pendingCount,
    errorCount,
    isLoading,
    error,
    query,
    setQuery,
    status,
    setStatus,
    type,
    setType,
    isFiltered,
    clearFilters,
    refetch,
  } = useWorkspaceDomains(workspaceId)

  const [isBusy, setIsBusy] = useState(false)
  const [pendingRemoval, setPendingRemoval] = useState(null)
  const [pendingAction, setPendingAction] = useState(null)
  const [actionError, setActionError] = useState(null)


  /**
   * Runs a write and re-reads the list from the backend.
   *
   * Nothing is updated optimistically: a domain only changes state once the backend
   * has said so, so a refused or unavailable write leaves the list untouched.
   */
  const runAction = async (action, { clearPending = true } = {}) => {
    setIsBusy(true)
    setActionError(null)
    try {
      await action()
      if (clearPending) {
        setPendingRemoval(null)
        setPendingAction(null)
      }
      refetch()
    } catch (err) {
      setActionError(
        err instanceof BackendNotConnectedError
          ? t('workspaceDomains.unavailableNotice')
          : t('workspaceDomains.actionFailed')
      )
    } finally {
      setIsBusy(false)
    }
  }

  const handleAdd = async (hostname) => {
    // A plain domain is attached to the workspace; a site-specific one names its site.
    await runAction(
      () => domainService.addDomain(hostname, workspaceId),
      { clearPending: false }
    )
  }

  const handleVerify = (domain) => {
    setActionError(null)
    setPendingAction(domain.id)
    runAction(() => domainService.verifyDomain(domain.id, workspaceId))
  }

  const handleSetPrimary = (domain) => {
    setActionError(null)
    setPendingAction(domain.id)
    runAction(() => domainService.setPrimaryDomain(domain.id, workspaceId))
  }

  const handleRemove = (domain) => {
    setActionError(null)
    setPendingRemoval(domain)
  }

  const isBusyFor = (id) => isBusy || workspaceLoading || pendingAction === id

  return (
    <div className="workspaces-page dom-page">
      <WorkspaceBreadcrumb workspace={workspace} section="domains" />
      <WorkspaceSectionNav workspaceId={workspaceId} />

      <header className="workspaces-page__head">
        <div className="workspaces-page__headline">
          <h1 className="workspaces-page__title">
            <Globe size={22} aria-hidden="true" />
            {t('workspaceDomains.pageTitle')}
          </h1>
          <p className="page-description">
            {t('workspaceDomains.pageDescription')}
          </p>
        </div>

        <div className="dom-page__summary" role="status">
          <span className="dom-page__count">
            {t('workspaceDomains.totalCount', { count: total })}
          </span>
          <span className="dom-page__count">
            {t('workspaceDomains.connectedCount', { count: connectedCount })}
          </span>
          <span className="dom-page__count">
            {t('workspaceDomains.pendingCount', { count: pendingCount })}
          </span>
          <span className="dom-page__count">
            {t('workspaceDomains.errorCount', { count: errorCount })}
          </span>
        </div>
      </header>

      <Card>
        <h2 className="card__title">{t('workspaceDomains.form.title')}</h2>
        <DomainForm
          existingHostnames={domains.map((domain) => domain.hostname)}
          isSubmitting={isBusy}
          onSubmit={handleAdd}
        />
      </Card>

      {actionError ? (
        <div className="form-notice form-notice--error" role="alert">
          {actionError}
        </div>
      ) : null}

      <div className="dom-page__toolbar">
        <div className="db-search">
          <label className="db-search__label" htmlFor="dom-search">
            {t('workspaceDomains.searchLabel')}
          </label>
          <input
            id="dom-search"
            type="search"
            className="form__input db-search__input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('workspaceDomains.searchPlaceholder')}
          />
        </div>

        <div className="dom-page__filters">
          <label className="dom-page__filter" htmlFor="dom-status">
            <span className="visually-hidden">
              {t('workspaceDomains.filterStatusLabel')}
            </span>
            <select
              id="dom-status"
              className="form__select"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value={DOMAIN_FILTER_ALL}>
                {t('workspaceDomains.filterAllStatus')}
              </option>
              {DOMAIN_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {t(DOMAIN_STATUS_LABEL_KEYS[item])}
                </option>
              ))}
            </select>
          </label>

          <label className="dom-page__filter" htmlFor="dom-type">
            <span className="visually-hidden">
              {t('workspaceDomains.filterTypeLabel')}
            </span>
            <select
              id="dom-type"
              className="form__select"
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <option value={DOMAIN_FILTER_ALL}>
                {t('workspaceDomains.filterAllTypes')}
              </option>
              {DOMAIN_TYPES.map((item) => (
                <option key={item} value={item}>
                  {t(DOMAIN_TYPE_LABEL_KEYS[item])}
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
              {t('workspaceDomains.loadFailed')}
            </h3>
            <p className="table-state__text">
              {t('workspaceDomains.loadFailedText')}
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
            {t('workspaceDomains.loading')}
          </div>
        </Card>
      ) : isFiltered && visibleDomains.length === 0 ? (
        <Card>
          <div className="sites-no-results">
            <h3 className="sites-no-results__title">
              {t('workspaceDomains.noResultsTitle')}
            </h3>
            <p className="sites-no-results__text">
              {t('workspaceDomains.noResultsText')}
            </p>
            <button type="button" className="btn btn--outline" onClick={clearFilters}>
              {t('workspaceDomains.clearFilters')}
            </button>
          </div>
        </Card>
      ) : visibleDomains.length === 0 ? (
        <Card>
          <div className="dom-empty">
            <Globe size={20} aria-hidden="true" />
            <h3 className="dom-empty__title">
              {t('workspaceDomains.emptyTitle')}
            </h3>
            <p className="dom-empty__text">{t('workspaceDomains.emptyText')}</p>
          </div>
        </Card>
      ) : (
        <ul className="dom-list">
          {visibleDomains.map((domain) => (
            <DomainCard
              key={domain.id}
              domain={domain}
              workspaceId={workspaceId}
              isBusy={isBusyFor(domain.id)}
              onVerify={handleVerify}
              onSetPrimary={handleSetPrimary}
              onRemove={handleRemove}
            />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(pendingRemoval)}
        title={t('workspaceDomains.confirm.removeTitle')}
        message={t('workspaceDomains.confirm.removeText', {
          hostname: pendingRemoval ? pendingRemoval.hostname : '',
        })}
        confirmLabel={t('workspaceDomains.card.removeCta')}
        confirmingLabel={t('workspaceDomains.confirm.removing')}
        cancelLabel={t('workspaceDomains.form.cancel')}
        isConfirming={isBusy}
        error={actionError}
        onConfirm={() =>
          runAction(() =>
            domainService.removeDomain(pendingRemoval.id, workspaceId)
          )
        }
        onCancel={() => {
          setPendingRemoval(null)
          setActionError(null)
        }}
      />
    </div>
  )
}

export default WorkspaceDomainsPage
