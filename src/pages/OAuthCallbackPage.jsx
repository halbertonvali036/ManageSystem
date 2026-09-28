import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle, Check, LogIn, ShieldCheck, UserRound } from 'lucide-react'
import useAuth from '@/hooks/useAuth'
import authService from '@/services/authService'
import { BackendNotConnectedError } from '@/services/httpClient'
import {
  getOAuthErrorCode,
  getOAuthErrorDetails,
  isOAuthErrorCode,
  toOAuthCallbackParams,
  OAUTH_BACKEND_UNAVAILABLE_MESSAGE,
  OAUTH_ERROR,
  OAUTH_OUTCOME,
} from '@/models/externalAuth'
import { getRoleDashboardPath } from '@/utils/roles'

/**
 * Public OAuth callback route.
 *
 * Flow: the backend starts Google sign-in, Google returns here with an
 * authorization code (or a cancellation), and the backend exchanges it. This
 * page forwards only `code`, `state` and `error`, renders one of three honest
 * states, and never displays, stores or derives a token.
 *
 * The role is taken from the session the backend returns, so routing stays
 * role-aware and no role can be requested through the URL.
 */
function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { adoptExternalSession } = useAuth()
  const [errorCode, setErrorCode] = useState(null)
  const [handoffPath, setHandoffPath] = useState(null)
  const startedRef = useRef(false)

  const params = useMemo(
    () => toOAuthCallbackParams(searchParams),
    [searchParams],
  )

  useEffect(() => {
    if (startedRef.current) {
      return
    }
    startedRef.current = true

    const completeSignIn = async () => {
      if (params.error) {
        setErrorCode(getOAuthErrorCode(params.error))
        return
      }
      if (!params.code) {
        setErrorCode(OAUTH_ERROR.INVALID_REQUEST)
        return
      }

      try {
        const result = await authService.handleOAuthCallback(params)

        if (result.outcome === OAUTH_OUTCOME.AUTHENTICATED && result.session) {
          adoptExternalSession(result.session)
          setHandoffPath(result.returnTo ?? getRoleDashboardPath(result.session.user.role))
          return
        }
        if (result.outcome === OAUTH_OUTCOME.FAILED) {
          setErrorCode(result.errorCode)
          return
        }
        setErrorCode(OAUTH_ERROR.INVALID_REQUEST)
      } catch (requestError) {
        setErrorCode(
          requestError instanceof BackendNotConnectedError
            ? OAUTH_ERROR.BACKEND_UNAVAILABLE
            : isOAuthErrorCode(requestError?.code)
              ? requestError.code
              : OAUTH_ERROR.UNKNOWN,
        )
      }
    }

    completeSignIn()
  }, [adoptExternalSession, params])

  const details = getOAuthErrorDetails(errorCode)
  const isProcessing = errorCode === null && handoffPath === null

  // Give the confirmed success state a brief, readable moment before the
  // role-aware router takes over. This only runs after the backend returned a
  // real session — nothing here can be reached without one.
  useEffect(() => {
    if (handoffPath === null) {
      return undefined
    }
    const timer = window.setTimeout(() => {
      navigate(handoffPath, { replace: true })
    }, 900)
    return () => window.clearTimeout(timer)
  }, [handoffPath, navigate])

  if (isProcessing) {
    return (
      <div className="auth-card auth-callback anim-scale-in">
        <div className="auth-card__head">
          <p className="auth-card__eyebrow">External sign-in</p>
          <h2 className="auth-card__title">Finishing your Google sign-in</h2>
          <p className="auth-card__subtitle">
            We are confirming the response with our servers. This only takes a moment.
          </p>
        </div>

        <div className="auth-state" role="status" aria-live="polite">
          <span className="auth-state__icon auth-callback__icon" aria-hidden="true">
            <ShieldCheck size={22} />
          </span>
          <h3 className="auth-state__title">Processing your sign-in</h3>
          <p className="auth-state__text">
            Keep this tab open. No credentials are handled on this page.
          </p>
        </div>
      </div>
    )
  }

  if (errorCode === null) {
    return (
      <div className="auth-card auth-callback anim-scale-in">
        <div className="auth-card__head">
          <p className="auth-card__eyebrow">External sign-in</p>
          <h2 className="auth-card__title">You are signed in</h2>
          <p className="auth-card__subtitle">
            Google sign-in completed. Taking you to your workspace.
          </p>
        </div>

        <div className="auth-state" role="status">
          <span className="auth-state__icon auth-state__icon--success" aria-hidden="true">
            <Check size={22} />
          </span>
          <h3 className="auth-state__title">Taking you to your workspace</h3>
          <p className="auth-state__text">You can continue straight away&hellip;</p>
          <button
            type="button"
            className="btn btn--primary auth-cta"
            onClick={() => navigate(handoffPath, { replace: true })}
          >
            <LogIn size={16} className="auth-cta__icon" aria-hidden="true" />
            Continue now
          </button>
        </div>
      </div>
    )
  }

  const isUnavailable = errorCode === OAUTH_ERROR.BACKEND_UNAVAILABLE
  const offersRegistration =
    errorCode === OAUTH_ERROR.CANCELED || errorCode === OAUTH_ERROR.NOT_AUTHORIZED

  return (
    <div className="auth-card auth-callback anim-scale-in">
      <div className="auth-card__head">
        <p className="auth-card__eyebrow">External sign-in</p>
        <h2 className="auth-card__title">{details.title}</h2>
        <p className="auth-card__subtitle">{details.message}</p>
      </div>

      <div className="auth-state">
        <span
          className={`auth-state__icon ${isUnavailable ? 'auth-callback__icon' : 'auth-state__icon--danger'}`}
          aria-hidden="true"
        >
          {isUnavailable ? <UserRound size={22} /> : <AlertCircle size={22} />}
        </span>
        <h3 className="auth-state__title">What you can do next</h3>
        <p className="auth-state__text">{details.hint}</p>

        {isUnavailable ? (
          <p className="auth-callback__note" role="note">
            {OAUTH_BACKEND_UNAVAILABLE_MESSAGE}
          </p>
        ) : null}

        <div className="auth-callback__actions">
          <Link to="/login" className="btn btn--primary auth-cta">
            <LogIn size={16} className="auth-cta__icon" aria-hidden="true" />
            Back to sign in
          </Link>
          {offersRegistration ? (
            <Link to="/register" className="btn btn--outline">
              Create an account
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default OAuthCallbackPage
