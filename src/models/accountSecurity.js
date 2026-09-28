/**
 * Account & Security domain model.
 *
 * Holds the status vocabulary the Account & Security page can display, the
 * formatters used to render backend timestamps, and defensive normalizers that
 * map raw API records onto the shapes the UI expects.
 *
 * Rules enforced here:
 * - A status is only ever returned when the backend actually sent a known one.
 * - Missing values format to `null` so the UI can show an honest
 *   "unavailable" state instead of inventing account or security data.
 * - No secret, QR payload, token or recovery code is ever created here.
 */

import { toConnectedAccountList } from '@/models/externalAuth'

/* ── Account status ────────────────────────────────────────── */

export const ACCOUNT_STATUS = Object.freeze({
  ACTIVE: 'active',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  DISABLED: 'disabled',
  LOCKED: 'locked',
})

const ACCOUNT_STATUS_LABELS = Object.freeze({
  [ACCOUNT_STATUS.ACTIVE]: 'Active',
  [ACCOUNT_STATUS.PENDING]: 'Pending activation',
  [ACCOUNT_STATUS.SUSPENDED]: 'Suspended',
  [ACCOUNT_STATUS.DISABLED]: 'Disabled',
  [ACCOUNT_STATUS.LOCKED]: 'Locked',
})

/** Reuses existing shared status-badge variants — no new palette. */
const ACCOUNT_STATUS_VARIANTS = Object.freeze({
  [ACCOUNT_STATUS.ACTIVE]: 'active',
  [ACCOUNT_STATUS.PENDING]: 'upcoming',
  [ACCOUNT_STATUS.SUSPENDED]: 'past-due',
  [ACCOUNT_STATUS.DISABLED]: 'canceled',
  [ACCOUNT_STATUS.LOCKED]: 'past-due',
})

export const ACCOUNT_STATUS_UNAVAILABLE_LABEL = 'Status unavailable'

/* ── Email verification ────────────────────────────────────── */

export const EMAIL_VERIFICATION = Object.freeze({
  VERIFIED: 'verified',
  UNVERIFIED: 'unverified',
})

const EMAIL_VERIFICATION_LABELS = Object.freeze({
  [EMAIL_VERIFICATION.VERIFIED]: 'Verified',
  [EMAIL_VERIFICATION.UNVERIFIED]: 'Not verified',
})

const EMAIL_VERIFICATION_VARIANTS = Object.freeze({
  [EMAIL_VERIFICATION.VERIFIED]: 'active',
  [EMAIL_VERIFICATION.UNVERIFIED]: 'incomplete',
})

export const EMAIL_VERIFICATION_UNAVAILABLE_LABEL = 'Verification status unavailable'

/* ── Two-factor authentication ─────────────────────────────── */

export const TWO_FACTOR_STATUS = Object.freeze({
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  PENDING: 'pending',
})

const TWO_FACTOR_STATUS_LABELS = Object.freeze({
  [TWO_FACTOR_STATUS.ENABLED]: 'Enabled',
  [TWO_FACTOR_STATUS.DISABLED]: 'Disabled',
  [TWO_FACTOR_STATUS.PENDING]: 'Setup incomplete',
})

const TWO_FACTOR_STATUS_VARIANTS = Object.freeze({
  [TWO_FACTOR_STATUS.ENABLED]: 'active',
  [TWO_FACTOR_STATUS.DISABLED]: 'inactive',
  [TWO_FACTOR_STATUS.PENDING]: 'incomplete',
})

export const TWO_FACTOR_METHOD_LABELS = Object.freeze({
  authenticator_app: 'Authenticator app',
  totp: 'Authenticator app',
  sms: 'SMS',
  email: 'Email code',
})

export const TWO_FACTOR_STATUS_UNAVAILABLE_LABEL = 'Status unavailable'

/* ── Security activity ─────────────────────────────────────── */

export const SECURITY_EVENT = Object.freeze({
  LOGIN: 'login',
  LOGOUT: 'logout',
  PASSWORD_CHANGED: 'password_changed',
  PASSWORD_CHANGE_FAILED: 'password_change_failed',
  EMAIL_VERIFIED: 'email_verified',
  VERIFICATION_EMAIL_SENT: 'verification_email_sent',
  SESSION_REVOKED: 'session_revoked',
  TWO_FACTOR_ENABLED: 'two_factor_enabled',
  TWO_FACTOR_DISABLED: 'two_factor_disabled',
  RECOVERY_REQUESTED: 'recovery_requested',
})

const SECURITY_EVENT_LABELS = Object.freeze({
  [SECURITY_EVENT.LOGIN]: 'Signed in',
  [SECURITY_EVENT.LOGOUT]: 'Signed out',
  [SECURITY_EVENT.PASSWORD_CHANGED]: 'Password changed',
  [SECURITY_EVENT.PASSWORD_CHANGE_FAILED]: 'Password change failed',
  [SECURITY_EVENT.EMAIL_VERIFIED]: 'Email verified',
  [SECURITY_EVENT.VERIFICATION_EMAIL_SENT]: 'Verification email sent',
  [SECURITY_EVENT.SESSION_REVOKED]: 'Session revoked',
  [SECURITY_EVENT.TWO_FACTOR_ENABLED]: 'Two-factor enabled',
  [SECURITY_EVENT.TWO_FACTOR_DISABLED]: 'Two-factor disabled',
  [SECURITY_EVENT.RECOVERY_REQUESTED]: 'Password recovery requested',
})

