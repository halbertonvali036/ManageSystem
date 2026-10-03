import { useMemo } from 'react'
import QrLoginPanel from '@/components/auth/QrLoginPanel'
import useQrLoginSession from '@/hooks/useQrLoginSession'
import config from '@/config'
import {
  buildQrDeepLink,
  formatCountdown,
  getQrImageSource,
} from '@/models/qrLogin'

/**
 * Public QR sign-in page (`/login/qr`).
 *
 * Presented as a secondary sign-in method beside email/password and Google. The
 * page only asks the backend for a single-use pairing session and reports the
 * status the backend returns; it never mints a code, never trusts a local
 * approval and never establishes a session by itself.
 */
function QrLoginPage() {
  const {
    session,
    view,
    isAvailable,
    isBusy,
    isRefreshing,
    isCancelling,
    error,
    remainingSeconds,
    create,
    refreshStatus,
    cancel,
    reset,
  } = useQrLoginSession()

  const imageSource = useMemo(() => getQrImageSource(session), [session])
  // The badge is only meaningful while time is left; at zero the view itself
  // already says the code expired, and an absent expiry says nothing at all.
  const countdown = remainingSeconds > 0 ? formatCountdown(remainingSeconds) : null
  const deepLink = useMemo(
    () => buildQrDeepLink(config.qrLogin?.appDeepLinkBase, session?.sessionId),
    [session],
  )

  return (
    <div className="auth-card auth-qr-card anim-scale-in">
      <div className="auth-card__head">
        <p className="auth-card__eyebrow anim-fade-up anim-delay-1">Secondary sign-in</p>
        <h1 className="auth-card__title anim-fade-up anim-delay-1">
          Sign in with a QR code
        </h1>
        <p className="auth-card__subtitle anim-fade-up anim-delay-2">
          Approve this browser from the mobile app instead of typing a password.
        </p>
      </div>

      <QrLoginPanel
        view={view}
        isAvailable={isAvailable}
        isBusy={isBusy}
        isRefreshing={isRefreshing}
        isCancelling={isCancelling}
        imageSource={imageSource}
        countdown={countdown}
        deepLink={deepLink}
        error={error}
        onCreate={create}
        onRefresh={refreshStatus}
        onCancel={cancel}
        onReset={reset}
      />
    </div>
  )
}

export default QrLoginPage
