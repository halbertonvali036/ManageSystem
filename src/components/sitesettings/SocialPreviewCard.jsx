import useTranslation from '@/hooks/useTranslation'
import { getMediaPreviewUrl } from '@/models/siteMedia'
import { getSearchPreview } from '@/models/siteSettings'

/**
 * A share card built from the values currently in the form.
 *
 * Three things this is careful about:
 *
 * It reads the live form values, so it updates as the user types. A preview that
 * only appeared after saving would be useless in a page whose whole point is
 * editing.
 *
 * It draws a browser-style share card, not a platform mock-up. Google and Facebook
 * each lay these out differently, and imitating either one here would promise a
 * result this code cannot deliver. The caption says what it is instead.
 *
 * A missing title or description shows a muted placeholder rather than an empty
 * box, so "you have not written one yet" is visible without looking broken.
 */
function SocialPreviewCard({ settings }) {
  const { t } = useTranslation()
  const preview = getSearchPreview(settings)

  const title = preview.title || t('siteSettings.social.emptyTitle')
  const description = preview.description || t('siteSettings.social.emptyDescription')
  const hasTitle = Boolean(preview.title)
  const hasDescription = Boolean(preview.description)
  const socialImageUrl = getMediaPreviewUrl(settings?.seo?.socialImage)

  return (
    <div className="settings-social">
      <p className="settings-social__label">{t('siteSettings.social.previewLabel')}</p>

      <div className="settings-social__card">
        {socialImageUrl ? (
          <span className="settings-social__image">
            <img src={socialImageUrl} alt="" aria-hidden="true" />
          </span>
        ) : (
          <span className="settings-social__image settings-social__image--empty">
            {t('siteSettings.social.noImage')}
          </span>
        )}

        <span className="settings-social__body">
          <span className="settings-social__title">{title}</span>
          <span
            className={`settings-social__description${hasDescription ? '' : ' is-placeholder'}`}
          >
            {description}
          </span>
          <span className="settings-social__path">{preview.path}</span>
        </span>
      </div>

      <p className="settings-social__note">{t('siteSettings.social.approximationNote')}</p>

      {!preview.isIndexable ? (
        <p className="settings-social__warning" role="status">
          {t('siteSettings.social.indexingOffNote')}
        </p>
      ) : null}

      {!hasTitle || !hasDescription ? (
        <p className="settings-social__note" role="status">
          {t('siteSettings.social.incompleteNote')}
          {!hasTitle ? ` ${t('siteSettings.social.missingTitle')}` : ''}
          {!hasDescription ? ` ${t('siteSettings.social.missingDescription')}` : ''}
        </p>
      ) : null}
    </div>
  )
}

export default SocialPreviewCard
