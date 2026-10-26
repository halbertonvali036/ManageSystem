import { Palette, Sparkles } from 'lucide-react'
import SettingsCard from '@/components/sitesettings/SettingsCard'
import SettingsColorField from '@/components/sitesettings/SettingsColorField'
import SettingsField from '@/components/sitesettings/SettingsField'
import { SITE_FONTS } from '@/models/siteSettings'
import useTranslation from '@/hooks/useTranslation'

/**
 * Site branding that is independent of the site theme.
 *
 * The brand colour and font are defaults offered to the site; the editor theme
 * can still override them, which is what the note at the bottom says.
 */
export default function BrandingSettingsSection({ settings, patchSection }) {
  const { t } = useTranslation()

  return (
    <SettingsCard
      id="settings-branding"
      title={t('siteSettings.branding.title')}
      description={t('siteSettings.branding.description')}
      icon={Palette}
    >
      <div className="settings-grid">
        <SettingsColorField
          id="settings-brand-color"
          label={t('siteSettings.branding.primaryColor')}
          hint={t('siteSettings.branding.primaryColorHint')}
          value={settings.branding.primaryColor}
          onChange={(value) => patchSection('branding', { primaryColor: value })}
          onClear={() => patchSection('branding', { primaryColor: '' })}
        />

        <SettingsField
          id="settings-brand-font"
          label={t('siteSettings.branding.font')}
          hint={t('siteSettings.branding.fontHint')}
        >
          <select
            id="settings-brand-font"
            className="editor-input"
            value={settings.branding.fontId}
            onChange={(event) =>
              patchSection('branding', { fontId: event.target.value })
            }
          >
            {SITE_FONTS.map(({ id, labelKey }) => (
              <option key={id} value={id}>
                {t(labelKey)}
              </option>
            ))}
          </select>
        </SettingsField>

        <p className="settings-note">
          <Sparkles size={14} aria-hidden="true" />
          {t('siteSettings.branding.independentNote')}
        </p>
      </div>
    </SettingsCard>
  )
}
