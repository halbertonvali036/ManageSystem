/**
 * External authentication (Google) domain model.
 *
 * Rules enforced here:
 * - The browser never builds a provider URL, never holds a client secret and
 *   never mints a token. It only forwards a start request to the backend and
 *   renders the result.
 * - Callback query values are read defensively: only `code`, `state` and
 *   `error` are collected. Provider error descriptions are deliberately ignored
 *   so raw provider text can never reach the UI.
 * - Provider and authorization errors are mapped to a small, stable vocabulary
 *   of friendly messages. Technical details stay on the server.
 * - Only Google is modelled. Other providers are not listed, so no UI can
 *   offer a sign-in option that was never planned.
 */

export const EXTERNAL_AUTH_PROVIDER = Object.freeze({
  GOOGLE: 'google',
})

export const EXTERNAL_AUTH_PROVIDERS = Object.freeze([
  EXTERNAL_AUTH_PROVIDER.GOOGLE,
])

export const EXTERNAL_AUTH_PROVIDER_LABELS = Object.freeze({
  [EXTERNAL_AUTH_PROVIDER.GOOGLE]: 'Google',
})

/** Where the flow was started from. Sent to the backend for auditing only. */
export const EXTERNAL_AUTH_INTENT = Object.freeze({
  LOGIN: 'login',
  REGISTER: 'register',
  LINK: 'link',
})

export const EXTERNAL_AUTH_INTENTS = Object.freeze([
  EXTERNAL_AUTH_INTENT.LOGIN,
  EXTERNAL_AUTH_INTENT.REGISTER,
  EXTERNAL_AUTH_INTENT.LINK,
])

export const DEFAULT_EXTERNAL_AUTH_RETURN_PATH = '/login'

/* ── Error vocabulary ───────────────────────────────────────── */

export const OAUTH_ERROR = Object.freeze({
  CANCELED: 'oauth_canceled',
  NOT_AUTHORIZED: 'oauth_not_authorized',
  PROVIDER: 'oauth_provider_error',
  BACKEND_UNAVAILABLE: 'oauth_backend_unavailable',
  INVALID_REQUEST: 'oauth_invalid_request',
  SESSION_EXPIRED: 'oauth_session_expired',
  UNKNOWN: 'oauth_unknown_error',
})

/**
 * Friendly copy only. `hint` is the single next step shown to the user;
 * `technical` is never rendered and exists for logging on the server side.
 */
const OAUTH_ERROR_DETAILS = Object.freeze({
  [OAUTH_ERROR.CANCELED]: {
    title: 'Google sign-in was canceled.',
    message: 'Nothing was changed and no account was connected. You can try again whenever you are ready.',
    hint: 'Try Continue with Google again, or sign in with your email and password.',
    recoverable: true,
  },
  [OAUTH_ERROR.NOT_AUTHORIZED]: {
    title: 'This Google account is not authorized.',
    message: 'The address you chose is not linked to an account here, or it is not permitted to sign in yet.',
    hint: 'Sign in with your email and password, or ask your institution to authorize the address.',
    recoverable: true,
  },
  [OAUTH_ERROR.PROVIDER]: {
    title: 'Google could not complete the sign-in.',
    message: 'The provider returned an error before the sign-in finished.',
    hint: 'Wait a moment and try again. If it keeps happening, use your email and password.',
    recoverable: true,
  },
  [OAUTH_ERROR.BACKEND_UNAVAILABLE]: {
    title: 'Google sign-in is not available yet.',
    message: 'Sign-in with Google is still being connected to the backend, so the flow cannot start.',
    hint: 'Use your email and password for now. Nothing was signed in or stored.',
    recoverable: false,
  },
  [OAUTH_ERROR.INVALID_REQUEST]: {
    title: 'This sign-in request could not be completed.',
    message: 'The request was missing or no longer valid, so it was stopped safely.',
    hint: 'Start again from the sign-in page.',
    recoverable: true,
  },
  [OAUTH_ERROR.SESSION_EXPIRED]: {
    title: 'This sign-in attempt timed out.',
    message: 'The request took too long and expired before it was confirmed.',
    hint: 'Start again from the sign-in page.',
    recoverable: true,
  },
  [OAUTH_ERROR.UNKNOWN]: {
    title: 'Google sign-in could not be completed.',
    message: 'Something interrupted the flow before it finished.',
    hint: 'Try again, or sign in with your email and password.',
    recoverable: true,
  },
})

