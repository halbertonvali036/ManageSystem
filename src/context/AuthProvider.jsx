import { useCallback, useMemo, useState } from 'react'
import AuthContext from '@/context/AuthContext'
import authService from '@/services/authService'

function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authService.getStoredSession())

  const login = useCallback(async (credentials, options) => {
    const nextSession = await authService.login(credentials, options)
    setSession(nextSession)
    return nextSession
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session?.token),
      login,
      logout,
    }),
    [session, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider