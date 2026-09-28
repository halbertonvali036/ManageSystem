import config from '@/config'
import { isKnownRole } from '@/utils/roles'
import httpClient, { BackendNotConnectedError, RequestError } from '@/services/httpClient'
import {
  EXTERNAL_AUTH_INTENT,
  getAuthorizationUrl,
  getOAuthErrorCode,
  isOAuthCallbackFailure,
  sanitizeReturnPath,
  toOAuthCallbackResult,
  OAUTH_ERROR,
  OAUTH_OUTCOME,
} from '@/models/externalAuth'

const MOCK_LOGIN_DELAY_MS = 600
const SESSION_STORAGE_KEY = 'managesystem-auth-session'
const AUTH_PATH = '/auth'

/*
 * Local development accounts.
 *
 * These are never displayed on a public screen: the public sign-in shows no
 * credentials and public registration creates no role. They exist so the
 * website-builder workspace can be exercised before the auth backend is
 * connected. Only /admin/login reads from this list by role, and it picks the
 * admin entry alone.
 */
export const DEMO_ACCOUNTS = Object.freeze(import.meta.env.DEV ? [
  {
    id: 'user-1',
    name: 'Demo User',
    email: 'user@demo.com',
    password: 'user123',
    role: 'user',
  },
  {
    id: 'admin-1',
    name: 'System Admin',
    email: 'admin@demo.com',
    password: 'admin123',
    role: 'admin',
  },
] : [])

const MOCK_TOKEN = 'mock-jwt-token'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const normalizeEmail = (email) => email.trim().toLowerCase()

const readStoredSession = () => {
  const raw =
    sessionStorage.getItem(SESSION_STORAGE_KEY) ??
    localStorage.getItem(SESSION_STORAGE_KEY)
  if (!raw) {
    return null
  }
  try {
    const session = JSON.parse(raw)
    if (!session?.token || !isKnownRole(session?.user?.role) ||
      (!import.meta.env.DEV && session.token === MOCK_TOKEN)) {
      clearStoredSession()
      return null
    }
    return session
  } catch {
    return null
  }
}

const clearStoredSession = () => {
  sessionStorage.removeItem(SESSION_STORAGE_KEY)
  localStorage.removeItem(SESSION_STORAGE_KEY)
}

// Recovery mutations deliberately refuse to run without a backend.
// They must not simulate successful password changes or email sends.

const ensureBackendConnection = (message) => {
  if (!config.api.baseUrl) {
    throw new BackendNotConnectedError(message)
  }
}

const forgotPassword = async (email) => {
  ensureBackendConnection(
    'Password recovery is unavailable until the backend is connected.',
  )
  await httpClient.post(`${AUTH_PATH}/forgot-password`, { email })
}

const resetPassword = async (token, newPassword) => {
  ensureBackendConnection(
    'Password reset is unavailable until the backend is connected.',
  )
  await httpClient.post(`${AUTH_PATH}/reset-password`, {
    token,
    newPassword,
  })
}

// Registration stays unavailable until the backend contract and role policy
// are defined. Keeping this entry point here avoids reporting a false success.
const register = async (_payload) => {
  throw new BackendNotConnectedError(
    'Account creation is unavailable until registration is configured.',
  )
}

// Resending a verification email is frontend-ready only. Without a connected
// backend it must never pretend the email was sent.
const resendVerification = async (email) => {
  ensureBackendConnection(
    'The verification email could not be sent because the backend is unavailable.',
  )
  await httpClient.post(`${AUTH_PATH}/resend-verification`, { email })
}

const login = async (credentials, { remember = false, restrictedRole = null } = {}) => {
  let session
  if (config.api.baseUrl) {
    const response = await httpClient.post(`${AUTH_PATH}/login`, {
      email: normalizeEmail(credentials.email), password: credentials.password,
    })
    session = response?.data ?? response
  } else if (import.meta.env.DEV) {
    await delay(MOCK_LOGIN_DELAY_MS)
    const account = DEMO_ACCOUNTS.find((item) => item.email === normalizeEmail(credentials.email))
    if (!account || credentials.password !== account.password) {
      throw new RequestError('Invalid email or password.', { code: 'INVALID_CREDENTIALS' })
    }
    session = { token: MOCK_TOKEN, user: {
      id: account.id, name: account.name, email: account.email, role: account.role,
    } }
  } else {
    throw new BackendNotConnectedError('Sign-in requires a connected authentication backend.')
  }
  if (!session?.token || !isKnownRole(session?.user?.role) ||
    (restrictedRole && session.user.role !== restrictedRole)) {
    throw new RequestError('This account cannot access this sign-in area.', { code: 'ROLE_NOT_ALLOWED' })
  }
  clearStoredSession()
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  return session
}

