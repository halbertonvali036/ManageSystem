import { useEffect, useMemo, useRef, useState } from 'react'
import useTranslation from '@/hooks/useTranslation'
import { isValidSlug, slugifyPageName } from '@/models/siteNavigation'

/**
 * The `Yeni səhifə` dialog.
 *
 * Two fields, and the second one is optional by design. A name is what the user
 * recognises in the page list; a slug is what ends up in an address, and plenty of
 * pages are never linked by address at all. Requiring both would make the common
 * case slower to reach the common answer.
 *
 * The slug is suggested from the name until the user types their own. That switch
 * is local state on purpose: the moment the user edits the field, their choice is
 * the one that counts and the name stops overwriting it. Storing "the user has
 * taken over this field" in the document would mean saving a UI decision as if it
 * were site content.
 *
 * A duplicate slug is a warning, not a block. Only the backend knows which slugs
 * exist across every other draft and the published site, so refusing here would
 * be this dialog guessing at a rule it cannot see.
 *
 * The parent mounts this only while it is open, so a reopened dialog starts empty
 * from `useState` rather than needing an effect to clear itself.
 */
function PageCreateDialog({ pages, onClose, onCreate }) {
  const { t } = useTranslation()
  const nameRef = useRef(null)
  const dialogRef = useRef(null)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [isSlugEdited, setIsSlugEdited] = useState(false)

  // Moving focus into the dialog is synchronising with the browser, which is what
  // an effect is for.
  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) {
        return
      }
      const focusable = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
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

  const suggestion = useMemo(() => slugifyPageName(name), [name])
  const shownSlug = isSlugEdited ? slug : suggestion

  const trimmedName = name.trim()
  const isNameValid = trimmedName.length > 0
  const isSlugValid = shownSlug === '' || isValidSlug(shownSlug)
  const isTaken = useMemo(() => {
    const candidate = shownSlug.toLowerCase()
    return candidate !== '' && pages.some((page) => page.slug?.toLowerCase() === candidate)
  }, [pages, shownSlug])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!isNameValid || !isSlugValid) {
      return
    }
    onCreate({ name: trimmedName, slug: shownSlug })
    onClose()
  }

  return (
    <div className="editor-dialog-layer">
      <button
        type="button"
        className="editor-dialog__backdrop"
        onClick={onClose}
        aria-label={t('common.close')}
      />

      <div
        className="editor-dialog editor-dialog--form"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-page-dialog-title"
        ref={dialogRef}
      >
        <form onSubmit={handleSubmit}>
          <div className="editor-dialog__head">
            <div>
              <h2 className="editor-dialog__title" id="editor-page-dialog-title">
                {t('editor.page.dialogTitle')}
              </h2>
              <p className="editor-dialog__hint">{t('editor.page.dialogHint')}</p>
            </div>
            <button
              type="button"
              className="editor-icon-button"
              onClick={onClose}
              aria-label={t('common.close')}
            >
              {t('common.close')}
            </button>
          </div>

          <div className="editor-dialog__fields">
            <div className="editor-field">
              <label className="editor-field__label" htmlFor="editor-page-dialog-name">
                {t('editor.page.nameLabel')}
              </label>
              <input
                id="editor-page-dialog-name"
                ref={nameRef}
                className="editor-input"
                value={name}
                maxLength={80}
                aria-describedby="editor-page-dialog-name-hint"
                aria-invalid={name.length > 0 && !isNameValid ? 'true' : undefined}
                onChange={(event) => setName(event.target.value)}
              />
              <p className="editor-field__hint" id="editor-page-dialog-name-hint">
                {isNameValid ? t('editor.page.nameOk') : t('editor.page.nameRequired')}
              </p>
            </div>

            <div className="editor-field">
              <label className="editor-field__label" htmlFor="editor-page-dialog-slug">
                {t('editor.page.slugLabel')}
              </label>
              <input
                id="editor-page-dialog-slug"
                className="editor-input editor-input--mono"
                value={shownSlug}
                maxLength={80}
                aria-describedby="editor-page-dialog-slug-hint"
                aria-invalid={isSlugValid ? undefined : 'true'}
                onChange={(event) => {
                  setIsSlugEdited(true)
                  setSlug(event.target.value)
                }}
              />
              <p
                className={`editor-field__hint${isSlugValid ? '' : ' is-error'}${
                  isTaken ? ' is-warning' : ''
                }`}
                id="editor-page-dialog-slug-hint"
              >
                {!isSlugValid
                  ? t('editor.page.slugInvalid')
                  : isTaken
                    ? t('editor.page.slugTaken')
                    : shownSlug === ''
                      ? t('editor.page.slugOptional')
                      : t('editor.page.slugPreview', { path: `/${shownSlug}` })}
              </p>
            </div>
          </div>

          <p className="editor-dialog__note">{t('editor.page.localOnly')}</p>

          <div className="editor-dialog__actions">
            <button type="button" className="btn btn--outline btn--sm" onClick={onClose}>
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="btn btn--accent btn--sm"
              disabled={!isNameValid || !isSlugValid}
            >
              {t('editor.page.createAction')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PageCreateDialog
