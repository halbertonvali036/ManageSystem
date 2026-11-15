import { useState } from 'react'
import useTranslation from '@/hooks/useTranslation'
import { normalizeDomainStatus } from '@/models/sitePublishing'
import { isValidDomainShape } from '@/models/siteSettings'
import siteDomainService from '@/services/siteDomainService'
import {
  BackendNotConnectedError,
  getRequestErrorMessage,
} from '@/services/httpClient'
import DnsRecords from './DnsRecords'

/**
 * The custom-domain controls: attach, verify, remove — plus the state the
 * server reports for the domain it holds.
 *
 * The hostname field itself lives one level up (it belongs to the settings
 * form); this component receives the value the visitor typed as `hostname` and
 * the server's answer as `remote`, so the two can be compared without either
 * one pretending to be the other. Every button performs a real request through
 * `siteDomainService`, is disabled until that request can succeed, and reports
 * its outcome — including the backend's own message for a validation error or
 * a plan that does not allow custom domains.
 *
 * The panel is honest about what it does not know: while the initial read is
 * in flight the status says "loading" rather than "not connected", and a read
 * that fails says so instead of showing an empty state that would look like
 * "no domain configured".
 */
export default function DomainFoundation({
  siteId,
  hostname = '',
  remote = null,
  isLoading = false,
  loadFailed = false,
  onDomainChange,
  onRetry,
}) {
  const { t } = useTranslation()
  const [busy, setBusy] = useState(null)
  const [notice, setNotice] = useState(null)
  const domain = normalizeDomainStatus(remote)

  const typed = hostname.trim().toLowerCase()
  const isTypedValid = isValidDomainShape(typed)
  const isStored = domain.status !== 'unconfigured' && Boolean(domain.hostname)
  const isAlreadyStored = isStored && domain.hostname === typed
  const isReady = siteDomainService.isBackendConnected() && Boolean(siteId)
  const isIdle = busy === null && !isLoading && !loadFailed

  /*
   * Disabled state, decided from facts the button needs rather than from the
   * presence of a click handler:
   *
   * - "Add" needs a backend, a site, an idle panel and a hostname that passes
   *   the same shape check the field shows; it is redundant once the typed
   *   value is the one the server already holds.
   * - "Verify" and "Remove" need a domain on the server — verifying a domain
   *   that was never attached only earns a `404` from the backend.
   * - Everything waits out the initial read: adding before it returns could
   *   duplicate a domain the panel has not shown yet.
   */
  const canAdd = isReady && isIdle && isTypedValid && !isAlreadyStored
  const canVerify = isReady && isIdle && isStored
  const canRemove = isReady && isIdle && isStored

  /** The backend's own explanation, or a local one when there is no backend. */
  const describeFailure = (error) => {
    if (error instanceof BackendNotConnectedError) {
      return t('publishing.domainUnavailable')
    }
    const codes = error?.data?.errors?.code
    if (Array.isArray(codes) && codes.includes('CUSTOM_DOMAIN_NOT_ALLOWED')) {
      return t('publishing.domainPlanLocked')
    }
    return getRequestErrorMessage(error)
  }

  /*
   * One action, one place: the request runs, the server's state is read back
   * (so the panel shows what it holds rather than whatever one response
   * happened to carry), and the outcome lands in the live region. A failed
   * re-read keeps the action's own answer instead of blanking the panel.
   */
  const run = async (action, request, describe) => {
    setBusy(action)
    setNotice(null)
    try {
      const result = await request()
      const refreshed = await siteDomainService
        .getSiteDomain(siteId)
        .catch(() => null)
      const updated = refreshed ?? result
      if (updated) {
        onDomainChange?.(updated)
      }
      setNotice({ kind: 'success', message: describe(updated ?? result) })
    } catch (error) {
      setNotice({ kind: 'error', message: describeFailure(error) })
    } finally {
      setBusy(null)
    }
  }

  const handleAdd = () =>
    run(
      'add',
      () => siteDomainService.setSiteDomain(siteId, typed),
      () => t('publishing.domainAdded'),
    )

  const handleVerify = () =>
    run(
      'verify',
      () => siteDomainService.verifySiteDomain(siteId),
      (updated) => {
        if (updated?.status === 'connected') {
          return t(updated.ssl === 'active' ? 'publishing.domainConnected' : 'publishing.domainVerifiedSslPending')
        }
        if (updated?.status === 'error') {
          return t('publishing.domainVerifyFailed')
        }
        return t('publishing.domainVerifyPending')
      },
    )

  const handleRemove = () =>
    run(
      'remove',
      () => siteDomainService.removeSiteDomain(siteId),
      () => t('publishing.domainRemoved'),
    )

  /*
   * The action's own notice wins; a failed read falls back to saying that, and
   * with neither the panel states the next step rather than a stale promise of
   * an integration that does not exist.
   */
  const shownNotice =
    notice ??
    (loadFailed
      ? { kind: 'error', message: t('publishing.domainLoadFailed') }
      : null)

  /** Which of the four steps the server's state has actually reached. */
  const stepDone = {
    addDomain: isStored,
    dns: domain.records.length > 0,
    verify: isStored && domain.status === 'connected',
    connected: isStored && domain.status === 'connected',
  }

  return (
    <div className="domain-foundation">
      <h4>{t('publishing.customDomain')}</h4>
      <ol className="domain-steps">
        {['addDomain', 'dns', 'verify', 'connected'].map((key) => (
          <li key={key} data-done={stepDone[key] ? 'true' : undefined}>
            {t(`publishing.${key}`)}
          </li>
        ))}
      </ol>

      <p id="domain-status">
        {t('publishing.domain')}:{' '}
        <strong>
          {isLoading
            ? t('common.loading')
            : loadFailed ? t('publishing.unknown') : t(`publishing.domainStates.${domain.status}`)}
        </strong>
        {domain.hostname ? <> · {domain.hostname}</> : null}
      </p>
      <p>
        SSL: <strong>{isLoading || loadFailed ? t('publishing.unknown') : t(`publishing.sslStates.${domain.ssl}`)}</strong>
      </p>
      {domain.status === 'connected' && domain.ssl !== 'active' ? (
        <p className="settings-note">{t('publishing.domainVerifiedSslPending')}</p>
      ) : null}
      {domain.lastCheckedAt ? (
        <p className="domain-foundation__meta">
          {t('publishing.lastChecked')}:{' '}
          {new Date(domain.lastCheckedAt).toLocaleString()}
        </p>
      ) : null}
      {domain.error ? (
        <p className="domain-foundation__error" role="status">
          {domain.error}
        </p>
      ) : null}
      <DnsRecords records={domain.records} />

      <p
        id="domain-integration-note"
        className={`domain-foundation__notice domain-foundation__notice--${shownNotice?.kind ?? 'idle'}`}
        role="status"
        aria-live="polite"
      >
        {shownNotice?.message ?? t('publishing.domainHint')}
      </p>

      <div className="publish-actions">
        {loadFailed ? (
          <button className="btn btn--outline" type="button" onClick={onRetry} disabled={isLoading}>
            {t('common.retry')}
          </button>
        ) : null}
        <button
          className="btn btn--primary"
          type="button"
          disabled={!canAdd}
          onClick={handleAdd}
          aria-describedby="domain-integration-note"
        >
          {busy === 'add' ? t('publishing.domainAdding') : t('publishing.addDomain')}
        </button>
        <button
          className="btn btn--outline"
          type="button"
          disabled={!canVerify}
          onClick={handleVerify}
          aria-describedby="domain-integration-note"
        >
          {busy === 'verify' ? t('publishing.domainChecking') : t('publishing.verify')}
        </button>
        {isStored ? (
          <button
            className="btn btn--outline"
            type="button"
            disabled={!canRemove}
            onClick={handleRemove}
            aria-describedby="domain-integration-note"
          >
            {busy === 'remove'
              ? t('publishing.domainRemoving')
              : t('publishing.removeDomain')}
          </button>
        ) : null}
      </div>
    </div>
  )
}