const logout = () => {
  clearStoredSession()
}

/* ── External authentication (Google) ──────────────────────── */
/*
 * Frontend readiness only. The browser never builds an OAuth URL, never holds
 * a client secret, never generates a token and never writes provider
 * credentials to storage. It asks the backend to start the flow, forwards the
 * three callback values the backend needs, and renders the outcome.
 *
 * Without a connected backend every method below throws
 * BackendNotConnectedError with copy that tells the user the integration is
 * still pending. None of them can report a successful sign-in or a linked
 * account on their own.
 */

const EXTERNAL_AUTH_UNAVAILABLE_MESSAGE =
  'Google sign-in is still being connected to the backend, so the flow cannot start. Use your email and password for now.'

const isExternalAuthAvailable = () => Boolean(config.api.baseUrl)

const ensureExternalAuthConnection = () => {
  ensureBackendConnection(EXTERNAL_AUTH_UNAVAILABLE_MESSAGE)
}

const readIntent = (intent) =>
  Object.values(EXTERNAL_AUTH_INTENT).includes(intent)
    ? intent
    : EXTERNAL_AUTH_INTENT.LOGIN

/**
 * Asks the backend to start Google sign-in.
 *
 * The backend owns the client id, the client secret, the state/PKCE pair and
 * the redirect allow-list. It answers with the authorization URL to open, and
 * the UI redirects there verbatim. `intent` and `returnTo` are routing hints
 * only — the backend still decides which account and role the caller ends up
 * with, so no role can be requested through this call.
 */
const beginGoogleLogin = async ({ intent, returnTo } = {}) => {
  ensureExternalAuthConnection()

  const data = await httpClient.post(`${AUTH_PATH}/oauth/google/start`, {
    intent: readIntent(intent),
    returnTo: sanitizeReturnPath(returnTo),
  })

  const authorizationUrl = getAuthorizationUrl(data)
  if (!authorizationUrl) {
    throw new RequestError(
      'The sign-in service did not return a valid Google authorization request. Please try again.',
      { status: null, data: data ?? null, code: OAUTH_ERROR.INVALID_REQUEST },
    )
  }

  return { authorizationUrl }
}

/**
 * Completes Google sign-in from the callback route.
 *
 * Only `code`, `state` and `error` are accepted; provider error descriptions are
 * ignored. The response is normalized so the UI can hand off a real session or
 * show a friendly error, and a response that confirms neither is reported as
 * incomplete rather than as a success.
 */
const handleOAuthCallback = async (params) => {
  ensureExternalAuthConnection()

  if (isOAuthCallbackFailure(params)) {
    return { outcome: OAUTH_OUTCOME.FAILED, session: null, errorCode: getOAuthErrorCode(params?.error) }
  }

  return toOAuthCallbackResult(
    await httpClient.post(`${AUTH_PATH}/oauth/google/callback`, {
      code: params?.code ?? null,
      state: params?.state ?? null,
    }),
  )
}

/**
 * Starts Google account linking for the signed-in user.
 *
 * The backend must re-authenticate the caller and confirm ownership of the
 * address before anything is linked. This method only requests the start and
 * returns the authorization URL; it never links, merges or unlinks anything.
 */
const linkGoogleAccount = async ({ returnTo } = {}) => {
  ensureExternalAuthConnection()

  const data = await httpClient.post(`${AUTH_PATH}/oauth/google/link`, {
    intent: EXTERNAL_AUTH_INTENT.LINK,
    returnTo: sanitizeReturnPath(returnTo),
  })

  const authorizationUrl = getAuthorizationUrl(data)
  if (!authorizationUrl) {
    throw new RequestError(
      'The account service did not return a valid Google authorization request. Please try again.',
      { status: null, data: data ?? null, code: OAUTH_ERROR.INVALID_REQUEST },
    )
  }

  return { authorizationUrl }
}

const authService = {
  login,
  logout,
  forgotPassword,
  resetPassword,
  register,
  resendVerification,
  getStoredSession: readStoredSession,
  clearStoredSession,
  isExternalAuthAvailable,
  beginGoogleLogin,
  handleOAuthCallback,
  linkGoogleAccount,
}

export default authService
