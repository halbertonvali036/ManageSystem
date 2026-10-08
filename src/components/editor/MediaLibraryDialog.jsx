import { Image as ImageIcon, Link2, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import useTranslation from '@/hooks/useTranslation'
import { MEDIA_FILE_ACCEPT, safeMediaUrl } from '@/models/siteMedia'

/**
 * The dialog body, mounted only while the dialog is open.
 *
 * This is a separate component so that a typed address cannot survive a close and
 * a reopen. A `useState` reset inside an effect would do the same job, but it
 * costs an extra render and a moment where the old value is still on screen; here
 * the state simply starts empty every time the body mounts.
 */
function MediaDialogBody({ onClose, onPickLocalFile, onPickUrl }) {
  const { t } = useTranslation()
  const closeRef = useRef(null)
  const dialogRef = useRef(null)
  const fileRef = useRef(null)
  const [url, setUrl] = useState('')

  // Move focus into the dialog on open so a keyboard user is not left behind on
  // the control that opened it.
  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      // Keep Tab inside the dialog while it is open.
      if (event.key !== 'Tab' || !dialogRef.current) {
        return
      }
      const focusable = [...dialogRef.current.querySelectorAll(
        'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
      )].filter(element => element.getClientRects().length > 0)
      if (focusable.length === 0) {
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const trimmedUrl = url.trim()
  const isUrlUsable = safeMediaUrl(trimmedUrl) !== null

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    // Clear the input so choosing the same file twice in a row still fires a
    // change event; otherwise the second pick would be silently ignored.
    event.target.value = ''
    if (file) {
      onPickLocalFile(file)
    }
  }

  const handleSubmitUrl = (event) => {
    event.preventDefault()
    if (!isUrlUsable) {
      return
    }
    onPickUrl(trimmedUrl)
    setUrl('')
  }

  return (
    <>
      {/*
        A real dismiss layer. The button is only there to catch clicks on the
        backdrop, so it carries the close label and no content.
      */}
      <button
        type="button"
        className="editor-dialog__backdrop"
        onClick={onClose}
        aria-label={t('common.close')}
      />

      <div
        className="editor-dialog editor-dialog--media"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-media-dialog-title"
        ref={dialogRef}
      >
        <div className="editor-dialog__head">
          <div>
            <h2 className="editor-dialog__title" id="editor-media-dialog-title">
              {t('editor.media.title')}
            </h2>
            <p className="editor-dialog__hint">{t('editor.media.hint')}</p>
          </div>
          <button
            type="button"
            className="editor-icon-button"
            onClick={onClose}
            ref={closeRef}
            aria-label={t('editor.media.close')}
          >
            {t('common.close')}
          </button>
        </div>

        {/*
          The empty state is the whole library, not a loading placeholder. There
          is no media service to load from, so the first thing a user sees is
          accurate: nothing has been added yet.
        */}
        <div className="editor-media__empty">
          <span className="editor-media__empty-icon" aria-hidden="true">
            <ImageIcon size={22} />
          </span>
          <p className="editor-media__empty-title">{t('editor.media.emptyTitle')}</p>
          <p className="editor-media__empty-text">{t('editor.media.emptyText')}</p>
        </div>

        <div className="editor-media__sources">
          <div className="editor-media__source">
            <p className="editor-media__source-label">{t('editor.media.fromDevice')}</p>
            <p className="editor-media__source-hint">{t('editor.media.localPreviewNote')}</p>
            {/*
              The input itself is hidden rather than removed: a visually hidden
              file input is still focusable and still reachable by a keyboard or a
              screen reader, which a `display: none` input would not be.
            */}
            <input
              ref={fileRef}
              type="file"
              accept={MEDIA_FILE_ACCEPT}
              className="editor-visually-hidden"
              onChange={handleFileChange}
              aria-label={t('editor.media.chooseFile')}
            />
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={16} aria-hidden="true" />
              {t('editor.media.chooseFile')}
            </button>
          </div>

          <div className="editor-media__source">
            <p className="editor-media__source-label">{t('editor.media.fromUrl')}</p>
            <form className="editor-media__url-form" onSubmit={handleSubmitUrl}>
              <label className="editor-media__url-input">
                <span className="editor-field__label">{t('editor.media.urlLabel')}</span>
                <input
                  type="text"
                  className="editor-input"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder={t('editor.media.urlPlaceholder')}
                  aria-invalid={trimmedUrl.length > 0 && !isUrlUsable ? 'true' : undefined}
                  aria-describedby={
                    trimmedUrl.length > 0 && !isUrlUsable ? 'editor-media-url-error' : undefined
                  }
                />
              </label>
              <button type="submit" className="btn btn--sm" disabled={!isUrlUsable}>
                <Link2 size={16} aria-hidden="true" />
                {t('editor.media.addUrl')}
              </button>
            </form>
            {trimmedUrl.length > 0 && !isUrlUsable ? (
              <p className="editor-media__url-error" id="editor-media-url-error" role="alert">
                {t('editor.media.urlInvalid')}
              </p>
            ) : null}
          </div>
        </div>

        <p className="editor-dialog__note">{t('editor.media.localOnly')}</p>
      </div>
    </>
  )
}

/**
 * The media picker.
 *
 * Two ways in, because they are genuinely different things: a file from this
 * device, and an address the user already has. Neither is an upload — there is no
 * storage behind this yet — so a chosen file is marked as an unsaved local preview
 * everywhere it appears.
 *
 * The library itself is empty by design. There is nothing to fetch and no fake
 * placeholder to click, so the empty state is the honest first screen.
 *
 * The dialog owns no image state of its own: it reports a choice and forgets it.
 * That keeps the Object URL alive for exactly as long as the document still refers
 * to it, which is decided in the editor page rather than here.
 */
function MediaLibraryDialog({ isOpen, onClose, onPickLocalFile, onPickUrl }) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="editor-dialog-layer">
      <MediaDialogBody
        onClose={onClose}
        onPickLocalFile={onPickLocalFile}
        onPickUrl={onPickUrl}
      />
    </div>
  )
}

export default MediaLibraryDialog
