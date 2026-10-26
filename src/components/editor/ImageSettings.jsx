import { Image as ImageIcon } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import { IMAGE_FIT_OPTIONS, getMediaPreviewUrl } from '@/models/siteMedia'

/**
 * Image settings for an image block.
 *
 * The source row shows what is actually going to render, including whether it is
 * an unsaved local preview. That marker is the point: a file chosen from this
 * device looks identical to a real image on the canvas, so the one honest signal
 * that it will disappear when the tab closes is written next to it.
 */
export default function ImageSettings({ block, onUpdate, onOpenMedia, showLink = true }) {
  const { t } = useTranslation()
  const { alt, src, media, href } = block.content
  const previewUrl = getMediaPreviewUrl(media)
  const displayUrl = previewUrl ?? src
  const isLocalPreview = media?.isLocalPreview === true

  const setField = (patch) => onUpdate({ content: { ...patch } })

  return (
    <>
      <div className="editor-field">
        <span className="editor-field__label">{t('editor.image.source')}</span>
        {displayUrl ? (
          <div className="editor-image-source">
            <span className="editor-image-source__thumb">
              <img
                src={displayUrl}
                alt=""
                aria-hidden="true"
                /* The thumbnail is decorative here: the address and the alt field
                   below are what the user needs to read. */
              />
            </span>
            <span className="editor-image-source__copy">
              <span className="editor-image-source__name">
                {media?.fileName ?? t('editor.image.fromUrl')}
              </span>
              {isLocalPreview ? (
                <span className="editor-media-badge">
                  {t('editor.image.localPreviewBadge')}
                </span>
              ) : null}
            </span>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => onOpenMedia()}
            >
              {t('editor.image.choose')}
            </button>
            <button
              type="button"
              className="btn btn--danger btn--sm"
              onClick={() => setField({ media: null, src: '' })}
            >
              {t('editor.image.remove')}
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn--outline btn--sm" onClick={() => onOpenMedia()}>
            <ImageIcon size={16} aria-hidden="true" />
            {t('editor.image.choose')}
          </button>
        )}
        {isLocalPreview ? (
          <p className="editor-field__hint">{t('editor.image.localPreviewHint')}</p>
        ) : null}
      </div>

      <div className="editor-field">
        <label className="editor-field__label" htmlFor="editor-content-alt">
          {t('editor.image.alt')}
        </label>
        <input
          id="editor-content-alt"
          className="editor-input"
          value={alt}
          onChange={(event) => setField({ alt: event.target.value })}
        />
        <p className="editor-field__hint">{t('editor.image.altHint')}</p>
      </div>

      <div className="editor-field">
        <label className="editor-field__label" htmlFor="editor-image-fit">
          {t('editor.image.fit')}
        </label>
        <select
          id="editor-image-fit"
          className="editor-select"
          value={block.content.fit}
          onChange={(event) => setField({ fit: event.target.value })}
        >
          {IMAGE_FIT_OPTIONS.map((fit) => (
            <option key={fit.value} value={fit.value}>
              {t(fit.labelKey)}
            </option>
          ))}
        </select>
      </div>

      {showLink ? (
        <div className="editor-field">
          <label className="editor-field__label" htmlFor="editor-image-href">
            {t('editor.image.link')}
          </label>
          <input
            id="editor-image-href"
            className="editor-input"
            type="text"
            placeholder="https://"
            value={href}
            onChange={(event) => setField({ href: event.target.value })}
          />
          <p className="editor-field__hint">{t('editor.image.linkHint')}</p>
        </div>
      ) : null}
    </>
  )
}
