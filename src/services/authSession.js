import { isKnownRole } from '@/utils/roles'

/**
 * Neutral auth-session storage.
 *
 * Both `authService` and `httpClient` need to read the signed-in session. Keeping
 * that read here — instead of importing the service into the client — avoids a
 * circular dependency (`authService` -> `httpClient` -> `authService`).
 *
 * This module must stay dependency-light: config, services and React are
 * deliberately out of scope.
 */
export const AUTH_SESSION_STORAGE_KEY = 'managesystem-auth-session'

/** Fired when the backend rejects an authenticated request with a 401. */
export const AUTH_SESSION_EXPIRED_EVENT = 'managesystem:auth-session-expired'

/**
 * Public auth endpoints never receive the stored token and never trigger the
 * session-expired flow. A failed sign-in is a bad credential, not an expired
 * session.
 */
export const PUBLIC_AUTH_PATHS = Object.freeze([
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/resend-verification',
])

/**
 * OAuth start and callback endpoints are public, but the account-linking
 * endpoint is not: linking happens for a signed-in user, so it must keep the
 * bearer token and must be able to expire the session on a 401.
 */
const PUBLIC_OAUTH_PATTERN = /^\/auth\/oauth\/[^/]+\/(?:start|callback)$/

const getStorage = (name) => {
  try {
    return typeof window !== 'undefined' ? window[name] : null
  } catch {
    return null
  }
}

/**
 * Whether `path` is one of the public auth endpoints above.
 *
 * The comparison uses the pathname only, so a query string or a base URL cannot
 * turn a public endpoint into an authenticated one.
 */
export const isPublicAuthPath = (path) => {
  if (typeof path !== 'string' || !path) {
    return false
  }
  let pathname = path
  try {
    pathname = new URL(path, 'http://local').pathname
  } catch {
    pathname = path.split('?')[0]
  }
  const normalized = pathname.replace(/\/+$/, '') || '/'
  return (
    PUBLIC_AUTH_PATHS.includes(normalized) ||
    PUBLIC_OAUTH_PATTERN.test(normalized)
  )
}

export const clearStoredSession = () => {
  getStorage('sessionStorage')?.removeItem(AUTH_SESSION_STORAGE_KEY)
  getStorage('localStorage')?.removeItem(AUTH_SESSION_STORAGE_KEY)
}

/**
 * Reads the stored session, preferring sessionStorage and falling back to
 * localStorage. An unusable record is discarded rather than trusted.
 */
export const readStoredSession = () => {
  try {
    const raw =
      getStorage('sessionStorage')?.getItem(AUTH_SESSION_STORAGE_KEY) ??
      getStorage('localStorage')?.getItem(AUTH_SESSION_STORAGE_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    if (!session?.token || !isKnownRole(session?.user?.role)) {
      clearStoredSession()
      return null
    }
    return session
  } catch {
    return null
  }
}

/** The token to attach to outgoing requests, or null when signed out. */
export const getStoredSessionToken = () => readStoredSession()?.token ?? null

/**
 * Tells the app that an authenticated request was rejected. The provider owns
 * the redirect so the notification and the route change happen together.
 */
export const notifySessionExpired = () => {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') {
    return
  }
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT))
}