export const OAUTH_BACKEND_UNAVAILABLE_MESSAGE =
  OAUTH_ERROR_DETAILS[OAUTH_ERROR.BACKEND_UNAVAILABLE].message

/** Provider/backend error codes mapped onto the small UI vocabulary above. */
const UNKNOWN_PROVIDER_ERROR_ALIASES = Object.freeze({
  canceled: OAUTH_ERROR.CANCELED,
  cancelled: OAUTH_ERROR.CANCELED,
  user_cancelled: OAUTH_ERROR.CANCELED,
  user_canceled: OAUTH_ERROR.CANCELED,
  access_denied: OAUTH_ERROR.CANCELED,
  denied: OAUTH_ERROR.CANCELED,
  unauthorized: OAUTH_ERROR.NOT_AUTHORIZED,
  not_authorized: OAUTH_ERROR.NOT_AUTHORIZED,
  account_not_authorized: OAUTH_ERROR.NOT_AUTHORIZED,
  forbidden: OAUTH_ERROR.NOT_AUTHORIZED,
  account_not_eligible: OAUTH_ERROR.NOT_AUTHORIZED,
  provider_error: OAUTH_ERROR.PROVIDER,
  oauth_provider_error: OAUTH_ERROR.PROVIDER,
  google_error: OAUTH_ERROR.PROVIDER,
  server_error: OAUTH_ERROR.PROVIDER,
  temporarily_unavailable: OAUTH_ERROR.PROVIDER,
  backend_unavailable: OAUTH_ERROR.BACKEND_UNAVAILABLE,
  backend_not_connected: OAUTH_ERROR.BACKEND_UNAVAILABLE,
  not_connected: OAUTH_ERROR.BACKEND_UNAVAILABLE,
  service_unavailable: OAUTH_ERROR.BACKEND_UNAVAILABLE,
  network_error: OAUTH_ERROR.PROVIDER,
  invalid_request: OAUTH_ERROR.INVALID_REQUEST,
  invalid_state: OAUTH_ERROR.INVALID_REQUEST,
  state_mismatch: OAUTH_ERROR.INVALID_REQUEST,
  missing_code: OAUTH_ERROR.INVALID_REQUEST,
  invalid_grant: OAUTH_ERROR.INVALID_REQUEST,
  session_expired: OAUTH_ERROR.SESSION_EXPIRED,
  expired: OAUTH_ERROR.SESSION_EXPIRED,
  timeout: OAUTH_ERROR.SESSION_EXPIRED,
})

/** `true` only for values that are already part of the OAuth vocabulary. */
export const isOAuthErrorCode = (value) =>
  typeof value === 'string' && Object.hasOwn(OAUTH_ERROR_DETAILS, value)

export const getOAuthErrorCode = (value) => {
  if (!value) {
    return OAUTH_ERROR.UNKNOWN
  }
  if (Object.hasOwn(OAUTH_ERROR_DETAILS, value)) {
    return value
  }
  const normalized = String(value).trim().toLowerCase().replace(/[\s-]+/g, '_')
  if (Object.values(OAUTH_ERROR).includes(normalized)) {
    return normalized
  }
  return UNKNOWN_PROVIDER_ERROR_ALIASES[normalized] ?? OAUTH_ERROR.UNKNOWN
}

/** Title, message and next step for any error value. Never throws. */
export const getOAuthErrorDetails = (value) => {
  const code = getOAuthErrorCode(value)
  return { code, ...OAUTH_ERROR_DETAILS[code] }
}

/* ── Callback parameters ───────────────────────────────────── */

