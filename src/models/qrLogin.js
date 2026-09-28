/**
 * QR sign-in domain model.
 *
 * ── Frontend / mobile handoff contract (implementation-neutral) ──────────────
 *
 * 1. Session ID — the opaque reference the backend issues when a QR sign-in is
 *    requested (`POST /account/security/qr-login`). The web page keeps it in
 *    memory only and sends it back for status reads or cancellation. It is not
 *    a credential on its own and is never persisted in browser storage.
 * 2. QR payload — the scannable representation of that session, produced by the
 *    backend. The browser never builds, signs or invents a payload, and never
 *    renders the raw payload as text (it may embed a short-lived secret). Only
 *    an image supplied by the backend is displayed.
 * 3. Approval status — `pending → ready → scanned → approved`, plus terminal
 *    `expired`, `canceled` and `failed`. The backend is the only authority: the
 *    web page never treats a local action as an approval and never starts a
 *    session on its own.
 * 4. Expiry — the backend returns `expiresAt`. Any countdown is derived from
 *    that value alone; an absent or invalid expiry is shown as "no expiry
 *    reported" instead of an invented timer.
 * 5. Backend authority — the mobile app, the QR payload and this page are all
 *    untrusted until the backend confirms approval and issues the normal
 *    authenticated session. A successful scan is not a successful sign-in.
 *
 * No secret, token, signature or long-lived QR value is created in this file.
 */

/* ── Backend status vocabulary ─────────────────────────────── */

export const QR_LOGIN_STATUS = Object.freeze({
  PENDING: 'pending',
  READY: 'ready',
  SCANNED: 'scanned',
  APPROVED: 'approved',
  EXPIRED: 'expired',
  CANCELED: 'canceled',
  FAILED: 'failed',
})

const STATUS_ALIASES = Object.freeze({
  created: QR_LOGIN_STATUS.PENDING,
  preparing: QR_LOGIN_STATUS.PENDING,
  issued: QR_LOGIN_STATUS.READY,
  active: QR_LOGIN_STATUS.READY,
  waiting: QR_LOGIN_STATUS.SCANNED,
  scanned: QR_LOGIN_STATUS.SCANNED,
  confirming: QR_LOGIN_STATUS.SCANNED,
  pending_confirmation: QR_LOGIN_STATUS.SCANNED,
  approved: QR_LOGIN_STATUS.APPROVED,
  confirmed: QR_LOGIN_STATUS.APPROVED,
  authorized: QR_LOGIN_STATUS.APPROVED,
  completed: QR_LOGIN_STATUS.APPROVED,
  expired: QR_LOGIN_STATUS.EXPIRED,
  timeout: QR_LOGIN_STATUS.EXPIRED,
  canceled: QR_LOGIN_STATUS.CANCELED,
  cancelled: QR_LOGIN_STATUS.CANCELED,
  revoked: QR_LOGIN_STATUS.CANCELED,
  denied: QR_LOGIN_STATUS.CANCELED,
  failed: QR_LOGIN_STATUS.FAILED,
  error: QR_LOGIN_STATUS.FAILED,
  rejected: QR_LOGIN_STATUS.FAILED,
})

/** Only a recognised backend status is accepted; anything else becomes `null`. */
export const getQrLoginStatus = (value) => {
  if (typeof value !== 'string') {
    return null
  }
  const normalized = value.trim().toLowerCase()
  if (Object.values(QR_LOGIN_STATUS).includes(normalized)) {
    return normalized
  }
  return STATUS_ALIASES[normalized] ?? null
}

/* ── View states rendered by the QR page ───────────────────── */

export const QR_LOGIN_VIEW = Object.freeze({
  IDLE: 'idle',
  PREPARING: 'preparing',
  READY: 'ready',
  WAITING: 'waiting',
  APPROVED: 'approved',
  EXPIRED: 'expired',
  CANCELED: 'canceled',
  ERROR: 'error',
  UNAVAILABLE: 'unavailable',
})

