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
 *   successful password change, verification email or session revocation.
 *
 * No cryptography, token or secret generation exists in this file. Password
 * hashing, session issuance and email delivery are backend responsibilities.
 */

const SECURITY_PATH = '/account/security'
const PASSWORD_PATH = `${SECURITY_PATH}/password`
const VERIFICATION_PATH = `${SECURITY_PATH}/verification-email`
const SESSIONS_PATH = `${SECURITY_PATH}/sessions`
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

const accountSecurityService = {
  isBackendConnected,
  getSecurityOverview,
  getSessions,
  getSecurityActivity,
  changePassword,
  resendVerificationEmail,
  revokeSession,
  revokeOtherSessions,
}

export default accountSecurityService
