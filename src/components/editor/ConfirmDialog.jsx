import { useEffect, useRef } from 'react'
import useTranslation from '@/hooks/useTranslation'

/**
 * A yes/no confirmation.
 *
 * Used for the two irreversible actions in the editor: deleting a page and
 * deleting a menu item. Both remove something the user cannot get back, because
 * there is no backend and no version history to restore from, so the confirmation
 * names what will be lost rather than asking a bare "are you sure".
 *
 * The cancel button is the one focused on open. A destructive dialog that puts
 * focus on "delete" is one stray Enter press away from losing a page, and the
 * focus ring then also tells the user which answer is being offered first.
 *
 * The focus trap and the Escape key behave exactly as they do in the section
 * library, because this is the same kind of dialog.
 */
function ConfirmDialog({
  isOpen,
  title,
  description,
  detail,
  confirmLabel,
  onConfirm,
  onClose,
}) {
  const { t } = useTranslation()
  const cancelRef = useRef(null)
  const dialogRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      cancelRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }
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
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
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
        className="editor-dialog editor-dialog--confirm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="editor-confirm-dialog-title"
        aria-describedby="editor-confirm-dialog-description"
        ref={dialogRef}
      >
        <div className="editor-dialog__head">
          <div>
            <h2 className="editor-dialog__title" id="editor-confirm-dialog-title">
              {title}
            </h2>
            <p className="editor-dialog__hint" id="editor-confirm-dialog-description">
              {description}
            </p>
          </div>
          <button
            type="button"
            className="editor-icon-button"
            onClick={onClose}
            ref={cancelRef}
            aria-label={t('common.close')}
          >
            {t('common.close')}
          </button>
        </div>

        {detail ? <p className="editor-dialog__detail">{detail}</p> : null}

        <div className="editor-dialog__actions">
          <button type="button" className="btn btn--outline btn--sm" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button
            type="button"
            className="btn btn--danger btn--sm"
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
