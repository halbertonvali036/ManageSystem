import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'

/**
 * Account & Security service foundation.
 *
 * Identity is always inferred by the backend from the authenticated session —
 * no `userId` is ever sent or hardcoded here. Every method below acts on the
 * signed-in account only.
 *
 * While the account/security backend does not exist:
 * - reads resolve with safe empty values (`null` / `[]`), matching the
 *   convention used by the other services in this project, so the UI renders
 *   real empty and unavailable states instead of demo data;
 * - mutations throw `BackendNotConnectedError`. Nothing here simulates a
 *   successful password change, verification email, session revocation,
 *   two-factor change or QR pairing.
 *
 * No cryptography, token, secret, recovery-code or QR generation exists in
 * this file. Password hashing, session issuance, email delivery, TOTP
 * validation and QR pairing are all backend responsibilities.
 */

const SECURITY_PATH = '/account/security'
const PASSWORD_PATH = `${SECURITY_PATH}/password`
const VERIFICATION_PATH = `${SECURITY_PATH}/verification-email`
const SESSIONS_PATH = `${SECURITY_PATH}/sessions`
const TWO_FACTOR_PATH = `${SECURITY_PATH}/two-factor`
const QR_LOGIN_PATH = `${SECURITY_PATH}/qr-login`
const ACTIVITY_PATH = `${SECURITY_PATH}/activity`

const isBackendConnected = () => Boolean(config.api.baseUrl)

const ensureBackendConnection = () => {
  if (!isBackendConnected()) {
    throw new BackendNotConnectedError()
  }
}

const unwrap = (response) => response?.data ?? response ?? null

const toList = (response, keys = []) => {
  if (Array.isArray(response)) {
    return response
  }
  for (const key of keys) {
    if (Array.isArray(response?.[key])) {
      return response[key]
    }
  }
  if (Array.isArray(response?.data)) {
    return response.data
  }
  return []
}

/* ── Reads ─────────────────────────────────────────────────── */

/** Account/security summary, or `null` while the backend is absent. */
const getSecurityOverview = async () => {
  if (!isBackendConnected()) {
    return null
  }
  return unwrap(await httpClient.get(SECURITY_PATH))
}

/** Active sessions/devices for this account, or `[]`. */
const getSessions = async () => {
  if (!isBackendConnected()) {
    return []
  }
  return toList(await httpClient.get(SESSIONS_PATH), ['sessions'])
}

/** Security activity history for this account, or `[]`. */
const getSecurityActivity = async () => {
  if (!isBackendConnected()) {
    return []
  }
  return toList(await httpClient.get(ACTIVITY_PATH), ['events', 'activity'])
}

/* ── Mutations (require backend + provider integration) ────── */

/**
 * Changes the signed-in account's password.
 * The backend must verify the current password, enforce its own password
 * policy and decide whether other sessions are invalidated.
 */
const changePassword = async ({ currentPassword, newPassword }) => {
  ensureBackendConnection()
  await httpClient.post(PASSWORD_PATH, { currentPassword, newPassword })
}

/** Requests a new verification email for the signed-in account's address. */
const resendVerificationEmail = async () => {
  ensureBackendConnection()
  await httpClient.post(VERIFICATION_PATH, {})
}

/** Revokes one session belonging to the signed-in account. */
const revokeSession = async (sessionId) => {
  ensureBackendConnection()
  await httpClient.delete(`${SESSIONS_PATH}/${sessionId}`)
}

/** Revokes every other session for the signed-in account. */
const revokeOtherSessions = async () => {
  ensureBackendConnection()
  await httpClient.post(`${SESSIONS_PATH}/revoke-others`, {})
}

/**
 * Starts two-factor setup.
 * The backend must generate the shared secret, build the provisioning URI and
 * return the QR payload plus the pending setup reference. No secret, URI or QR
 * image is generated in the browser.
 */
const beginTwoFactorSetup = async () => {
  ensureBackendConnection()
  return unwrap(await httpClient.post(`${TWO_FACTOR_PATH}/setup`, {}))
}

/** Confirms two-factor setup with a code the backend issued. */
const confirmTwoFactorSetup = async (code) => {
  ensureBackendConnection()
  return unwrap(await httpClient.post(`${TWO_FACTOR_PATH}/setup/confirm`, { code }))
}

/**
 * Disables two-factor for the signed-in account.
 * The backend owns verification, recovery-code invalidation and session policy.
 */
const disableTwoFactor = async (code) => {
  ensureBackendConnection()
  return unwrap(await httpClient.post(`${TWO_FACTOR_PATH}/disable`, { code }))
}

/* ── QR sign-in (public pairing flow) ──────────────────────── */
/*
 * The web page only asks for a pairing session and reads its status. The
 * backend issues the opaque session id and the scannable payload, the mobile
 * app confirms the request, and the backend alone decides whether a sign-in
 * happened. Nothing below creates a token, signs anything, trusts a local
 * approval or starts a session in the browser.
 */

/**
 * Requests a new single-use QR pairing session.
 * Requires the backend: without it this throws instead of returning a
 * placeholder that would look like a real, scannable code.
 */
const createQrLoginSession = async () => {
  ensureBackendConnection()
  return unwrap(await httpClient.post(QR_LOGIN_PATH, {}))
}

/** Reads the backend status of one pairing session. `null` while disconnected. */
const getQrLoginStatus = async (sessionId) => {
  if (!isBackendConnected() || !sessionId) {
    return null
  }
  return unwrap(await httpClient.get(`${QR_LOGIN_PATH}/${encodeURIComponent(sessionId)}`))
}

/** Cancels a pairing session. The backend decides whether it is already spent. */
const cancelQrLoginSession = async (sessionId) => {
  ensureBackendConnection()
  if (!sessionId) {
    return null
  }
  await httpClient.delete(`${QR_LOGIN_PATH}/${encodeURIComponent(sessionId)}`)
  return true
}

const accountSecurityService = {
  isBackendConnected,
  getSecurityOverview,
  getSessions,
  getSecurityActivity,
  changePassword,
  resendVerificationEmail,
  revokeSession,
  revokeOtherSessions,
  beginTwoFactorSetup,
  confirmTwoFactorSetup,
  disableTwoFactor,
  createQrLoginSession,
  getQrLoginStatus,
  cancelQrLoginSession,
}

export default accountSecurityService
