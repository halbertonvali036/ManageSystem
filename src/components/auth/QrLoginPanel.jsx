import { Link } from 'react-router-dom'
import {
  AlertCircle,
  Check,
  Clock,
  LogIn,
  Mail,
  PlugZap,
  QrCode,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Smartphone,
  X,
} from 'lucide-react'
import {
  getQrLoginViewCopy,
  QR_LOGIN_VIEW,
} from '@/models/qrLogin'

const VIEW_ICONS = {
  [QR_LOGIN_VIEW.IDLE]: QrCode,
  [QR_LOGIN_VIEW.PREPARING]: QrCode,
  [QR_LOGIN_VIEW.READY]: QrCode,
  [QR_LOGIN_VIEW.WAITING]: ScanLine,
  [QR_LOGIN_VIEW.APPROVED]: Check,
  [QR_LOGIN_VIEW.EXPIRED]: Clock,
  [QR_LOGIN_VIEW.CANCELED]: X,
  [QR_LOGIN_VIEW.ERROR]: AlertCircle,
  [QR_LOGIN_VIEW.UNAVAILABLE]: PlugZap,
}

const INSTRUCTIONS = [
  {
    icon: Smartphone,
    title: 'Open the mobile app',
    text: 'Use the companion app once QR sign-in is enabled for your institution.',
  },
  {
    icon: ScanLine,
    title: 'Scan the code',
    text: 'The code is single-use and expires by itself, so it cannot be reused later.',
  },
  {
    icon: ShieldCheck,
    title: 'Confirm the request',
    text: 'Approve the sign-in in the app. Only the backend can complete it.',
  },
]

/**
 * QR sign-in panel.
 *
 * Renders one honest state at a time. The code area only ever shows an image
 * the backend issued for the current single-use session — there is no
 * decorative, generated or permanently valid QR code here, and the pairing
 * payload is never printed as text. Approval is only ever shown when the
 * backend reported it.
 */