/**
 * Derives the view state from the backend status plus what the backend actually
 * sent. A session that claims to be ready but carries no displayable image is
 * still shown as preparing, because there is genuinely nothing to scan yet.
 */
export const getQrLoginView = (session) => {
  if (!session) {
    return QR_LOGIN_VIEW.IDLE
  }
  switch (getQrLoginStatus(session.status)) {
    case QR_LOGIN_STATUS.PENDING:
      return QR_LOGIN_VIEW.PREPARING
    case QR_LOGIN_STATUS.READY:
      return getQrImageSource(session) ? QR_LOGIN_VIEW.READY : QR_LOGIN_VIEW.PREPARING
    case QR_LOGIN_STATUS.SCANNED:
      return QR_LOGIN_VIEW.WAITING
    case QR_LOGIN_STATUS.APPROVED:
      return QR_LOGIN_VIEW.APPROVED
    case QR_LOGIN_STATUS.EXPIRED:
      return QR_LOGIN_VIEW.EXPIRED
    case QR_LOGIN_STATUS.CANCELED:
      return QR_LOGIN_VIEW.CANCELED
    case QR_LOGIN_STATUS.FAILED:
      return QR_LOGIN_VIEW.ERROR
    default:
      return QR_LOGIN_VIEW.PREPARING
  }
}

/** Copy for every state. One source of truth so the page stays declarative. */
const VIEW_COPY = Object.freeze({
  [QR_LOGIN_VIEW.IDLE]: {
    title: 'Sign in with a QR code',
    description:
      'Request a short-lived code, then approve the sign-in from the mobile app. Your email and password still work whenever you prefer them.',
  },
  [QR_LOGIN_VIEW.PREPARING]: {
    title: 'Preparing your QR code',
    description:
      'Asking the backend for a single-use pairing session. Nothing is scannable yet.',
  },
  [QR_LOGIN_VIEW.READY]: {
    title: 'Scan this code in the mobile app',
    description:
      'Open the mobile app and scan the code, then confirm the sign-in request there.',
  },
  [QR_LOGIN_VIEW.WAITING]: {
    title: 'Waiting for confirmation',
    description:
      'Your phone scanned the code. The sign-in continues only after the app confirms it and the backend approves it.',
  },
  [QR_LOGIN_VIEW.APPROVED]: {
    title: 'Sign-in approved',
    description:
      'The backend approved this pairing and issued your session. You can open your workspace.',
  },
  [QR_LOGIN_VIEW.EXPIRED]: {
    title: 'This code expired',
    description:
      'Pairing codes are deliberately short-lived. Request a fresh code to continue.',
  },
  [QR_LOGIN_VIEW.CANCELED]: {
    title: 'QR sign-in canceled',
    description:
      'The pairing request was canceled and can no longer be used. Start again whenever you are ready.',
  },
  [QR_LOGIN_VIEW.ERROR]: {
    title: 'QR sign-in could not be completed',
    description:
      'The pairing request did not finish. Nothing was signed in — you can request a new code.',
  },
  [QR_LOGIN_VIEW.UNAVAILABLE]: {
    title: 'QR sign-in is not available yet',
    description:
      'QR sign-in needs a backend-issued, single-use pairing session. Until that integration exists, no code is shown here.',
  },
})

export const getQrLoginViewCopy = (view) => VIEW_COPY[view] ?? VIEW_COPY[QR_LOGIN_VIEW.IDLE]

/* ── Value helpers ─────────────────────────────────────────── */

const isBlank = (value) =>
  value === null ||
  value === undefined ||
  (typeof value === 'string' && value.trim() === '')

const pickFirstDefined = (...values) => values.find((value) => !isBlank(value))

/**
 * Only a backend-supplied raster/vector image is accepted for display.
 * Anything else — a remote URL, an SVG document, a raw payload string — is
 * rejected so the page cannot render a tracking pixel or expose a secret.
 */
