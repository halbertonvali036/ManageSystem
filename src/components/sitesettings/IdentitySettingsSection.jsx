import { Image as ImageIcon } from 'lucide-react'
import FaviconPreview from '@/components/sitesettings/FaviconPreview'
import SettingsCard from '@/components/sitesettings/SettingsCard'
import SettingsField from '@/components/sitesettings/SettingsField'
import SettingsMediaField from '@/components/sitesettings/SettingsMediaField'
import {
  BRAND_DESCRIPTION_MAX,
  BRAND_NAME_MAX,
} from '@/models/siteSettings'
import useTranslation from '@/hooks/useTranslation'

/**
 * Brand identity: the name and description used across the site, the logo and
 * favicon images, and a browser-tab preview of the result.
 */
export default function IdentitySettingsSection({
  settings,
  patchSection,
  setMedia,
  setMediaField,
}) {
  const { t } = useTranslation()

  return (
    <SettingsCard
      id="settings-identity"
      title={t('siteSettings.identity.title')}
      description={t('siteSettings.identity.description')}
      icon={ImageIcon}
    >
      <div className="settings-grid">
        <SettingsField
          id="settings-brand-name"
          label={t('siteSettings.identity.brandName')}
          hint={t('siteSettings.identity.brandNameHint')}
        >
          <input
            id="settings-brand-name"
            type="text"
            className="editor-input"
            value={settings.identity.brandName}
            maxLength={BRAND_NAME_MAX}
            onChange={(event) =>
              patchSection('identity', { brandName: event.target.value })
            }
          />
        </SettingsField>

        <SettingsField
          id="settings-brand-description"
          label={t('siteSettings.identity.brandDescription')}
          hint={t('siteSettings.identity.brandDescriptionHint')}
        >
          <textarea
            id="settings-brand-description"
            className="editor-input editor-textarea"
            rows={2}
            value={settings.identity.brandDescription}
            maxLength={BRAND_DESCRIPTION_MAX}
            onChange={(event) =>
              patchSection('identity', { brandDescription: event.target.value })
            }
          />
        </SettingsField>

        <SettingsMediaField
          id="settings-logo"
          variant="logo"
          label={t('siteSettings.identity.logo')}
          hint={t('siteSettings.identity.logoHint')}
          media={settings.identity.logo}
          onPick={() => setMediaField('logo')}
          onClear={() => setMedia('logo', null)}
        />

        <SettingsMediaField
          id="settings-favicon"
          variant="favicon"
          label={t('siteSettings.identity.favicon')}
          hint={t('siteSettings.identity.faviconHint')}
          media={settings.identity.favicon}
          onPick={() => setMediaField('favicon')}
          onClear={() => setMedia('favicon', null)}
        />

        <FaviconPreview settings={settings} />
      </div>
    </SettingsCard>
  )
}
