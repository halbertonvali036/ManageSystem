import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Globe, RefreshCw, ShieldCheck, Star, Trash2 } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import useWorkspace from '@/hooks/useWorkspace'
import useWorkspaceDomain from '@/hooks/useWorkspaceDomain'
import domainService from '@/services/domainService'
import { BackendNotConnectedError } from '@/services/httpClient'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import WorkspaceBreadcrumb from '@/components/workspaces/WorkspaceBreadcrumb'
import WorkspaceSectionNav from '@/components/workspaces/WorkspaceSectionNav'
import DnsRecordTable from '@/components/domains/DnsRecordTable'
import {
  DOMAIN_STATUS,
  DOMAIN_STATUS_LABEL_KEYS,
  DOMAIN_STATUS_VARIANTS,
  DOMAIN_TYPE,
  DOMAIN_TYPE_LABEL_KEYS,
  DOMAIN_TYPE_VARIANTS,
  SSL_STATUS,
  SSL_STATUS_LABEL_KEYS,
  SSL_STATUS_VARIANTS,
  getDomainActions,
} from '@/models/domain'
import { WORKSPACE_DOMAINS_PATH } from '@/utils/constants'

/**
 * One domain — its state, the DNS records behind it, and the actions available.
 *
 * The two states on this page are shown separately on purpose. "Connected" answers
 * "does this name serve the workspace?"; "SSL active" answers "is there a valid
 * certificate?". Collapsing them would let a page imply a secure site while the
 * certificate is still being issued, which is exactly the mistake that produces a
 * browser warning on a customer's domain.
 *
 * Verify is a request. It does not mark the domain connected: the backend resolves
 * the records, and until it reports success the state stays exactly as it is.
 */
