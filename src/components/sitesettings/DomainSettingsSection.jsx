import { Globe } from 'lucide-react'
import DomainFoundation from '@/components/sitesettings/DomainFoundation'
import SettingsCard from '@/components/sitesettings/SettingsCard'
import SettingsField from '@/components/sitesettings/SettingsField'
import { getDomainState } from '@/models/siteSettings'
import useTranslation from '@/hooks/useTranslation'

/**
 * The custom domain field and the platform-domain foundation beneath it.
 *
 * The field's error only appears once something has been entered, so an empty
 * form is not reported as invalid before the user has typed anything.
 */
export default function DomainSettingsSection({ settings, patchSection }) {
  const { t } = useTranslation()

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
      <DomainFoundation />
    </SettingsCard>
  )
}
