import { useCallback, useEffect, useRef, useState } from 'react'
import accountSecurityService from '@/services/accountSecurityService'
import { BackendNotConnectedError } from '@/services/httpClient'
import {
  getQrLoginView,
  getRemainingSeconds,
  mergeQrLoginSession,
  QR_LOGIN_VIEW,
  toQrLoginSession,
} from '@/models/qrLogin'

const CREATE_ERROR =
  'A QR sign-in session could not be requested. Please try again or sign in with your email and password.'
const UNAVAILABLE_ERROR =
  'QR sign-in is not connected yet. No pairing session can be issued, so no code is shown. Email and password sign-in is unaffected.'
const STATUS_ERROR =
  'The status of this QR sign-in could not be read. Check the code again or request a new one.'
const CANCEL_ERROR = 'This QR sign-in could not be canceled. It expires on its own shortly.'

/** Re-render cadence for the expiry readout. UI only — it is not a backend poll. */
const TICK_MS = 1000

/**
 * QR sign-in state for the public `/login/qr` page.
 *
 * Every value shown comes from the backend: the pairing session, its status and
 * its expiry. The hook never fabricates a code, never treats a local click as an
 * approval and never starts a session. Without the backend it reports
 * `isAvailable: false` and the page shows the integration-pending state.
 *
 * Status is refreshed only when the user asks for it. A real deployment can
 * drive this hook from a backend poll, server-sent event or websocket by calling
 * `refreshStatus()`; no transport is assumed or implemented here.
 */
function useQrLoginSession() {
  const [session, setSession] = useState(null)
  const [view, setView] = useState(QR_LOGIN_VIEW.IDLE)
  const [isCreating, setIsCreating] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [error, setError] = useState(null)
  const [now, setNow] = useState(() => Date.now())
  const mountedRef = useRef(true)

  const isAvailable = accountSecurityService.isBackendConnected()

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const applySession = useCallback((nextSession, nextView) => {
    if (!mountedRef.current) {
      return
    }
    setSession(nextSession)
    setView(nextView)
    setNow(Date.now())
  }, [])

  const create = useCallback(async () => {
    if (isCreating) {
      return false
    }
    setIsCreating(true)
    setError(null)
    applySession(null, QR_LOGIN_VIEW.PREPARING)
    try {
      const data = await accountSecurityService.createQrLoginSession()
      const nextSession = toQrLoginSession(data)
      if (!nextSession) {
        applySession(null, QR_LOGIN_VIEW.ERROR)
        setError(CREATE_ERROR)
        return false
      }
      setSession(nextSession)
      setView(resolveView(nextSession))
      setNow(Date.now())
      return true
    } catch (requestError) {
      const unavailable = requestError instanceof BackendNotConnectedError
      applySession(null, unavailable ? QR_LOGIN_VIEW.UNAVAILABLE : QR_LOGIN_VIEW.ERROR)
      setError(
        unavailable ? UNAVAILABLE_ERROR : (requestError.message ?? CREATE_ERROR)
      )
      return false
    } finally {
      if (mountedRef.current) {
        setIsCreating(false)
      }
    }
  }, [applySession, isCreating])

  const refreshStatus = useCallback(async () => {
    const sessionId = session?.sessionId
    if (!sessionId || isRefreshing) {
      return false
    }
    setIsRefreshing(true)
    setError(null)
    try {
      const data = await accountSecurityService.getQrLoginStatus(sessionId)
      const nextSession = mergeQrLoginSession(session, data)
      setSession(nextSession)
      setView(resolveView(nextSession))
      setNow(Date.now())
      return true
    } catch (requestError) {
      setError(requestError.message ?? STATUS_ERROR)
      return false
    } finally {
      if (mountedRef.current) {
        setIsRefreshing(false)
      }
    }
  }, [isRefreshing, session])

  const cancel = useCallback(async () => {
    const sessionId = session?.sessionId
    if (!sessionId || isCancelling) {
      return false
    }
    setIsCancelling(true)
    setError(null)
    try {
      await accountSecurityService.cancelQrLoginSession(sessionId)
      applySession(null, QR_LOGIN_VIEW.CANCELED)
      return true
    } catch (requestError) {
      setError(requestError.message ?? CANCEL_ERROR)
      return false
    } finally {
      if (mountedRef.current) {
        setIsCancelling(false)
      }
    }
  }, [applySession, isCancelling, session])

  const reset = useCallback(() => {
    applySession(null, QR_LOGIN_VIEW.IDLE)
    setError(null)
  }, [applySession])

  // Expiry readout. Purely local clock arithmetic over a backend timestamp.
  const remainingSeconds = session?.expiresAt ? getRemainingSeconds(session.expiresAt, now) : null
  const hasLiveCountdown = remainingSeconds !== null && remainingSeconds > 0

  // The backend's expiry decides when the code dies, so the page reaches the
  // expired state on the clock alone — no request and no fabricated status.
  const currentView = remainingSeconds === 0 ? QR_LOGIN_VIEW.EXPIRED : view

  useEffect(() => {
    if (!hasLiveCountdown) {
      return undefined
    }
    const timer = window.setInterval(() => setNow(Date.now()), TICK_MS)
    return () => window.clearInterval(timer)
  }, [hasLiveCountdown])

  return {
    session,
    view: currentView,
    isAvailable,
    isBusy: isCreating || isRefreshing || isCancelling,
    isCreating,
    isRefreshing,
    isCancelling,
    error,
    remainingSeconds,
    create,
    refreshStatus,
    cancel,
    reset,
  }
}

/** View for a session: the model owns the state machine, expiry wins over it. */
function resolveView(nextSession) {
  if (nextSession && getRemainingSeconds(nextSession.expiresAt) === 0) {
    return QR_LOGIN_VIEW.EXPIRED
  }
  return getQrLoginView(nextSession)
}

export default useQrLoginSession
