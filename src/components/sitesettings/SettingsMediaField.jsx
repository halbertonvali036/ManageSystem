import { Image as ImageIcon, Trash2, Upload } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import { getMediaPreviewUrl } from '@/models/siteMedia'
import SettingsField from '@/components/sitesettings/SettingsField'

/**
 * Chooses a logo, favicon or social image from the shared media library.
 *
 * `variant` changes the shape of the preview, because the three are not the same
 * size and showing them all in one square would misrepresent what the user picked:
 * a logo is wide, a favicon is tiny and square, a social image is a wide card.
 *
 * The "local preview" badge is the important part. A file chosen from this device
 * produces a `blob:` url that looks identical to a real image and works perfectly
 * right up until the tab closes. Nothing in this codebase uploads it. The badge
 * states that in the same row as the file name, so the difference between "chosen"
 * and "stored" is visible at the moment of choosing.
 */
const VARIANT_SHAPES = {
  logo: { className: 'settings-media__thumb--wide', hintKey: null },
  favicon: { className: 'settings-media__thumb--square', hintKey: null },
  image: { className: 'settings-media__thumb--card', hintKey: null },
}

function SettingsMediaField({ id, label, hint, media, onPick, onClear, variant = 'image' }) {
  const { t } = useTranslation()
  const previewUrl = getMediaPreviewUrl(media)
  const isLocalPreview = media?.isLocalPreview === true
  const shape = VARIANT_SHAPES[variant] ?? VARIANT_SHAPES.image

  return (
    <SettingsField id={id} label={label} hint={hint} className="settings-field--media">
      {previewUrl ? (
        <div className="settings-media">
          <span className={`settings-media__thumb ${shape.className}`}>
            <img
              src={previewUrl}
              alt=""
              aria-hidden="true"
              /* Decorative: the file name and the alt guidance below carry the
                 information. The image is the thing being described by the label
                 this whole field is already labelled with. */
            />
          </span>
          <span className="settings-media__copy">
            <span className="settings-media__name">{media.fileName || t('siteSettings.media.fromUrl')}</span>
            {isLocalPreview ? (
              <span className="editor-media-badge">{t('siteSettings.media.localPreviewBadge')}</span>
            ) : null}
          </span>
          <div className="settings-media__actions">
            <button type="button" className="btn btn--outline btn--sm" onClick={onPick}>
              {t('siteSettings.media.replace')}
            </button>
            <button
              type="button"
              className="btn btn--danger btn--sm"
              onClick={onClear}
              aria-label={t('siteSettings.media.removeNamed', { name: label })}
            >
              <Trash2 size={14} aria-hidden="true" />
              {t('siteSettings.media.remove')}
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn btn--outline btn--sm" onClick={onPick}>
          <Upload size={15} aria-hidden="true" />
          {t('siteSettings.media.choose')}
        </button>
      )}

      {isLocalPreview ? (
        <p className="settings-media__note">
          <ImageIcon size={14} aria-hidden="true" />
          {t('siteSettings.media.localPreviewHint')}
        </p>
      ) : null}
    </SettingsField>
  )
}

export default SettingsMediaField
