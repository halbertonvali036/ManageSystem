import { useCallback, useEffect, useRef, useState } from 'react'
import {
  toSecurityEvent,
  toSecurityOverview,
  toSession,
} from '@/models/accountSecurity'
import accountSecurityService from '@/services/accountSecurityService'
import { BackendNotConnectedError } from '@/services/httpClient'

const ACTION_UNAVAILABLE_MESSAGE =
  'Account security is not connected yet. This action cannot be completed from this page.'

const getActionErrorMessage = (error) => {
  if (error instanceof BackendNotConnectedError) {
    return ACTION_UNAVAILABLE_MESSAGE
  }
  return error?.message ?? 'The security action could not be completed.'
}

const normalizeSessions = (records) => records.map(toSession).filter(Boolean)

const normalizeEvents = (records) => records.map(toSecurityEvent).filter(Boolean)

/**
 * Reads the signed-in account's security state.
 *
 * Until the account/security backend exists the service resolves safe empty
 * values, so this hook reports `backendUnavailable` and the page renders honest
 * unavailable / empty states. Actions are exposed for the future integration
 * but never simulate a successful password change, verification email, session
 * revocation, two-factor change or QR pairing.
 */
function useAccountSecurity() {
  const [overview, setOverview] = useState(null)
  const [sessions, setSessions] = useState([])
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [backendUnavailable, setBackendUnavailable] = useState(false)
  const [actionError, setActionError] = useState(null)
  const [errorAction, setErrorAction] = useState(null)
  const [pendingAction, setPendingAction] = useState(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const fetchSecurityData = useCallback(
    () =>
      Promise.all([
        accountSecurityService.getSecurityOverview(),
        accountSecurityService.getSessions(),
        accountSecurityService.getSecurityActivity(),
      ])
        .then(([overviewData, sessionData, eventData]) => {
          if (!mountedRef.current) {
            return
          }
          setOverview(toSecurityOverview(overviewData))
          setSessions(normalizeSessions(sessionData))
          setEvents(normalizeEvents(eventData))
          setBackendUnavailable(false)
        })
        .catch((error) => {
          if (!mountedRef.current) {
            return
          }
          setOverview(null)
          setSessions([])
          setEvents([])
          if (error instanceof BackendNotConnectedError) {
            setBackendUnavailable(true)
            return
          }
          setLoadError(error?.message ?? 'Could not load account security information.')
        })
        .finally(() => {
          if (mountedRef.current) {
            setIsLoading(false)
          }
        }),
    [],
  )

  useEffect(() => {
    fetchSecurityData()
  }, [fetchSecurityData])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setLoadError(null)
    fetchSecurityData()
  }, [fetchSecurityData])

  /**
   * Runs one security mutation and refreshes the read-only state afterwards.
   * No row is ever removed locally — a revoked session or refreshed status only
   * changes when the backend confirms it.
   */
  const runAction = useCallback(
    async (name, action, { refresh = true } = {}) => {
      setPendingAction(name)
      setActionError(null)
      setErrorAction(null)
      try {
        const result = await action()
        if (refresh && mountedRef.current) {
          await fetchSecurityData()
        }
        return result ?? true
      } catch (error) {
        if (mountedRef.current) {
          setErrorAction(name)
          setActionError(getActionErrorMessage(error))
        }
        return false
      } finally {
        if (mountedRef.current) {
          setPendingAction(null)
        }
      }
    },
    [fetchSecurityData],
  )

  const changePassword = useCallback(
    (payload) => runAction('password', () => accountSecurityService.changePassword(payload)),
    [runAction],
  )

  const resendVerification = useCallback(
    () => runAction('verification', () => accountSecurityService.resendVerificationEmail()),
    [runAction],
  )

  const revokeSession = useCallback(
    (sessionId) => runAction(`session:${sessionId}`, () => accountSecurityService.revokeSession(sessionId)),
    [runAction],
  )

  const revokeOtherSessions = useCallback(
    () => runAction('sessions', () => accountSecurityService.revokeOtherSessions()),
    [runAction],
  )

  const beginTwoFactorSetup = useCallback(
    () =>
      runAction(
        'two-factor-setup',
        () => accountSecurityService.beginTwoFactorSetup(),
        { refresh: false },
      ),
    [runAction],
  )

  const confirmTwoFactorSetup = useCallback(
    (code) =>
      runAction('two-factor-confirm', () => accountSecurityService.confirmTwoFactorSetup(code)),
    [runAction],
  )

  const disableTwoFactor = useCallback(
    (code) => runAction('two-factor-disable', () => accountSecurityService.disableTwoFactor(code)),
    [runAction],
  )

  const canManageSecurity = Boolean(overview) && !backendUnavailable
  const hasOtherSessions = sessions.some((session) => !session.isCurrent)

  return {
    overview,
    sessions,
    events,
    canManageSecurity,
    hasOtherSessions,
    isLoading,
    loadError,
    backendUnavailable,
    actionError,
    errorAction,
    pendingAction,
    refetch,
    changePassword,
    resendVerification,
    revokeSession,
    revokeOtherSessions,
    beginTwoFactorSetup,
    confirmTwoFactorSetup,
    disableTwoFactor,
  }
}

export default useAccountSecurity
