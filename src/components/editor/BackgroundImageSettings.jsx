import { Image as ImageIcon } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import {
  BACKGROUND_POSITION_OPTIONS,
  OVERLAY_BOUNDS,
  getMediaPreviewUrl,
} from '@/models/siteMedia'

/**
 * Background image settings for a section.
 *
 * The overlay is only offered once there is an image, and the whole group is
 * optional: a section with no background image carries no background keys, so
 * there is nothing to misread as "set but blank".
 */
export default function BackgroundImageSettings({ section, onUpdate, onOpenMedia }) {
  const { t } = useTranslation()
  const background = section.backgroundImage
  const isLocalPreview = background?.media?.isLocalPreview === true

  if (!background) {
    return (
      <div className="editor-field">
        <span className="editor-field__label">{t('editor.background.image')}</span>
        <button type="button" className="btn btn--outline btn--sm" onClick={() => onOpenMedia()}>
          <ImageIcon size={16} aria-hidden="true" />
          {t('editor.background.choose')}
        </button>
        <p className="editor-field__hint">{t('editor.background.none')}</p>
      </div>
    )
  }

  const setField = (patch) => onUpdate({ backgroundImage: { ...background, ...patch } })

  return (
    <>
      <div className="editor-field">
        <span className="editor-field__label">{t('editor.background.image')}</span>
        <div className="editor-image-source">
          <span className="editor-image-source__thumb">
            <img src={getMediaPreviewUrl(background.media)} alt="" aria-hidden="true" />
          </span>
          <span className="editor-image-source__copy">
            <span className="editor-image-source__name">
              {background.media.fileName ?? t('editor.image.fromUrl')}
            </span>
            {isLocalPreview ? (
              <span className="editor-media-badge">
                {t('editor.image.localPreviewBadge')}
              </span>
            ) : null}
          </span>
          <button type="button" className="btn btn--outline btn--sm" onClick={() => onOpenMedia()}>
            {t('editor.image.choose')}
          </button>
          <button
            type="button"
            className="btn btn--danger btn--sm"
            onClick={() => onUpdate({ backgroundImage: null })}
          >
            {t('editor.image.remove')}
          </button>
        </div>
      </div>

      <div className="editor-field">
        <label className="editor-field__label" htmlFor="editor-background-fit">
          {t('editor.image.fit')}
        </label>
        <select
          id="editor-background-fit"
          className="editor-select"
          value={background.fit}
          onChange={(event) => setField({ fit: event.target.value })}
        >
          {IMAGE_FITS.map((fit) => (
            <option key={fit.value} value={fit.value}>
              {t(fit.labelKey)}
            </option>
          ))}
        </select>
      </div>

      <div className="editor-field">
        <label className="editor-field__label" htmlFor="editor-background-position">
          {t('editor.background.position')}
        </label>
        <select
          id="editor-background-position"
          className="editor-select"
          value={background.position}
          onChange={(event) => setField({ position: event.target.value })}
        >
          {BACKGROUND_POSITION_OPTIONS.map((position) => (
            <option key={position.value} value={position.value}>
              {t(position.labelKey)}
            </option>
          ))}
        </select>
      </div>

      <div className="editor-field">
        <label className="editor-field__label" htmlFor="editor-background-overlay">
          {t('editor.background.overlay')}
        </label>
        <input
          id="editor-background-overlay"
          className="editor-input"
          value={background.overlayColor}
          onChange={(event) => setField({ overlayColor: event.target.value })}
        />
        <p className="editor-field__hint">{t('editor.background.overlayHint')}</p>
      </div>

      <div className="editor-field">
        <div className="editor-number">
          <label className="editor-visually-hidden" htmlFor="editor-background-opacity">
            {t('editor.background.opacity')}
          </label>
          <input
            id="editor-background-opacity"
            type="range"
            className="editor-range"
            min={OVERLAY_BOUNDS.min}
            max={OVERLAY_BOUNDS.max}
            step={OVERLAY_BOUNDS.step}
            value={background.overlayOpacity}
            onChange={(event) => setField({ overlayOpacity: Number(event.target.value) })}
          />
          <output className="editor-number__value" htmlFor="editor-background-opacity">
            {background.overlayOpacity}%
          </output>
        </div>
        <p className="editor-field__hint">{t('editor.background.opacityHint')}</p>
      </div>
    </>
  )
}
