import { useEffect, useId, useRef, useState } from 'react'
import { UserPlus, X } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import { BackendNotConnectedError } from '@/services/httpClient'
import {
  DEFAULT_MEMBER_ROLE,
  INVITABLE_MEMBER_ROLES,
  MEMBER_ROLE_LABEL_KEYS,
  buildInviteDraft,
} from '@/models/member'

/**
 * The `Dəvət et` dialog — an email address and a role, nothing else.
 *
 * Two fields on purpose. A member record is created by the backend from the address
 * and the grant; there is no name field because there is no way to know a person's
 * name from an invitation, and asking for one would put a guess on a permissions row.
 *
 * The form cannot report success. Submitting hands the draft to `onInvite`, and the
 * dialog only closes if that call resolves — which means the backend has confirmed the
 * invitation. Without a backend the call throws, the reason is shown inside the dialog
 * and what was typed stays put, so an offline attempt loses nothing.
 *
 * The parent mounts this only while it is open, so a reopened dialog starts empty from
 * `useState` rather than needing an effect to clear itself.
 */
function InviteMemberDialog({ existingEmails = [], isSubmitting, onInvite, onClose }) {
  const { t } = useTranslation()
  const titleId = useId()
  const dialogRef = useRef(null)
  const emailRef = useRef(null)

  const [email, setEmail] = useState('')
  const [role, setRole] = useState(DEFAULT_MEMBER_ROLE)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  // Moving focus into the dialog is synchronising with the browser, which is what an
  // effect is for.
  useEffect(() => {
    emailRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSubmitting) {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) {
        return
      }
      const focusable = dialogRef.current.querySelectorAll(
        'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
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
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose, isSubmitting])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitted(true)
    setSubmitError(null)

    const draft = buildInviteDraft({ email, role }, { existingEmails })
    setErrors(draft.errors)
    if (!draft.isValid) return

    // Resolving means the backend confirmed the invitation, so only then is it honest
    // to close. A rejection leaves the dialog open with the typed address intact and
    // says why — it never reports an invitation that was not sent.
    try {
      await onInvite(draft)
      onClose()
    } catch (error) {
      setSubmitError(
        error instanceof BackendNotConnectedError
          ? t('workspaceMembers.invite.unavailableNotice')
          : t('workspaceMembers.invite.failed')
      )
    }
  }

  const emailError = submitted ? errors.email : null
  // The select only offers assignable roles, so this is a guard rather than a routine
  // field. It is still rendered: a draft that cannot be sent must say why instead of
  // leaving the form inert on submit.
  const roleError = submitted ? errors.role : null
  const emailErrorId = 'member-invite-email-error'
  const emailHintId = 'member-invite-email-hint'

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose()
      }}
    >
      <div
        className="modal mem-invite"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={dialogRef}
        tabIndex={-1}
      >
        <form onSubmit={handleSubmit} noValidate>
          <header className="modal__header">
            <div>
              <h2 className="modal__title" id={titleId}>
                <UserPlus size={18} aria-hidden="true" />
                {t('workspaceMembers.invite.title')}
              </h2>
              <p className="mem-invite__hint">{t('workspaceMembers.invite.description')}</p>
            </div>
            <button
              type="button"
              className="modal__close"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label={t('common.close')}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </header>

          <div className="mem-invite__fields">
            <div className="form__field">
              <label className="form__label" htmlFor="member-invite-email">
                {t('workspaceMembers.invite.emailLabel')}
              </label>
              <input
                id="member-invite-email"
                ref={emailRef}
                type="email"
                name="email"
                className={`form__input${emailError ? ' form__input--error' : ''}`}
                value={email}
                maxLength={254}
                autoComplete="off"
                spellCheck="false"
                disabled={isSubmitting}
                aria-invalid={emailError ? 'true' : 'false'}
                aria-describedby={emailError ? emailErrorId : emailHintId}
                placeholder={t('workspaceMembers.invite.emailPlaceholder')}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (errors.email) setErrors({})
                }}
              />
              {emailError ? (
                <p className="form__error" id={emailErrorId} role="alert">
                  {t(`workspaceMembers.invite.emailError.${emailError}`)}
                </p>
              ) : (
                <p className="form__hint" id={emailHintId}>
                  {t('workspaceMembers.invite.emailHint')}
                </p>
              )}
            </div>

            <div className="form__field">
              <label className="form__label" htmlFor="member-invite-role">
                {t('workspaceMembers.invite.roleLabel')}
              </label>
              <select
                id="member-invite-role"
                name="role"
                className="form__select"
                value={role}
                disabled={isSubmitting}
                aria-invalid={roleError ? 'true' : 'false'}
                aria-describedby={roleError ? 'member-invite-role-error' : 'member-invite-role-hint'}
                onChange={(event) => setRole(event.target.value)}
              >
                {INVITABLE_MEMBER_ROLES.map((item) => (
                  <option key={item} value={item}>
                    {t(MEMBER_ROLE_LABEL_KEYS[item])}
                  </option>
                ))}
              </select>
              {roleError ? (
                <p className="form__error" id="member-invite-role-error" role="alert">
                  {t(`workspaceMembers.invite.roleError.${roleError}`)}
                </p>
              ) : (
                <p className="form__hint" id="member-invite-role-hint">
                  {t('workspaceMembers.invite.roleHint')}
                </p>
              )}
            </div>
          </div>

          <p className="mem-invite__note">{t('workspaceMembers.invite.backendNote')}</p>

          {submitError ? (
            <p className="modal__error" role="alert">
              {submitError}
            </p>
          ) : null}

          <footer className="modal__actions">
            <button
              type="button"
              className="btn btn--outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  {t('workspaceMembers.invite.sending')}
                </>
              ) : (
                t('workspaceMembers.invite.submit')
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

export default InviteMemberDialog
