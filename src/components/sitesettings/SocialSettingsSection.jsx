import { Share2 } from 'lucide-react'
import SettingsCard from '@/components/sitesettings/SettingsCard'
import SettingsMediaField from '@/components/sitesettings/SettingsMediaField'
import SocialPreviewCard from '@/components/sitesettings/SocialPreviewCard'
import useTranslation from '@/hooks/useTranslation'

/**
 * The social share image and a live share-card preview built from the current
 * values.
 */
export default function SocialSettingsSection({
  settings,
  setMedia,
  setMediaField,
}) {
  const { t } = useTranslation()

  return (
    <SettingsCard
      id="settings-social"
      title={t('siteSettings.social.title')}
      description={t('siteSettings.social.description')}
      icon={Share2}
    >
      <div className="settings-grid">
        <SettingsMediaField
          id="settings-social-image"
          variant="image"
          label={t('siteSettings.social.image')}
          hint={t('siteSettings.social.imageHint')}
          media={settings.seo.socialImage}
          onPick={() => setMediaField('socialImage')}
          onClear={() => setMedia('socialImage', null)}
        />

        <SocialPreviewCard settings={settings} />
      </div>
    </SettingsCard>
  )
}
