import useTranslation from '@/hooks/useTranslation'
import { getMediaPreviewUrl } from '@/models/siteMedia'
import { getEffectiveSiteTitle, getSearchPreview } from '@/models/siteSettings'

/**
 * What the site would look like in a browser tab.
 *
 * This is a picture of a result, not a result. It renders a title and a favicon at
 * the size a tab actually shows them, which is the part a user cannot judge from a
 * square thumbnail: a logo that looks fine at 200px is often unreadable at 16px,
 * and a long site name is truncated.
 *
 * The address bar shows the entered path with a placeholder host, because a
 * half-entered domain in a mock address bar would read as a working address. The
 * caption repeats the point in words for anyone who cannot see that the bar is a
 * drawing.
 */
function FaviconPreview({ settings }) {
  const { t } = useTranslation()
  const faviconUrl = getMediaPreviewUrl(settings?.identity?.favicon)
  const title = getEffectiveSiteTitle(settings)
  const preview = getSearchPreview(settings)

  return (
    <div className="settings-favicon">
      <p className="settings-favicon__label">{t('siteSettings.favicon.previewLabel')}</p>

      <div className="settings-favicon__window">
        <div className="settings-favicon__tab">
          {faviconUrl ? (
            <span className="settings-favicon__icon">
              <img src={faviconUrl} alt="" aria-hidden="true" />
            </span>
          ) : (
            <span className="settings-favicon__icon settings-favicon__icon--empty" aria-hidden="true" />
          )}
          <span className="settings-favicon__title">
            {title || t('siteSettings.favicon.emptyTitle')}
          </span>
        </div>
        <div className="settings-favicon__address">
          <span className="settings-favicon__host">{t('siteSettings.favicon.placeholderHost')}</span>
          <span className="settings-favicon__path">{preview.path}</span>
        </div>
      </div>

      <p className="settings-favicon__note">{t('siteSettings.favicon.previewNote')}</p>
    </div>
  )
}

export default FaviconPreview