const readParam = (params, key) => {
  const value = params?.[key]
  if (typeof value !== 'string') {
    return null
  }
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

/**
 * Collects the only three callback values the frontend is allowed to forward:
 * the authorization code, the anti-forgery state and an error code. Anything
 * else (including provider error descriptions) is ignored on purpose.
 */
export const toOAuthCallbackParams = (search) => {
  const params =
    typeof search === 'string' ? new URLSearchParams(search) : (search ?? null)
  return {
    code: readParam(params, 'code'),
    state: readParam(params, 'state'),
    error: readParam(params, 'error'),
  }
}

/** True when the provider sent an error instead of an authorization code. */
export const isOAuthCallbackFailure = (params) => Boolean(params?.error)

/* ── Return path safety ────────────────────────────────────── */

const ABSOLUTE_PATH = /^\/(?!\/)[A-Za-z0-9\-._~!$&'()*+,;=:@%/?#[\]]*$/

/**
 * Only same-origin absolute paths survive. Protocol-relative (`//evil.test`),
 * scheme-bearing and relative values fall back to the default, so an attacker
 * cannot turn the post-sign-in redirect into an off-site jump.
 */
export const sanitizeReturnPath = (value, fallback = DEFAULT_EXTERNAL_AUTH_RETURN_PATH) => {
  if (typeof value !== 'string') {
    return fallback
  }
  const trimmed = value.trim()
  if (!ABSOLUTE_PATH.test(trimmed)) {
    return fallback
  }
  return trimmed
}

/* ── Backend response normalization ────────────────────────── */

const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== ''

const readUser = (source) => {
  const user = source?.user ?? source?.account
  if (!user || typeof user !== 'object') {
    return null
  }
  const id = user.id ?? user.userId ?? user.user_id
  const name = user.name ?? user.fullName ?? user.displayName
  const email = user.email
  if (!isNonEmptyString(email)) {
    return null
  }
  return {
    id: id === null || id === undefined ? null : String(id),
    name: isNonEmptyString(name) ? name : null,
    email: email.trim().toLowerCase(),
    role: isNonEmptyString(user.role) ? user.role.trim().toLowerCase() : null,
  }
}

/** A session is only real when the backend sent both a token and a user. */
export const toSessionPayload = (data) => {
  const source = data?.session ?? data
  if (!source || typeof source !== 'object') {
    return null
  }
  const token = source.token ?? source.accessToken ?? source.access_token
  const user = readUser(source)
  if (!isNonEmptyString(token) || !user) {
    return null
  }
  return { token: token.trim(), user }
}

export const OAUTH_OUTCOME = Object.freeze({
  AUTHENTICATED: 'authenticated',
  FAILED: 'failed',
  INCOMPLETE: 'incomplete',
})

/**
 * Maps the backend callback response.
 *
 * Only two things are accepted: a real session (handoff to the role-aware
 * router) or an error. Anything else resolves to `incomplete`, so the UI never
 * claims a sign-in that the backend did not confirm.
 */
export const toOAuthCallbackResult = (data) => {
  if (!data || typeof data !== 'object') {
    return {
      outcome: OAUTH_OUTCOME.INCOMPLETE,
      session: null,
      errorCode: null,
      returnTo: null,
    }
  }
  const errorValue = data.error ?? data.errorCode ?? data.error_code
  if (errorValue) {
    return {
      outcome: OAUTH_OUTCOME.FAILED,
      session: null,
      errorCode: getOAuthErrorCode(errorValue),
      returnTo: null,
    }
  }
  const session = toSessionPayload(data)
  // The backend may echo where the user was heading before the flow started
  // (for example back to Account & Security after linking). It is sanitized to
  // a same-origin path first, so a crafted value cannot bounce the user off-site.
  const returnTo = sanitizeReturnPath(
    data.returnTo ?? data.return_to ?? data.redirectTo,
    null,
  )
  if (session) {
    return {
      outcome: OAUTH_OUTCOME.AUTHENTICATED,
      session,
      errorCode: null,
      returnTo,
    }
  }
  return {
    outcome: OAUTH_OUTCOME.INCOMPLETE,
    session: null,
    errorCode: null,
    returnTo: null,
  }
}

/* ── Authorization start response ──────────────────────────── */

const AUTHORIZATION_URL_HOSTS = Object.freeze([
  'accounts.google.com',
  'accounts.google.co.in',
  'accounts.google.co.uk',
  'accounts.google.ca',
  'accounts.google.com.au',
  'accounts.google.de',
  'accounts.google.fr',
  'accounts.google.co.jp',
  'accounts.google.com.br',
  'accounts.google.nl',
  'accounts.google.es',
  'accounts.google.it',
  'accounts.google.ie',
  'accounts.google.co.za',
  'accounts.google.com.sg',
  'accounts.google.ae',
  'accounts.google.com.tr',
])

/**
 * Validates the authorization URL the backend handed back. Only Google's own
 * hosts are accepted, so a misconfigured or tampered response cannot turn the
 * start action into a redirect somewhere else. The URL is never assembled here.
 */
export const getAuthorizationUrl = (data) => {
  const value = data?.authorizationUrl ?? data?.authorization_url ?? data?.url
  if (!isNonEmptyString(value)) {
    return null
  }
  let parsed
  try {
    parsed = new URL(value.trim())
  } catch {
    return null
  }
  if (parsed.protocol !== 'https:') {
    return null
  }
  if (!AUTHORIZATION_URL_HOSTS.includes(parsed.hostname.toLowerCase())) {
    return null
  }
  return parsed.toString()
}

/* ── Connected accounts ────────────────────────────────────── */

export const CONNECTED_ACCOUNT_STATUS = Object.freeze({
  CONNECTED: 'connected',
  NOT_CONNECTED: 'not_connected',
})

export const getExternalAuthProvider = (value) => {
  if (typeof value !== 'string') {
    return null
  }
  const normalized = value.trim().toLowerCase()
  return EXTERNAL_AUTH_PROVIDERS.includes(normalized) ? normalized : null
}

export const getExternalAuthProviderLabel = (value) => {
  const provider = getExternalAuthProvider(value)
  return provider ? EXTERNAL_AUTH_PROVIDER_LABELS[provider] : null
}

export const getConnectedAccountStatus = (value) => {
  if (value === true || value === CONNECTED_ACCOUNT_STATUS.CONNECTED) {
    return CONNECTED_ACCOUNT_STATUS.CONNECTED
  }
  if (
    value === false ||
    value === CONNECTED_ACCOUNT_STATUS.NOT_CONNECTED ||
    value === null ||
    value === undefined
  ) {
    return CONNECTED_ACCOUNT_STATUS.NOT_CONNECTED
  }
  return null
}

/**
 * Maps one backend connected-account record. Providers that were never planned
 * are dropped instead of being rendered, so the UI cannot offer an account for
 * a service the product does not support.
 */
export const toConnectedAccount = (record) => {
  if (!record || typeof record !== 'object') {
    return null
  }
  const provider = getExternalAuthProvider(
    record.provider ?? record.name ?? record.type,
  )
  if (!provider) {
    return null
  }
  const status = getConnectedAccountStatus(
    record.status ?? record.connected ?? record.isConnected,
  )
  const connectedAt = record.connectedAt ?? record.connected_at ?? null
  const email = record.email
  return {
    provider,
    status: status ?? CONNECTED_ACCOUNT_STATUS.NOT_CONNECTED,
    email: isNonEmptyString(email) ? email.trim().toLowerCase() : null,
    connectedAt: isNonEmptyString(connectedAt) ? connectedAt : null,
  }
}

export const toConnectedAccountList = (records) => {
  if (!Array.isArray(records)) {
    return []
  }
  const mapped = records.map(toConnectedAccount).filter(Boolean)
  const seen = new Set()
  return mapped.filter((account) => {
    if (seen.has(account.provider)) {
      return false
    }
    seen.add(account.provider)
    return true
  })
}