/* ── Value helpers ─────────────────────────────────────────── */

const isBlank = (value) =>
  value === null || value === undefined || (typeof value === 'string' && value.trim() === '')

const pickFirstDefined = (...values) => values.find((value) => !isBlank(value))

/** `true`/`false` only when the backend sent a real boolean. */
const asBoolean = (value) => (typeof value === 'boolean' ? value : null)

const asNumber = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

/* ── Formatters ────────────────────────────────────────────── */

/** ISO string → readable date and time, or `null` when nothing real exists. */
export const formatSecurityDateTime = (value) => {
  if (isBlank(value)) {
    return null
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Timestamp → "Just now" / "3 hours ago" / absolute date.
 * Derived from the value the backend reports; never fabricated.
 */
export const formatSecurityLastActive = (value) => {
  if (isBlank(value)) {
    return null
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }
  const elapsedMs = Date.now() - date.getTime()
  if (elapsedMs < 0) {
    return formatSecurityDateTime(value)
  }
  const elapsedMinutes = Math.floor(elapsedMs / 60000)
  if (elapsedMinutes < 1) {
    return 'Just now'
  }
  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} min ago`
  }
  const elapsedHours = Math.floor(elapsedMinutes / 60)
  if (elapsedHours < 24) {
    return `${elapsedHours} hour${elapsedHours === 1 ? '' : 's'} ago`
  }
  if (elapsedHours < 168) {
    const elapsedDays = Math.floor(elapsedHours / 24)
    return `${elapsedDays} day${elapsedDays === 1 ? '' : 's'} ago`
  }
  return formatSecurityDateTime(value)
}

/** Device line, e.g. "Chrome on Windows". `null` when not reported. */
export const formatSessionDevice = (session) => {
  const parts = [session?.browser, session?.os].filter(
    (part) => !isBlank(part) && typeof part === 'string',
  )
  if (parts.length > 0) {
    return parts.join(' on ')
  }
  return pickFirstDefined(session?.device, session?.deviceName) ?? null
}

/* ── Status helpers ────────────────────────────────────────── */

export const getAccountStatus = (value) =>
  Object.hasOwn(ACCOUNT_STATUS_LABELS, value) ? value : null

export const getAccountStatusLabel = (value) =>
  ACCOUNT_STATUS_LABELS[getAccountStatus(value)] ?? ACCOUNT_STATUS_UNAVAILABLE_LABEL

export const getAccountStatusVariant = (value) =>
  ACCOUNT_STATUS_VARIANTS[getAccountStatus(value)] ?? 'unknown'

/** `true` verified, `false` unverified, `null` never reported. */
export const getEmailVerificationStatus = (value) => {
  if (value === true) {
    return EMAIL_VERIFICATION.VERIFIED
  }
  if (value === false) {
    return EMAIL_VERIFICATION.UNVERIFIED
  }
  if (value === EMAIL_VERIFICATION.VERIFIED || value === EMAIL_VERIFICATION.UNVERIFIED) {
    return value
  }
  return null
}

export const getEmailVerificationLabel = (value) => {
  const status = getEmailVerificationStatus(value)
  return status
    ? EMAIL_VERIFICATION_LABELS[status]
    : EMAIL_VERIFICATION_UNAVAILABLE_LABEL
}

export const getEmailVerificationVariant = (value) =>
  EMAIL_VERIFICATION_VARIANTS[getEmailVerificationStatus(value)] ?? 'unknown'

export const getTwoFactorStatus = (value) =>
  Object.hasOwn(TWO_FACTOR_STATUS_LABELS, value) ? value : null

export const getTwoFactorStatusLabel = (value) =>
  TWO_FACTOR_STATUS_LABELS[getTwoFactorStatus(value)] ?? TWO_FACTOR_STATUS_UNAVAILABLE_LABEL

export const getTwoFactorStatusVariant = (value) =>
  TWO_FACTOR_STATUS_VARIANTS[getTwoFactorStatus(value)] ?? 'unknown'

export const getTwoFactorMethodLabel = (value) => TWO_FACTOR_METHOD_LABELS[value] ?? null

export const getSecurityEventType = (value) =>
  Object.hasOwn(SECURITY_EVENT_LABELS, value) ? value : null

export const getSecurityEventLabel = (value) => SECURITY_EVENT_LABELS[value] ?? 'Security event'

/* ── Normalizers (backend payload → UI shape) ─────────────── */

/**
 * @typedef {Object} AccountSecurityOverview
 * @property {string|null} displayName
 * @property {string|null} email
 * @property {string|null} accountStatus - Only a known `ACCOUNT_STATUS` value.
 * @property {boolean|null} emailVerified
 * @property {string|null} emailVerifiedAt
 * @property {string|null} lastSignInAt
 * @property {string|null} lastSignInDevice
 * @property {boolean|null} twoFactorEnabled
 * @property {string|null} twoFactorMethod
 * @property {string|null} twoFactorEnabledAt
 * @property {number|null} recoveryCodesRemaining
 * @property {Array<{provider: string, status: string, email: string|null, connectedAt: string|null}>} connectedAccounts
 */

/** Maps the backend security overview. Returns `null` when nothing exists. */
export const toSecurityOverview = (data) => {
  if (!data || typeof data !== 'object') {
    return null
  }
  const source = data.account ?? data
  const twoFactor = data.twoFactor ?? data.mfa ?? {}
  const emailVerification = data.emailVerification ?? data.verification ?? {}

  return {
    displayName: pickFirstDefined(source.displayName, source.name, source.fullName) ?? null,
    email: pickFirstDefined(source.email, data.email) ?? null,
    accountStatus: getAccountStatus(
      pickFirstDefined(source.status, source.accountStatus, source.account_status),
    ),
    emailVerified: asBoolean(
      pickFirstDefined(
        emailVerification.verified,
        emailVerification.emailVerified,
        data.emailVerified,
        data.email_verified,
      ),
    ),
    emailVerifiedAt:
      pickFirstDefined(emailVerification.verifiedAt, data.emailVerifiedAt, data.email_verified_at) ??
      null,
    lastSignInAt:
      pickFirstDefined(source.lastSignInAt, source.lastLoginAt, source.last_login_at) ?? null,
    lastSignInDevice: pickFirstDefined(source.lastSignInDevice, source.lastLoginDevice) ?? null,
    twoFactorEnabled: asBoolean(
      pickFirstDefined(twoFactor.enabled, data.twoFactorEnabled, data.mfaEnabled),
    ),
    twoFactorMethod: pickFirstDefined(twoFactor.method, data.twoFactorMethod) ?? null,
    twoFactorEnabledAt:
      pickFirstDefined(twoFactor.enabledAt, data.twoFactorEnabledAt) ?? null,
    recoveryCodesRemaining: asNumber(
      pickFirstDefined(twoFactor.recoveryCodesRemaining, data.recoveryCodesRemaining),
    ),
    connectedAccounts: toConnectedAccountList(
      pickFirstDefined(
        data.connectedAccounts,
        data.connected_accounts,
        data.linkedProviders,
        source.connectedAccounts,
      ),
    ),
  }
}

/**
 * @typedef {Object} AccountSession
 * @property {string} id
 * @property {string|null} device
 * @property {string|null} browser
 * @property {string|null} os
 * @property {string|null} location
 * @property {string|null} ipAddress
 * @property {string|null} lastActiveAt
 * @property {string|null} createdAt
 * @property {boolean} isCurrent
 */

/**
 * Maps an active session.
 * Location and IP are only ever carried through when the backend sends them —
 * this model never estimates either value.
 */
export const toSession = (record) => {
  if (!record || typeof record !== 'object') {
    return null
  }
  const id = pickFirstDefined(record.id, record.sessionId, record.session_id)
  if (isBlank(id)) {
    return null
  }
  const device = record.device ?? {}
  return {
    id: String(id),
    device: pickFirstDefined(device.name, device.label, record.deviceName) ?? null,
    browser: pickFirstDefined(device.browser, record.browser, record.userAgent) ?? null,
    os: pickFirstDefined(device.os, device.platform, record.os, record.platform) ?? null,
    location: pickFirstDefined(record.location, record.locationLabel, record.city) ?? null,
    ipAddress: pickFirstDefined(record.ipAddress, record.ip, record.ip_address) ?? null,
    lastActiveAt:
      pickFirstDefined(record.lastActiveAt, record.last_active_at, record.updatedAt) ?? null,
    createdAt: pickFirstDefined(record.createdAt, record.created_at, record.startedAt) ?? null,
    isCurrent: record.isCurrent === true || record.current === true,
  }
}

/**
 * @typedef {Object} SecurityActivityEvent
 * @property {string} id
 * @property {string|null} type - Only a known `SECURITY_EVENT` value.
 * @property {string|null} occurredAt
 * @property {string|null} device
 * @property {string|null} location
 * @property {string|null} ipAddress
 * @property {string|null} detail
 */

/** Maps a security activity event. Events are never created client-side. */
export const toSecurityEvent = (record) => {
  if (!record || typeof record !== 'object') {
    return null
  }
  const id = pickFirstDefined(record.id, record.eventId, record.event_id)
  if (isBlank(id)) {
    return null
  }
  return {
    id: String(id),
    type: getSecurityEventType(
      pickFirstDefined(record.type, record.event, record.action),
    ),
    occurredAt:
      pickFirstDefined(record.occurredAt, record.occurred_at, record.createdAt, record.timestamp) ??
      null,
    device: pickFirstDefined(record.device, record.deviceName, record.userAgent) ?? null,
    location: pickFirstDefined(record.location, record.locationLabel) ?? null,
    ipAddress: pickFirstDefined(record.ipAddress, record.ip) ?? null,
    detail: pickFirstDefined(record.detail, record.description, record.message) ?? null,
  }
}
