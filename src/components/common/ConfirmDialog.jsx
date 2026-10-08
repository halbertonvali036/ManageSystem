import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'

function ConfirmDialog({
  open,
  title,
  message,
  children,
  confirmLabel = 'Delete',
  confirmingLabel = 'Deleting…',
  cancelLabel = 'Cancel',
  // Optional so existing callers keep the English default; callers with their own
  // i18n pass the translated string.
  closeLabel = 'Close dialog',
  isConfirming = false,
  error = null,
  onConfirm,
  onCancel,
}) {
  const titleId = useId()
  const closeButtonRef = useRef(null)
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const previousFocus = document.activeElement
    return () => { if (previousFocus?.isConnected) previousFocus.focus() }
  }, [open])

  useEffect(() => {
    if (!open) {
      return undefined
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Tab') {
        const targets = [...dialogRef.current.querySelectorAll(
          'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        )].filter(element => element.getClientRects().length)
        const first = targets[0]
        const last = targets[targets.length - 1]
        if (!first) {
          event.preventDefault()
          dialogRef.current.focus()
        } else if (event.shiftKey && (document.activeElement === first || !targets.includes(document.activeElement))) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && (document.activeElement === last || !targets.includes(document.activeElement))) {
          event.preventDefault()
          first.focus()
        }
      }
      if (event.key === 'Escape' && !isConfirming) {
        event.preventDefault()
        onCancel?.()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, isConfirming, onCancel])

  if (!open) {
    return null
  }

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget && !isConfirming) {
      onCancel?.()
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={handleOverlayClick}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="modal__header">
          <h2 className="modal__title" id={titleId}>
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="modal__close"
            aria-label={closeLabel}
            onClick={onCancel}
            disabled={isConfirming}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        {message ? <p className="modal__message">{message}</p> : null}

        {children}

        {error ? (
          <div className="modal__error" role="alert">
            {error}
          </div>
        ) : null}

        <footer className="modal__actions">
          <button
            type="button"
            className="btn"
            onClick={onCancel}
            disabled={isConfirming}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="btn btn--danger btn--icon-left"
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? (
              <>
                <span className="spinner" aria-hidden="true" />
                {confirmingLabel}
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </footer>
      </div>
    </div>
  )
}

export default ConfirmDialog
