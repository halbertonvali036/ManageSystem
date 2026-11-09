import config from '@/config'
import { isKnownRole } from '@/utils/roles'
import httpClient, { BackendNotConnectedError, RequestError } from '@/services/httpClient'
import templateService from '@/services/templateService'
import { clearCreateWizardState } from '@/services/createWizardStore'
import {
  AUTH_SESSION_STORAGE_KEY,
  clearStoredSession,
  readStoredSession,
} from '@/services/authSession'
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

const SESSION_STORAGE_KEY = AUTH_SESSION_STORAGE_KEY
const AUTH_PATH = '/auth'

const normalizeEmail = (email) => email.trim().toLowerCase()

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
  const response = await httpClient.post(`${AUTH_PATH}/forgot-password`, { email })
  return response?.data ?? response
}

const resetPassword = async (token, newPassword) => {
  ensureBackendConnection(
    'Password reset is unavailable until the backend is connected.',
  )
  const response = await httpClient.post(`${AUTH_PATH}/reset-password`, {
    token,
    newPassword,
  })
  return response?.data ?? response
}

// Registration is handled entirely by the backend. No role is sent, so a
// public visitor can only ever create the account type the server provisions.
// The backend contract uses `name` and `surname`; the form's first/last name
// fields are mapped to those keys by the caller.
const register = async (payload) => {
  ensureBackendConnection(
    'Account creation is unavailable until the backend is connected.',
  )
  const response = await httpClient.post(`${AUTH_PATH}/register`, {
    name: payload.name?.trim(),
    surname: payload.surname?.trim(),
    email: normalizeEmail(payload.email),
    password: payload.password,
  })
  return response?.data ?? response
}

// Email verification is handled entirely by the backend. The frontend only
// forwards the token from the emailed link; it never decides whether the token
// is valid or marks an account as verified on its own.
const verifyEmail = async (token) => {
  ensureBackendConnection(
    'Email verification is unavailable until the backend is connected.',
  )
  await httpClient.post(`${AUTH_PATH}/verify-email`, { token })
}

// Resending a verification email is frontend-ready only. Without a connected
// backend it must never pretend the email was sent. The backend answers 200
// whether or not an account exists, so the UI must keep its response neutral.
const resendVerification = async (email) => {
  ensureBackendConnection(
    'The verification email could not be sent because the backend is unavailable.',
  )
  await httpClient.post(`${AUTH_PATH}/resend-verification`, { email })
}

const login = async (credentials, { remember = false, restrictedRole = null } = {}) => {
  if (!config.api.baseUrl) {
    throw new BackendNotConnectedError('Sign-in requires a connected authentication backend.')
  }

  const response = await httpClient.post(`${AUTH_PATH}/login`, {
    email: normalizeEmail(credentials.email), password: credentials.password,
  })
  const session = response?.data ?? response

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
  // The template catalogue belongs to the signed-in session.
  templateService.clearTemplateCache()
  // A half-finished create wizard belongs to the session too: it must not
  // restore for whoever signs in next in this tab.
  clearCreateWizardState()
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
  verifyEmail,
  resendVerification,
  getStoredSession: readStoredSession,
  clearStoredSession,
  isExternalAuthAvailable,
  beginGoogleLogin,
  handleOAuthCallback,
  linkGoogleAccount,
}

export default authService