const SAFE_QR_IMAGE = /^data:image\/(png|jpeg|jpg|svg\+xml);base64,[A-Za-z0-9+/]+={0,2}$/

export const getQrImageSource = (session) => {
  const value = session?.imageDataUrl
  if (typeof value !== 'string') {
    return null
  }
  const trimmed = value.trim()
  return SAFE_QR_IMAGE.test(trimmed) ? trimmed : null
}

/**
 * @typedef {Object} QrLoginSession
 * @property {string} sessionId - Opaque backend reference, never persisted.
 * @property {string|null} status - Only a known `QR_LOGIN_STATUS` value.
 * @property {string|null} expiresAt - Backend-reported expiry, never invented.
 * @property {string|null} createdAt
 * @property {string|null} imageDataUrl - Backend image, or `null`.
 */

/**
 * Maps a backend QR sign-in payload.
 *
 * The raw `payload` field is deliberately dropped: it may carry a short-lived
 * secret and must never reach the DOM, the console or browser storage.
 */
export const toQrLoginSession = (data) => {
  if (!data || typeof data !== 'object') {
    return null
  }
  const sessionId = pickFirstDefined(data.sessionId, data.session_id, data.id, data.requestId)
  if (isBlank(sessionId)) {
    return null
  }
  return {
    sessionId: String(sessionId),
    status: getQrLoginStatus(pickFirstDefined(data.status, data.state)),
    expiresAt: pickFirstDefined(data.expiresAt, data.expires_at, data.expiry) ?? null,
    createdAt: pickFirstDefined(data.createdAt, data.created_at) ?? null,
    imageDataUrl:
      pickFirstDefined(data.imageDataUrl, data.image_data_url, data.qrImage, data.qr_image) ??
      null,
  }
}

/** Merges a later status read into the existing session without inventing data. */
export const mergeQrLoginSession = (session, data) => {
  const next = toQrLoginSession({ ...(data ?? {}), sessionId: session?.sessionId })
  if (!next) {
    return session
  }
  return {
    sessionId: session.sessionId,
    status: next.status ?? session.status,
    expiresAt: next.expiresAt ?? session.expiresAt,
    createdAt: next.createdAt ?? session.createdAt,
    imageDataUrl: next.imageDataUrl ?? session.imageDataUrl,
  }
}

/* ── Expiry presentation ───────────────────────────────────── */

/**
 * Seconds left according to the backend's `expiresAt`.
 * `null` means the backend reported no usable expiry — never a guessed duration.
 */
export const getRemainingSeconds = (expiresAt, now = Date.now()) => {
  if (isBlank(expiresAt)) {
    return null
  }
  const expiryTime = new Date(expiresAt).getTime()
  if (Number.isNaN(expiryTime)) {
    return null
  }
  return Math.max(0, Math.floor((expiryTime - now) / 1000))
}

/** `95` → `"1:35"`. Presentation only; the value always comes from the backend. */
export const formatCountdown = (seconds) => {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds < 0) {
    return null
  }
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${minutes}:${String(remainder).padStart(2, '0')}`
}

/* ── Mobile deep link ──────────────────────────────────────── */

/**
 * Builds the optional handoff link for the companion app, e.g.
 * `app://login/qr/<session>`.
 *
 * The scheme is never assumed: it comes from deployment configuration
 * (`VITE_QR_APP_DEEP_LINK`) and stays empty until a mobile team sets it, in
 * which case the UI falls back to plain written instructions.
 */
export const buildQrDeepLink = (base, sessionId) => {
  const trimmedBase = typeof base === 'string' ? base.trim() : ''
  if (!trimmedBase || isBlank(sessionId)) {
    return null
  }
  const normalizedBase = trimmedBase.replace(/\/+$/, '')
  return `${normalizedBase}/${encodeURIComponent(String(sessionId))}`
}
