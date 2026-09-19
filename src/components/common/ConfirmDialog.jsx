import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'

function ConfirmDialog({
  open,
  title,
  message,
  children,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isConfirming = false,
  error = null,
  onConfirm,
  onCancel,
}) {
  const titleId = useId()
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (!open) {
      return undefined
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isConfirming) {
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
            aria-label="Close dialog"
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
                Deleting&hellip;
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