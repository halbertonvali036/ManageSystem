import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'

/**
 * Confirmation dialog shared by the app and the editor.
 *
 * The default `modal` appearance is the app-wide confirmation built on the
 * `modal` classes. `appearance="editor"` uses the editor's dialog surface and
 * its translated close/cancel labels. Both keep the same focus handling: the
 * close control is focused on open, Tab stays inside the dialog, and Escape
 * closes it (except while a modal confirmation is in progress).
 *
 * The two prop dialects are accepted so callers do not need to change their
 * state shape: `open`/`onCancel` for the modal usage and `isOpen`/`onClose` for
 * the editor usage. `message` and `description` likewise map to the modal
 * message and the editor description respectively.
 */
function ConfirmDialog({
  open,
  isOpen,
  appearance = 'modal',
  title,
  message,
  description,
  children,
  detail,
  confirmLabel = 'Delete',
  confirmingLabel = 'Deleting…',
  cancelLabel,
  // Optional so modal callers keep the English default; callers with their own
  // i18n pass the translated string. The editor appearance falls back to the
  // shared translated labels.
  closeLabel,
  confirmVariant = 'danger',
  isConfirming = false,
  error = null,
  onConfirm,
  onCancel,
  onClose,
}) {
  const { t } = useTranslation()
  const titleId = useId()
  const closeButtonRef = useRef(null)
  const dialogRef = useRef(null)

  const isEditor = appearance === 'editor'
  const isDialogOpen = open ?? isOpen ?? false
  const handleClose = onClose ?? onCancel
  const resolvedCloseLabel = closeLabel ?? (isEditor ? t('common.close') : 'Close dialog')
  const resolvedCancelLabel = cancelLabel ?? (isEditor ? t('common.cancel') : 'Cancel')

  useEffect(() => {
    if (!isDialogOpen) return undefined
    const previousFocus = document.activeElement
    if (isEditor) {
      closeButtonRef.current?.focus()
    }
    return () => { if (previousFocus?.isConnected) previousFocus.focus() }
  }, [isDialogOpen, isEditor])

  useEffect(() => {
    if (!isDialogOpen) {
      return undefined
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Tab') {
        if (!dialogRef.current) {
          return
        }
        const targets = isEditor
          ? [...dialogRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          )]
          : [...dialogRef.current.querySelectorAll(
            'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
          )].filter(element => element.getClientRects().length)
        if (isEditor) {
          if (targets.length === 0) {
            return
          }
          const first = targets[0]
          const last = targets[targets.length - 1]
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault()
            last.focus()
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault()
            first.focus()
          }
        } else {
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
      }
      if (event.key === 'Escape' && (isEditor || !isConfirming)) {
        event.preventDefault()
        handleClose?.()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    if (isEditor) {
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isDialogOpen, isEditor, isConfirming, handleClose])

  if (!isDialogOpen) {
    return null
  }

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget && !isConfirming) {
      handleClose?.()
    }
  }

  if (isEditor) {
    return (
      <div className="editor-dialog-layer">
        <button
          type="button"
          className="editor-dialog__backdrop"
          onClick={handleClose}
          aria-label={resolvedCloseLabel}
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
              onClick={handleClose}
              ref={closeButtonRef}
              aria-label={resolvedCloseLabel}
            >
              {resolvedCloseLabel}
            </button>
          </div>

          {detail ? <p className="editor-dialog__detail">{detail}</p> : null}

          <div className="editor-dialog__actions">
            <button type="button" className="btn btn--outline btn--sm" onClick={handleClose}>
              {resolvedCancelLabel}
            </button>
            <button
              type="button"
              className="btn btn--danger btn--sm"
              onClick={() => {
                onConfirm()
                handleClose()
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    )
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
            aria-label={resolvedCloseLabel}
            onClick={handleClose}
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
            onClick={handleClose}
            disabled={isConfirming}
          >
            {resolvedCancelLabel}
          </button>
          <button
            type="button"
            className={`btn btn--${confirmVariant} btn--icon-left`}
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