function QrLoginPanel({
  view = QR_LOGIN_VIEW.IDLE,
  isAvailable = false,
  isBusy = false,
  isRefreshing = false,
  isCancelling = false,
  imageSource = null,
  countdown = null,
  deepLink = null,
  error = null,
  onCreate,
  onRefresh,
  onCancel,
  onReset,
}) {
  // Without the backend there is no session to show, so the whole panel reads
  // as integration-pending instead of pretending an idle request is possible.
  const isUnavailable = !isAvailable || view === QR_LOGIN_VIEW.UNAVAILABLE
  const activeView = isUnavailable ? QR_LOGIN_VIEW.UNAVAILABLE : view
  const copy = getQrLoginViewCopy(activeView)
  const Icon = VIEW_ICONS[activeView] ?? QrCode
  const isRestartable = [
    QR_LOGIN_VIEW.EXPIRED,
    QR_LOGIN_VIEW.CANCELED,
    QR_LOGIN_VIEW.ERROR,
  ].includes(activeView)
  const showCode = [QR_LOGIN_VIEW.READY, QR_LOGIN_VIEW.WAITING].includes(activeView)

  return (
    <div className="qr-login">
      {error ? (
        <div className="form__error-area anim-shake" key={error} role="alert">
          <AlertCircle size={16} aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="qr-login__stage" data-state={activeView}>
        {showCode && imageSource ? (
          <div className="qr-login__code">
            <img
              className="qr-login__image"
              src={imageSource}
              width={196}
              height={196}
              alt="QR sign-in code for this browser"
            />
          </div>
        ) : (
          <div className="qr-login__placeholder" aria-hidden="true">
            {activeView === QR_LOGIN_VIEW.PREPARING ? (
              <span className="spinner qr-login__spinner" />
            ) : (
              <Icon size={30} />
            )}
          </div>
        )}

        <div className="qr-login__status" role="status" aria-live="polite">
          <span
            className={`qr-login__status-icon qr-login__status-icon--${activeView}`}
            aria-hidden="true"
          >
            <Icon size={16} />
          </span>
          <div className="qr-login__status-text">
            <p className="qr-login__title">{copy.title}</p>
            <p className="qr-login__description">{copy.description}</p>
          </div>
          {countdown ? (
            <span className="qr-login__countdown" aria-label={`Expires in ${countdown}`}>
              <Clock size={13} aria-hidden="true" />
              {countdown}
            </span>
          ) : null}
        </div>
      </div>

      {isUnavailable ? (
        <div className="qr-login__notice" role="note">
          <PlugZap size={16} aria-hidden="true" />
          <p>
            <strong>Not connected yet.</strong> A scannable code requires the backend to issue
            a short-lived, single-use pairing session and the mobile app to confirm it. No
            placeholder code is shown, because it could never sign anyone in.
          </p>
        </div>
      ) : (
        <>
          <ol className="qr-login__steps">
            {INSTRUCTIONS.map((step, index) => (
              <li className="qr-login__step" key={step.title}>
                <span className="qr-login__step-marker" aria-hidden="true">
                  {index + 1}
                </span>
                <span className="qr-login__step-text">
                  <strong>{step.title}</strong>
                  <span>{step.text}</span>
                </span>
              </li>
            ))}
          </ol>

          {deepLink ? (
            <a className="qr-login__deep-link" href={deepLink}>
              <Smartphone size={16} aria-hidden="true" />
              Open the mobile app
            </a>
          ) : null}

          <div className="qr-login__actions">
            {activeView === QR_LOGIN_VIEW.IDLE ? (
              <button
                type="button"
                className="btn btn--primary btn--block auth-cta"
                onClick={onCreate}
                disabled={isBusy}
              >
                {isBusy ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    Preparing&hellip;
                  </>
                ) : (
                  <>
                    <QrCode size={16} className="auth-cta__icon" aria-hidden="true" />
                    Show a QR code
                  </>
                )}
              </button>
            ) : null}

            {activeView === QR_LOGIN_VIEW.PREPARING ? (
              <button
                type="button"
                className="btn btn--outline btn--block"
                onClick={onCancel}
                disabled={isBusy}
              >
                <X size={16} aria-hidden="true" />
                Cancel
              </button>
            ) : null}

            {showCode ? (
              <>
                <button
                  type="button"
                  className="btn btn--outline btn--icon-left"
                  onClick={onRefresh}
                  disabled={isBusy}
                >
                  <RefreshCw size={16} aria-hidden="true" />
                  {isRefreshing ? 'Checking…' : 'I scanned it'}
                </button>
                <button
                  type="button"
                  className="btn btn--outline btn--icon-left"
                  onClick={onCancel}
                  disabled={isBusy}
                >
                  <X size={16} aria-hidden="true" />
                  {isCancelling ? 'Canceling…' : 'Cancel'}
                </button>
              </>
            ) : null}

            {activeView === QR_LOGIN_VIEW.APPROVED ? (
              <Link to="/" className="btn btn--primary btn--block auth-cta">
                <LogIn size={16} className="auth-cta__icon" aria-hidden="true" />
                Open my workspace
              </Link>
            ) : null}

            {isRestartable ? (
              <button
                type="button"
                className="btn btn--primary btn--block auth-cta"
                onClick={onReset}
                disabled={isBusy}
              >
                <QrCode size={16} className="auth-cta__icon" aria-hidden="true" />
                Start again
              </button>
            ) : null}
          </div>

          {activeView === QR_LOGIN_VIEW.WAITING ? (
            <p className="qr-login__hint">
              Still nothing? Check that the app is signed in to the right account, then ask for
              a new code.
            </p>
          ) : null}
        </>
      )}

      <div className="auth-back qr-login__back">
        <Link to="/login" className="form__link">
          <Mail size={14} aria-hidden="true" />
          Use email and password instead
        </Link>
      </div>
    </div>
  )
}

export default QrLoginPanel
