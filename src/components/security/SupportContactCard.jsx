import useAccountCopy from '@/hooks/useAccountCopy'
import useTranslation from '@/hooks/useTranslation'
import { useId } from 'react'
import { AlertCircle, Check, LifeBuoy, Send } from 'lucide-react'
import SecurityNotice from '@/components/security/SecurityNotice'
import SecuritySection from '@/components/security/SecuritySection'
import useSupportRequest from '@/hooks/useSupportRequest'
import useAuth from '@/hooks/useAuth'
import {
  SUPPORT_CATEGORIES,
  SUPPORT_CATEGORY_META,
  SUPPORT_FIELD_LIMITS,
} from '@/models/support'

/**
 * Support / contact.
 *
 * A short, professional intake form: category, subject, message. The account is
 * never asked for — the backend resolves the signed-in user from the session.
 * Without a support service the form can be filled in but cannot be sent, and
 * the card says exactly that instead of producing a ticket number.
 */
function SupportContactCard() {
  const { user } = useAuth()
  const copy = useAccountCopy()
  const { t } = useTranslation()
  const {
    draft,
    errors,
    isSubmitting,
    isUnavailable,
    submitError,
    isSubmitted,
    submittedReference,
    setField,
    submit,
    reset,
  } = useSupportRequest()

  const categoryHintId = useId()
  const subjectHintId = useId()
  const messageHintId = useId()
  const hasErrors = Object.keys(errors).length > 0

  return (
    <SecuritySection
      id="support"
      className="support-section"
      eyebrow={t('accountPolish.help')}
      title={t('accountPolish.supportContact')}
      description={t('accountPolish.tellUsWhatIsWrongAndTheAccountTeam')}
      icon={<LifeBuoy size={20} aria-hidden="true" />}
    >
      {isSubmitted ? (
        <div className="support-success" role="status">
          <span className="support-success__icon">
            <Check size={18} aria-hidden="true" />
          </span>
          <div className="support-success__body">
            <p className="support-success__title">{t('accountPolish.yourRequestWasAccepted')}</p>
            <p className="support-success__text">
              The support service recorded your message
              {submittedReference ? ` as ${submittedReference}` : ''}. Keep the reference for any
              follow-up.
            </p>
          </div>
          <button type="button" className="btn btn--outline" onClick={reset}>{t('accountPolish.sendAnother')}</button>
        </div>
      ) : (
        <>
          {isUnavailable ? (
            <SecurityNotice tone="pending" title={t('accountPolish.sendingIsNotConnectedYet')}>{t('accountPolish.noSupportServiceIsAttachedToThisAccountSo')}</SecurityNotice>
          ) : null}

          <form
            className="support-form"
            onSubmit={(event) => {
              event.preventDefault()
              submit()
            }}
            noValidate
          >
            <div className="form__field">
              <label className="form__label" htmlFor={`${categoryHintId}-category`}>{t('accountPolish.whatIsThisAbout')}</label>
              <select
                id={`${categoryHintId}-category`}
                className="form__input form__select"
                value={draft.category}
                onChange={(event) => setField('category', event.target.value)}
                aria-describedby={errors.category ? categoryHintId : undefined}
                aria-invalid={Boolean(errors.category)}
                disabled={isSubmitting}
              >
                <option value="">{t('accountPolish.chooseACategory')}</option>
                {SUPPORT_CATEGORIES.filter(category => user?.role === 'admin' || category !== 'academic_access').map((category) => (
                  <option key={category} value={category}>
                    {copy(SUPPORT_CATEGORY_META[category].label)} —{' '}
                    {copy(SUPPORT_CATEGORY_META[category].description)}
                  </option>
                ))}
              </select>
              {errors.category ? (
                <p className="form__error" id={categoryHintId} role="alert">
                  {errors.category}
                </p>
              ) : null}
            </div>

            <div className="form__field">
              <label className="form__label" htmlFor={`${subjectHintId}-subject`}>{t('accountPolish.subject')}</label>
              <input
                id={`${subjectHintId}-subject`}
                type="text"
                className="form__input"
                value={draft.subject}
                maxLength={SUPPORT_FIELD_LIMITS.SUBJECT_MAX}
                placeholder={t('accountPolish.shortSummaryForExampleCannotOpenMyGradeDetails')}
                onChange={(event) => setField('subject', event.target.value)}
                aria-describedby={errors.subject ? subjectHintId : undefined}
                aria-invalid={Boolean(errors.subject)}
                disabled={isSubmitting}
              />
              {errors.subject ? (
                <p className="form__error" id={subjectHintId} role="alert">
                  {errors.subject}
                </p>
              ) : null}
            </div>

            <div className="form__field">
              <label className="form__label" htmlFor={`${messageHintId}-message`}>{t('accountPolish.message')}</label>
              <textarea
                id={`${messageHintId}-message`}
                className="form__input"
                rows={5}
                value={draft.message}
                maxLength={SUPPORT_FIELD_LIMITS.MESSAGE_MAX}
                placeholder={t('accountPolish.whatHappenedWhatYouExpectedAndAnythingYouAlready')}
                onChange={(event) => setField('message', event.target.value)}
                aria-describedby={errors.message ? messageHintId : undefined}
                aria-invalid={Boolean(errors.message)}
                disabled={isSubmitting}
              />
              {errors.message ? (
                <p className="form__error" id={messageHintId} role="alert">
                  {errors.message}
                </p>
              ) : null}
            </div>

            {submitError ? (
              <div className="form__error-area" role="alert">
                <AlertCircle size={16} aria-hidden="true" />
                <span>{submitError}</span>
              </div>
            ) : null}

            {hasErrors && !submitError ? (
              <p className="support-form__summary" role="alert">{t('accountPolish.checkTheHighlightedFieldsBeforeSending')}</p>
            ) : null}

            <div className="support-form__actions">
              <button
                type="submit"
                className="btn btn--primary btn--icon-left"
                disabled={isUnavailable || isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="spinner" aria-hidden="true" />
                ) : (
                  <Send size={16} aria-hidden="true" />
                )}
                {isSubmitting ? copy('Sending…') : copy('Send request')}
              </button>
              <span className="support-form__note">{t('accountPolish.sentWithYourSignedInAccountWeDoNot')}</span>
            </div>
          </form>
        </>
      )}
    </SecuritySection>
  )
}

export default SupportContactCard
