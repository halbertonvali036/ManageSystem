import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckCircle2, CreditCard, Info, TestTube2 } from 'lucide-react'
import Card from '@/components/common/Card'
import useAccountCopy from '@/hooks/useAccountCopy'
import useBillingOverview from '@/hooks/useBillingOverview'
import useTranslation from '@/hooks/useTranslation'
import {
  formatBillingAmount,
  getBillingCycleLabel,
  isCheckoutSessionClosed,
  isCheckoutSessionPaid,
  toCheckoutSession,
} from '@/models/billing'
import billingService from '@/services/billingService'
import {
  BackendNotConnectedError,
  RequestError,
  getRequestErrorMessage,
} from '@/services/httpClient'
import { BILLING_PATH } from '@/utils/constants'
import { isCardExpiryValid, isCardNumberValid, isCvcValid, toCardDigits } from '@/utils/validation'

/**
 * Secure checkout for one billing session.
 *
 * Everything shown here (plan, cycle, amount, currency) comes from the
 * backend's own session — no price is ever invented. This is test mode, and
 * the banner says so plainly.
 *
 * Card safety rules, enforced by construction:
 * - the fields are uncontrolled and live inside the form only; values are read
 *   once on submit, the form is cleared immediately, and the numbers exist
 *   solely as local variables until the confirm request settles;
 * - nothing is written to localStorage/sessionStorage/URLs, nothing is logged,
 *   and no error object or store ever carries card data;
 * - if a backend message happens to echo card-like digit runs, they are
 *   stripped before the message is rendered.
 */

/** Removes anything that looks like a card number from a backend message. */
const sanitizeCardData = (message) =>
  String(message ?? '').replace(/(?:\d[ -]?){12,19}\d*/g, '[•••]')

/** Backend statuses that mean the session can no longer be paid. */
const CLOSED_SESSION_STATUSES = new Set([404, 409, 410])

const TEST_CARDS = [
  { number: '4242 4242 4242 4242', resultKey: 'testCardSuccess' },
  { number: '4000 0000 0000 0002', resultKey: 'testCardDeclined' },
  { number: '4000 0000 0000 9995', resultKey: 'testCardInsufficient' },
]

