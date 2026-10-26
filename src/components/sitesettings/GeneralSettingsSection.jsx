import { useMemo } from 'react'
import { Globe } from 'lucide-react'
import SettingsCard from '@/components/sitesettings/SettingsCard'
import SettingsField from '@/components/sitesettings/SettingsField'
import {
  BRAND_DESCRIPTION_MAX,
  SITE_LANGUAGES,
  SITE_NAME_MAX,
  SITE_STATUS_VALUES,
  SITE_TIMEZONES,
} from '@/models/siteSettings'
import useTranslation from '@/hooks/useTranslation'

/**
 * General site identity, locale and the read-only publication status.
 *
 * The status select is disabled on purpose: status is owned by the publishing
 * flow, not by this form. It is shown here because "which site am I editing"
 * includes what state it is in.
 */
export default function GeneralSettingsSection({ settings, patchSection }) {
  const { t } = useTranslation()

  const statusOptions = useMemo(
    () =>
      SITE_STATUS_VALUES.map((value) => ({
        value,
        labelKey: `siteStatus.${value}`,
      })),
    [],
  )

  return (
    <SettingsCard
      id="settings-general"
      title={t('siteSettings.general.title')}
      description={t('siteSettings.general.description')}
      icon={Globe}
    >
      <div className="settings-grid">
        <SettingsField
          id="settings-site-name"
          label={t('siteSettings.general.name')}
          hint={t('siteSettings.general.nameHint')}
        >
          <input
            id="settings-site-name"
            type="text"
            className="editor-input"
            value={settings.general.name}
            maxLength={SITE_NAME_MAX}
            onChange={(event) =>
              patchSection('general', { name: event.target.value })
            }
          />
        </SettingsField>

        <SettingsField
          id="settings-site-description"
          label={t('siteSettings.general.descriptionLabel')}
          hint={t('siteSettings.general.descriptionHint')}
        >
          <textarea
            id="settings-site-description"
            className="editor-input editor-textarea"
            rows={3}
            value={settings.general.description}
            maxLength={BRAND_DESCRIPTION_MAX}
            onChange={(event) =>
              patchSection('general', { description: event.target.value })
            }
          />
        </SettingsField>

        <SettingsField id="settings-language" label={t('siteSettings.general.language')}>
          <select
            id="settings-language"
            className="editor-input"
            value={settings.general.language}
            onChange={(event) =>
              patchSection('general', { language: event.target.value })
            }
          >
            {SITE_LANGUAGES.map(({ id, labelKey }) => (
              <option key={id} value={id}>
                {t(labelKey)}
              </option>
            ))}
          </select>
        </SettingsField>

        <SettingsField
          id="settings-timezone"
          label={t('siteSettings.general.timezone')}
          hint={t('siteSettings.general.timezoneHint')}
        >
          <select
            id="settings-timezone"
            className="editor-input"
            value={settings.general.timezone}
            onChange={(event) =>
              patchSection('general', { timezone: event.target.value })
            }
          >
            {SITE_TIMEZONES.map(({ id, labelKey }) => (
              <option key={id || 'none'} value={id}>
                {t(labelKey)}
              </option>
            ))}
          </select>
        </SettingsField>

        <SettingsField
          id="settings-status"
          label={t('siteSettings.general.status')}
          hint={t('publishing.pending')}
        >
          <select
            id="settings-status"
            className="editor-input"
            value={settings.general.status}
            disabled
          >
            {statusOptions.map(({ value, labelKey }) => (
              <option key={value} value={value}>
                {t(labelKey)}
              </option>
            ))}
          </select>
        </SettingsField>
      </div>
    </SettingsCard>
  )
}
