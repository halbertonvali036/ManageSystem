import { ShieldCheck } from 'lucide-react'
import SettingsCard from '@/components/sitesettings/SettingsCard'
import SettingsField from '@/components/sitesettings/SettingsField'
import { SITE_VISIBILITIES } from '@/models/siteSettings'
import useTranslation from '@/hooks/useTranslation'

/**
 * Site visibility, with the explicit note that nothing enforces it yet.
 */
export default function PrivacySettingsSection({ settings, patchSection }) {
  const { t } = useTranslation()

  return (
    <SettingsCard
      id="settings-privacy"
      title={t('siteSettings.privacy.title')}
      description={t('siteSettings.privacy.description')}
      icon={ShieldCheck}
    >
      <div className="settings-grid">
        <SettingsField id="settings-visibility" label={t('siteSettings.privacy.visibility')}>
          <select
            id="settings-visibility"
            className="editor-input"
            value={settings.general.visibility}
            onChange={(event) =>
              patchSection('general', { visibility: event.target.value })
            }
          >
            {SITE_VISIBILITIES.map(({ id, labelKey }) => (
              <option key={id} value={id}>
                {t(labelKey)}
              </option>
            ))}
          </select>
        </SettingsField>

        <p className="settings-note settings-note--muted">
          {t('siteSettings.privacy.notEnforcedNote')}
        </p>
      </div>
    </SettingsCard>
  )
}
