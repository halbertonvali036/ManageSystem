import { useState } from 'react'
import { Plus } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import { buildDomainDraft } from '@/models/domain'

/**
 * The add-domain form.
 *
 * The only field is a hostname, and the field is a bare name: no scheme, no path, no
 * trailing slash. The local check is shape only — a plausible hostname is not proof
 * that the customer owns the name, and the note under the form says so rather than
 * implying the platform has already confirmed anything.
 *
 * Submission is a request. Without a backend the form reports why and keeps what was
 * typed, so an offline attempt loses nothing.
 */
function DomainForm({ existingHostnames = [], isSubmitting, onSubmit }) {
  const { t } = useTranslation()

  const [hostname, setHostname] = useState('')
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitted(true)

    const draft = buildDomainDraft({ hostname }, { existingHostnames })
    setErrors(draft.errors)
    if (!draft.isValid) return

    try {
      await onSubmit(draft.hostname)
      setHostname('')
      setErrors({})
      setSubmitted(false)
    } catch {
      // The failure notice is rendered by the page. The typed value stays put.
    }
  }

  const error = submitted ? errors.hostname : null
  const errorId = 'domain-hostname-error'
  const hintId = 'domain-hostname-hint'

  return (
    <form className="dom-form" onSubmit={handleSubmit} noValidate>
      <div className="dom-form__field">
        <label className="form__label" htmlFor="domain-hostname">
          {t('workspaceDomains.form.hostnameLabel')}
        </label>
        <input
          id="domain-hostname"
          name="hostname"
          type="text"
          className={`form__input${error ? ' form__input--error' : ''}`}
          value={hostname}
          onChange={(event) => {
            setHostname(event.target.value)
            if (errors.hostname) setErrors({})
          }}
          placeholder={t('workspaceDomains.form.hostnamePlaceholder')}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : hintId}
          autoComplete="off"
          spellCheck="false"
        />

        {error ? (
          <p className="form__error" id={errorId} role="alert">
            {t(`workspaceDomains.form.hostnameError.${error}`)}
          </p>
        ) : (
          <p className="form__hint" id={hintId}>
            {t('workspaceDomains.form.hostnameHint')}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="btn btn--primary dom-form__submit"
        disabled={isSubmitting}
      >
        <Plus size={15} aria-hidden="true" />
        {isSubmitting
          ? t('workspaceDomains.form.adding')
          : t('workspaceDomains.form.addCta')}
      </button>
    </form>
  )
}

export default DomainForm
