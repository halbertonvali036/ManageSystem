import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthContext from '@/context/AuthContext'
import authService from '@/services/authService'
import { AUTH_SESSION_EXPIRED_EVENT } from '@/services/authSession'
import notificationStore from '@/stores/notificationStore'
import { isKnownRole } from '@/utils/roles'

function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authService.getStoredSession())
  const navigate = useNavigate()

  const login = useCallback(async (credentials, options) => {
    const nextSession = await authService.login(credentials, options)
    setSession(nextSession)
    return nextSession
  }, [])

  /**
   * Adopts a session the backend established during an external-auth callback.
   *
   * The session is held in memory only. Provider tokens, codes and the backend
   * session cookie stay server-side — this never writes an OAuth credential to
   * localStorage or sessionStorage, and the backend remains the only authority
   * for who is signed in.
   */
  const adoptExternalSession = useCallback((nextSession) => {
    if (!nextSession?.token || !isKnownRole(nextSession?.user?.role)) {
      return false
    }
    setSession({
      token: nextSession.token,
      user: nextSession.user,
    })
    return true
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    // Loaded notifications belong to the account that just signed out.
    notificationStore.reset()
    setSession(null)
  }, [])

  /**
   * A 401 from an authenticated request clears the stored session in the HTTP
   * client and dispatches this event. Routing lives here so the expired-session
   * page is reached the same way as the rest of the app's public routes.
   */
  useEffect(() => {
    const handleSessionExpired = () => {
      authService.logout()
      notificationStore.reset()
      setSession(null)
      navigate('/session-expired', { replace: true })
    }
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired)
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired)
  }, [navigate])

  /**
   * Adopts values the backend confirmed when the account was updated.
   *
   * This never stores anything by itself: it is called only after a real write
   * succeeds, so a value here is one the backend has already accepted. Writing
   * to the stored session is left alone — the backend stays the authority, and
   * a reload re-reads whatever session it hands back.
   */
  const updateUser = useCallback((partial) => {
    if (!partial) {
      return
    }
    setSession((current) => {
      if (!current?.user) {
        return current
      }
      return { ...current, user: { ...current.user, ...partial } }
    })
  }, [])

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session?.token) && isKnownRole(session?.user?.role),
      login,
      logout,
      adoptExternalSession,
      updateUser,
    }),
    [session, login, logout, adoptExternalSession, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
