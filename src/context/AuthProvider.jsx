import { useCallback, useMemo, useState } from 'react'
import AuthContext from '@/context/AuthContext'
import authService from '@/services/authService'
import notificationStore from '@/stores/notificationStore'
import { isKnownRole } from '@/utils/roles'

function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authService.getStoredSession())

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

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session?.token) && isKnownRole(session?.user?.role),
      login,
      logout,
      adoptExternalSession,
    }),
    [session, login, logout, adoptExternalSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