function CheckoutPage() {
  const copy = useAccountCopy()
  const { t } = useTranslation()
  const { sessionId } = useParams()
  const { refetch } = useBillingOverview()

  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [closedState, setClosedState] = useState(null)
  const [closedDetail, setClosedDetail] = useState(null)
  const [isPaid, setIsPaid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)

  const formRef = useRef(null)
  const holderRef = useRef(null)
  const numberRef = useRef(null)
  const expiryRef = useRef(null)
  const cvcRef = useRef(null)

  const holderFieldId = useId()
  const numberFieldId = useId()
  const expiryFieldId = useId()
  const cvcFieldId = useId()

  const closedStateFor = useCallback((reason, detail = null) => {
    setClosedState(reason)
    setClosedDetail(detail ? sanitizeCardData(detail) : null)
    setSubmitError(null)
  }, [])

  /**
   * Reads the session. The state updates live in the promise callbacks, so
   * the mount effect never triggers a synchronous state update; the retry
   * button clears the previous outcome itself before calling this again.
   */
  const loadSession = useCallback(
    () =>
      billingService
        .getCheckoutSession(sessionId)
        .then((data) => {
          setLoadError(null)
          setClosedState(null)
          setClosedDetail(null)
          const loaded = toCheckoutSession(data)
          if (!loaded) {
            closedStateFor('notFound')
            return
          }
          setSession(loaded)
          if (isCheckoutSessionClosed(loaded)) {
            closedStateFor(isCheckoutSessionPaid(loaded) ? 'paid' : 'expired')
          }
        })
        .catch((error) => {
          if (error instanceof RequestError && CLOSED_SESSION_STATUSES.has(error.status)) {
            // The session id itself is unknown or already consumed — expired,
            // paid or never existed. That is a dedicated state, not a load error.
            closedStateFor(
              error.status === 409 ? 'paid' : 'notFound',
              getRequestErrorMessage(error),
            )
            return
          }
          setLoadError(
            error instanceof BackendNotConnectedError
              ? t('billingCheckout.backendUnavailable')
              : sanitizeCardData(getRequestErrorMessage(error)),
          )
        })
        .finally(() => {
          setIsLoading(false)
        }),
    [sessionId, t, closedStateFor],
  )

  useEffect(() => {
    loadSession()
  }, [loadSession])

  /** Retry from the error state: show the spinner again, then reload. */
  const handleRetry = () => {
    setIsLoading(true)
    setLoadError(null)
    loadSession()
  }

  /** Displays the card number in groups of four as it is typed. */
  const handleNumberInput = (event) => {
    const digits = toCardDigits(event.target.value).slice(0, 19)
    event.target.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  /** Keeps the expiry as `MM/YY` while typing. */
  const handleExpiryInput = (event) => {
    const digits = toCardDigits(event.target.value).slice(0, 4)
    event.target.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting || isPaid || closedState) {
      return
    }
    setSubmitError(null)

    const form = event.currentTarget
    const cardholderName = holderRef.current.value.trim()
    const cardNumber = toCardDigits(numberRef.current.value)
    const expiry = expiryRef.current.value.trim()
    const cvc = cvcRef.current.value.trim()

    const errors = {}
    if (cardholderName === '') {
      errors.holder = t('billingCheckout.cardholderNameRequired')
    }
    if (!isCardNumberValid(cardNumber)) {
      errors.number = t('billingCheckout.cardNumberInvalid')
    }
    if (!isCardExpiryValid(expiry)) {
      errors.expiry = t('billingCheckout.expiryInvalid')
    }
    if (!isCvcValid(cvc)) {
      errors.cvc = t('billingCheckout.cvcInvalid')
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})

    const [monthText, yearText] = expiry.split('/')
    const card = {
      cardholderName,
      cardNumber,
      expMonth: Number(monthText),
      expYear: 2000 + Number(yearText),
      cvc,
    }

    /*
     * The card values leave the form here and exist only as locals of this
     * call. The fields are cleared right away — on success as well as on
     * failure — so no card data stays behind anywhere in the page.
     */
    form.reset()

    setIsSubmitting(true)
    try {
      await billingService.confirmCheckout(sessionId, card)
      setIsPaid(true)
      try {
        await refetch({ silent: true })
      } catch {
        // The charge already succeeded; /billing re-reads on navigation.
      }
    } catch (error) {
      if (error instanceof RequestError && CLOSED_SESSION_STATUSES.has(error.status)) {
        closedStateFor(
          error.status === 409 ? 'paid' : 'notFound',
          getRequestErrorMessage(error),
        )
        return
      }
      setSubmitError(
        error instanceof BackendNotConnectedError
          ? t('billingCheckout.backendUnavailable')
          : sanitizeCardData(getRequestErrorMessage(error)),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const backToBilling = (
    <Link className="btn btn--outline btn--icon-left" to={BILLING_PATH}>
      <ArrowLeft size={16} aria-hidden="true" />
      {t('billingCheckout.backToBilling')}
    </Link>
  )

  const testModeBanner = (
    <div className="checkout-testmode" role="note">
      <span className="checkout-testmode__icon" aria-hidden="true">
        <TestTube2 size={16} />
      </span>
      <p className="checkout-testmode__text">
        <strong className="checkout-testmode__title">{t('billingCheckout.testMode')}</strong>{' '}
        {t('billingCheckout.testModeHint')}
      </p>
    </div>
  )

  if (isLoading) {
    return (
      <div className="billing-page checkout-page">
        {testModeBanner}
        <Card>
          <div className="page-status">
            <span className="spinner" aria-hidden="true" />
            {t('billingCheckout.loadingSession')}
          </div>
        </Card>
      </div>
    )
  }

  if (closedState) {
    const titleKey =
      closedState === 'paid'
        ? 'billingCheckout.alreadyPaidTitle'
        : closedState === 'expired'
          ? 'billingCheckout.expiredTitle'
          : 'billingCheckout.notFoundTitle'
    const textKey =
      closedState === 'paid'
        ? 'billingCheckout.alreadyPaidText'
        : closedState === 'expired'
          ? 'billingCheckout.expiredText'
          : 'billingCheckout.notFoundText'

    return (
      <div className="billing-page checkout-page">
        {testModeBanner}
        <Card>
          <div className="table-state" role="status">
            <h2 className="table-state__title">{t(titleKey)}</h2>
            <p className="table-state__text">{t(textKey)}</p>
            {closedDetail ? (
              <p className="table-state__text checkout-closed__detail">{closedDetail}</p>
            ) : null}
            {backToBilling}
          </div>
        </Card>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="billing-page checkout-page">
        {testModeBanner}
        <Card>
          <div className="table-state table-state--error">
            <h2 className="table-state__title">{t('billingCheckout.failedToLoad')}</h2>
            <p className="table-state__text">{loadError}</p>
            <button type="button" className="btn btn--primary" onClick={handleRetry}>
              {t('accountPolish.retry')}
            </button>
          </div>
        </Card>
      </div>
    )
  }

  if (isPaid) {
    return (
      <div className="billing-page checkout-page">
        {testModeBanner}
        <Card>
          <div className="checkout-success" role="status">
            <span className="checkout-success__icon" aria-hidden="true">
              <CheckCircle2 size={20} />
            </span>
            <div className="checkout-success__body">
              <p className="checkout-success__title">{t('billingCheckout.confirmedTitle')}</p>
              <p className="checkout-success__text">{t('billingCheckout.confirmedText')}</p>
            </div>
            <Link className="btn btn--primary" to={BILLING_PATH}>
              {t('billingCheckout.backToBilling')}
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  const amountLabel = session ? formatBillingAmount(session.amount, session.currency) : null
  const currencyLabel = session?.currency ? String(session.currency).toUpperCase() : null
  const cycleLabel = session?.cycle
    ? session.cycle === 'monthly' || session.cycle === 'annual'
      ? t(
          session.cycle === 'monthly'
            ? 'accountPolish.billingCycleMonthly'
            : 'accountPolish.billingCycleYearly',
        )
      : getBillingCycleLabel(session.cycle)
    : null

  return (
    <div className="billing-page checkout-page">
      <p className="page-description">{t('billingCheckout.pageDescription')}</p>

      {testModeBanner}

      <Card title={t('billingCheckout.orderTitle')}>
        <dl className="checkout-summary">
          <div className="checkout-summary__field">
            <dt>{t('accountPolish.plan')}</dt>
            <dd>{session?.planName ?? <span className="plan-summary__unavailable">{copy('Unavailable')}</span>}</dd>
          </div>
          <div className="checkout-summary__field">
            <dt>{t('accountPolish.billingCycle')}</dt>
            <dd>{cycleLabel ?? <span className="plan-summary__unavailable">{copy('Unavailable')}</span>}</dd>
          </div>
          <div className="checkout-summary__field">
            <dt>{t('accountPolish.amount')}</dt>
            <dd>{amountLabel ?? <span className="plan-summary__unavailable">{copy('Unavailable')}</span>}</dd>
          </div>
          <div className="checkout-summary__field">
            <dt>{t('accountPolish.status')}</dt>
            <dd>{currencyLabel ?? <span className="plan-summary__unavailable">{copy('Unavailable')}</span>}</dd>
          </div>
        </dl>
      </Card>

      <Card title={t('billingCheckout.paymentDetailsTitle')}>
        <form className="checkout-form" ref={formRef} onSubmit={handleSubmit} noValidate>
          <div className="form__field checkout-form__field--wide">
            <label className="form__label" htmlFor={holderFieldId}>
              {t('billingCheckout.cardholderName')}
            </label>
            <input
              id={holderFieldId}
              ref={holderRef}
              type="text"
              className={`form__input${fieldErrors.holder ? ' form__input--error' : ''}`}
              autoComplete="cc-name"
              maxLength={80}
              disabled={isSubmitting}
              aria-invalid={Boolean(fieldErrors.holder)}
              aria-describedby={fieldErrors.holder ? `${holderFieldId}-error` : undefined}
            />
            {fieldErrors.holder ? (
              <p className="form__error" id={`${holderFieldId}-error`} role="alert">
                {fieldErrors.holder}
              </p>
            ) : null}
          </div>

          <div className="form__field checkout-form__field--wide">
            <label className="form__label" htmlFor={numberFieldId}>
              {t('billingCheckout.cardNumber')}
            </label>
            <input
              id={numberFieldId}
              ref={numberRef}
              type="text"
              inputMode="numeric"
              className={`form__input${fieldErrors.number ? ' form__input--error' : ''}`}
              autoComplete="cc-number"
              maxLength={23}
              disabled={isSubmitting}
              onChange={handleNumberInput}
              aria-invalid={Boolean(fieldErrors.number)}
              aria-describedby={fieldErrors.number ? `${numberFieldId}-error` : undefined}
            />
            {fieldErrors.number ? (
              <p className="form__error" id={`${numberFieldId}-error`} role="alert">
                {fieldErrors.number}
              </p>
            ) : null}
          </div>

          <div className="form__field">
            <label className="form__label" htmlFor={expiryFieldId}>
              {t('billingCheckout.expiry')}
            </label>
            <input
              id={expiryFieldId}
              ref={expiryRef}
              type="text"
              inputMode="numeric"
              className={`form__input${fieldErrors.expiry ? ' form__input--error' : ''}`}
              autoComplete="cc-exp"
              maxLength={5}
              placeholder="MM/YY"
              disabled={isSubmitting}
              onChange={handleExpiryInput}
              aria-invalid={Boolean(fieldErrors.expiry)}
              aria-describedby={fieldErrors.expiry ? `${expiryFieldId}-error` : undefined}
            />
            {fieldErrors.expiry ? (
              <p className="form__error" id={`${expiryFieldId}-error`} role="alert">
                {fieldErrors.expiry}
              </p>
            ) : null}
          </div>

          <div className="form__field">
            <label className="form__label" htmlFor={cvcFieldId}>
              {t('billingCheckout.cvc')}
            </label>
            <input
              id={cvcFieldId}
              ref={cvcRef}
              type="text"
              inputMode="numeric"
              className={`form__input${fieldErrors.cvc ? ' form__input--error' : ''}`}
              autoComplete="cc-csc"
              maxLength={4}
              disabled={isSubmitting}
              onChange={(event) => {
                event.target.value = toCardDigits(event.target.value).slice(0, 4)
              }}
              aria-invalid={Boolean(fieldErrors.cvc)}
              aria-describedby={fieldErrors.cvc ? `${cvcFieldId}-error` : undefined}
            />
            {fieldErrors.cvc ? (
              <p className="form__error" id={`${cvcFieldId}-error`} role="alert">
                {fieldErrors.cvc}
              </p>
            ) : null}
          </div>

          {submitError ? (
            <div className="form__error-area checkout-form__error" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{submitError}</span>
            </div>
          ) : null}

          <div className="checkout-form__actions">
            <button
              type="submit"
              className="btn btn--primary btn--icon-left"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <span className="spinner" aria-hidden="true" />
              ) : (
                <CreditCard size={16} aria-hidden="true" />
              )}
              {isSubmitting ? t('billingCheckout.confirming') : t('billingCheckout.confirmPayment')}
            </button>
            <span className="checkout-form__note">{t('billingCheckout.formNote')}</span>
          </div>
        </form>

        <div className="checkout-testcards">
          <p className="checkout-testcards__title">
            <Info size={14} aria-hidden="true" />
            {t('billingCheckout.testCardsTitle')}
          </p>
          <ul className="checkout-testcards__list">
            {TEST_CARDS.map((cardOption) => (
              <li key={cardOption.number}>
                <code className="checkout-testcards__number">{cardOption.number}</code>
                <span className="checkout-testcards__result">
                  {t(`billingCheckout.${cardOption.resultKey}`)}
                </span>
              </li>
            ))}
          </ul>
          <p className="checkout-testcards__hint">{t('billingCheckout.testCardsHint')}</p>
        </div>
      </Card>
    </div>
  )
}

export default CheckoutPage