function WorkspaceDomainPage() {
  const { workspaceId, domainId } = useParams()
  const { t } = useTranslation()
  const { workspace } = useWorkspace(workspaceId)
  const { domain, isLoading, error, refetch } = useWorkspaceDomain(
    workspaceId,
    domainId
  )

  const [isBusy, setIsBusy] = useState(false)
  const [isRemoveOpen, setIsRemoveOpen] = useState(false)
  const [actionError, setActionError] = useState(null)

  const actions = getDomainActions(domain)

  const runAction = async (action, { closeDialog = false } = {}) => {
    setIsBusy(true)
    setActionError(null)
    try {
      await action()
      if (closeDialog) setIsRemoveOpen(false)
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

  if (isLoading) {
    return (
      <div className="workspaces-page dom-page">
        <WorkspaceSectionNav workspaceId={workspaceId} />
        <Card>
          <div className="page-status">
            <span className="spinner" aria-hidden="true" />
            {t('workspaceDomains.loading')}
          </div>
        </Card>
      </div>
    )
  }

  if (error || !domain) {
    return (
      <div className="workspaces-page dom-page">
        <WorkspaceSectionNav workspaceId={workspaceId} />
        <Card>
          <div className="table-state table-state--error">
            <h2 className="table-state__title">
              {t('workspaceDomains.notFoundTitle')}
            </h2>
            <p className="table-state__text">
              {t('workspaceDomains.notFoundText')}
            </p>
            <Link
              className="btn btn--primary"
              to={WORKSPACE_DOMAINS_PATH(workspaceId)}
            >
              {t('workspaceDomains.backToList')}
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  const isPlatform = domain.type === DOMAIN_TYPE.PLATFORM
  const isVerified = domain.status === DOMAIN_STATUS.CONNECTED
  const isSslActive = domain.sslStatus === SSL_STATUS.ACTIVE

  return (
    <div className="workspaces-page dom-page">
      <WorkspaceBreadcrumb workspace={workspace} section="domains" />
      <WorkspaceSectionNav workspaceId={workspaceId} />

      <header className="workspaces-page__head">
        <div className="workspaces-page__headline">
          <Link
            className="dom-page__back"
            to={WORKSPACE_DOMAINS_PATH(workspaceId)}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {t('workspaceDomains.backToList')}
          </Link>
          <h1 className="workspaces-page__title">
            <Globe size={22} aria-hidden="true" />
            {domain.hostname}
          </h1>
          <div className="dom-card__badges">
            <span className={`dom-chip dom-chip--${DOMAIN_TYPE_VARIANTS[domain.type]}`}>
              {t(DOMAIN_TYPE_LABEL_KEYS[domain.type])}
            </span>
            <span className={`dom-chip dom-chip--${DOMAIN_STATUS_VARIANTS[domain.status]}`}>
              {t(DOMAIN_STATUS_LABEL_KEYS[domain.status])}
            </span>
            <span
              className={`dom-chip dom-chip--ssl-${SSL_STATUS_VARIANTS[domain.sslStatus]}`}
            >
              <ShieldCheck size={13} aria-hidden="true" />
              {t(SSL_STATUS_LABEL_KEYS[domain.sslStatus])}
            </span>
            {domain.isPrimary ? (
              <span className="dom-chip dom-chip--primary">
                <Star size={13} aria-hidden="true" />
                {t('workspaceDomains.card.primaryBadge')}
              </span>
            ) : null}
          </div>
        </div>

        <div className="dom-page__actions">
          {actions.canVerify ? (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => runAction(() => domainService.verifyDomain(domain.id, workspaceId))}
              disabled={isBusy}
            >
              <RefreshCw size={15} aria-hidden="true" />
              {t('workspaceDomains.card.verifyCta')}
            </button>
          ) : null}

          {actions.canSetPrimary ? (
            <button
              type="button"
              className="btn btn--outline"
              onClick={() =>
                runAction(() => domainService.setPrimaryDomain(domain.id, workspaceId))
              }
              disabled={isBusy}
            >
              <Star size={15} aria-hidden="true" />
              {t('workspaceDomains.card.setPrimaryCta')}
            </button>
          ) : null}

          {actions.canRemove ? (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setIsRemoveOpen(true)}
              disabled={isBusy}
            >
              <Trash2 size={15} aria-hidden="true" />
              {t('workspaceDomains.card.removeCta')}
            </button>
          ) : null}
        </div>
      </header>

      {actionError ? (
        <div className="form-notice form-notice--error" role="alert">
          {actionError}
        </div>
      ) : null}

      {domain.status === DOMAIN_STATUS.ERROR && domain.verificationMessage ? (
        <div className="form-notice form-notice--error" role="alert">
          {domain.verificationMessage}
        </div>
      ) : null}

      {isVerified && !isSslActive ? (
        <div className="form-notice form-notice--warning">
          {t('workspaceDomains.ssl.pendingWarning')}
        </div>
      ) : null}

      <Card>
        <h2 className="card__title">{t('workspaceDomains.detail.stateTitle')}</h2>
        <dl className="dom-detail__grid">
          <div className="dom-detail__row">
            <dt>{t('workspaceDomains.detail.hostname')}</dt>
            <dd>{domain.hostname}</dd>
          </div>
          <div className="dom-detail__row">
            <dt>{t('workspaceDomains.detail.type')}</dt>
            <dd>{t(DOMAIN_TYPE_LABEL_KEYS[domain.type])}</dd>
          </div>
          <div className="dom-detail__row">
            <dt>{t('workspaceDomains.detail.status')}</dt>
            <dd>{t(DOMAIN_STATUS_LABEL_KEYS[domain.status])}</dd>
          </div>
          <div className="dom-detail__row">
            <dt>{t('workspaceDomains.detail.ssl')}</dt>
            <dd>{t(SSL_STATUS_LABEL_KEYS[domain.sslStatus])}</dd>
          </div>
          {domain.verifiedAt ? (
            <div className="dom-detail__row">
              <dt>{t('workspaceDomains.detail.verifiedAt')}</dt>
              <dd>{domain.verifiedAt}</dd>
            </div>
          ) : null}
          {domain.sslExpiresAt ? (
            <div className="dom-detail__row">
              <dt>{t('workspaceDomains.detail.sslExpiresAt')}</dt>
              <dd>{domain.sslExpiresAt}</dd>
            </div>
          ) : null}
        </dl>
      </Card>

      <Card>
        <h2 className="card__title">{t('workspaceDomains.dns.title')}</h2>
        {isPlatform ? (
          <p className="dom-empty__text">{t('workspaceDomains.dns.platformNotice')}</p>
        ) : (
          <>
            <p className="form__hint">{t('workspaceDomains.dns.intro')}</p>
            <DnsRecordTable records={domain.dnsRecords} />
          </>
        )}
      </Card>

      <Card>
        <h2 className="card__title">{t('workspaceDomains.security.title')}</h2>
        <ul className="dom-security__list">
          <li>{t('workspaceDomains.security.verifyNote')}</li>
          <li>{t('workspaceDomains.security.sslNote')}</li>
          <li>{t('workspaceDomains.security.dnsNote')}</li>
        </ul>
      </Card>

      <ConfirmDialog
        open={isRemoveOpen}
        title={t('workspaceDomains.confirm.removeTitle')}
        message={t('workspaceDomains.confirm.removeText', { hostname: domain.hostname })}
        confirmLabel={t('workspaceDomains.card.removeCta')}
        confirmingLabel={t('workspaceDomains.confirm.removing')}
        cancelLabel={t('workspaceDomains.form.cancel')}
        isConfirming={isBusy}
        error={actionError}
        onConfirm={() =>
          runAction(() => domainService.removeDomain(domain.id, workspaceId), {
            closeDialog: true,
          })
        }
        onCancel={() => {
          setIsRemoveOpen(false)
          setActionError(null)
        }}
      />
    </div>
  )
}

export default WorkspaceDomainPage
