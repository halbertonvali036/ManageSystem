import { Globe } from 'lucide-react'
import { useEffect, useState } from 'react'
import DomainFoundation from '@/components/sitesettings/DomainFoundation'
import SettingsCard from '@/components/sitesettings/SettingsCard'
import SettingsField from '@/components/sitesettings/SettingsField'
import { getDomainState } from '@/models/siteSettings'
import siteDomainService from '@/services/siteDomainService'
import useTranslation from '@/hooks/useTranslation'

/**
 * The custom domain field and the platform-domain foundation beneath it.
 *
 * The field's error only appears once something has been entered, so an empty
 * form is not reported as invalid before the user has typed anything.
 *
 * This section owns the read: one `GET /api/sites/{id}/domain` on mount puts
 * the server's answer in `remote`, which is passed down together with the
 * hostname the visitor typed. The foundation performs the writes (add, verify,
 * remove) and reports each result back through `onDomainChange`, so the card
 * has exactly one source of truth — the backend — without the settings form
 * ever claiming a domain is connected because a field was filled in.
 */
export default function DomainSettingsSection({ settings, patchSection, siteId }) {
  const { t } = useTranslation()
  const [remote, setRemote] = useState(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [isLoading, setIsLoading] = useState(
    () => siteDomainService.isBackendConnected() && Boolean(siteId),
  )

  useEffect(() => {
    let isCurrent = true

    if (!siteDomainService.isBackendConnected() || !siteId) {
      // `isLoading` starts from these same two facts, so there is nothing to
      // correct here — the panel is already in its settled empty state.
      return undefined
    }

    siteDomainService
      .getSiteDomain(siteId)
      .then((status) => {
        if (isCurrent) {
          setRemote(status)
        }
      })
      .catch(() => {
        // Not routed or unreachable: the panel must say the read failed rather
        // than render an empty state that reads as "no domain configured".
        if (isCurrent) {
          setLoadFailed(true)
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [siteId])

  const domainState = getDomainState(settings)

  return (
    <SettingsCard
      id="settings-domain"
      title={t('siteSettings.domain.title')}
      description={t('siteSettings.domain.description')}
      icon={Globe}
    >
      <div className="settings-grid">
        <SettingsField
          id="settings-domain-hostname"
          label={t('siteSettings.domain.hostname')}
          hint={t('siteSettings.domain.hostnameHint')}
          error={
            domainState.isConfigured && !domainState.isValid
              ? t('siteSettings.domain.invalid')
              : null
          }
        >
          <input
            id="settings-domain-hostname"
            type="text"
            className="editor-input"
            placeholder="example.com"
            value={settings.domain.hostname}
            onChange={(event) =>
              patchSection('domain', { hostname: event.target.value })
            }
          />
        </SettingsField>

        <p className="settings-note settings-note--muted">
          {t('siteSettings.domain.notConnectedNote')}
        </p>
      </div>
      <DomainFoundation
        siteId={siteId}
        hostname={settings.domain.hostname}
        remote={remote}
        isLoading={isLoading}
        loadFailed={loadFailed}
        onDomainChange={setRemote}
      />
    </SettingsCard>
  )
}
