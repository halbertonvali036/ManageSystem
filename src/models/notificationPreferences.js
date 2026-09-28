/**
 * Notification preference model.
 *
 * ── Delivery contract (frontend only) ───────────────────────────────────────
 *
 * 1. These toggles are a *frontend representation* of preferences the backend
 *    owns. Nothing here sends an email, schedules a job or contacts a provider.
 * 2. `inApp` is the only channel this app can honour on its own, and only for
 *    records the backend has actually stored. It never implies a push or
 *    websocket subscription.
 * 3. `email` and the topic switches describe *intent*. While no delivery
 *    service exists they are shown as unavailable rather than described as
 *    active, so nobody is told email is on when nothing delivers it.
 * 4. No user, student or staff id is ever sent from the client: the backend
 *    infers the authenticated account from the session.
 * 5. Unknown fields are dropped rather than guessed, and a response that omits
 *    a field leaves it unknown instead of defaulting it to a saved value.
 */

/** Preference keys, grouped by what the user controls. */
export const NOTIFICATION_PREFERENCE_KEY = Object.freeze({
  IN_APP: 'inApp',
  EMAIL: 'email',
  SECURITY_ALERTS: 'securityAlerts',
  ACADEMIC_UPDATES: 'academicUpdates',
  BILLING_UPDATES: 'billingUpdates',
})

export const NOTIFICATION_PREFERENCE_CHANNEL = Object.freeze({
  IN_APP: 'inApp',
  EMAIL: 'email',
})

/** Backend field aliases, so a response in snake_case is understood. */
const FIELD_ALIASES = Object.freeze({
  [NOTIFICATION_PREFERENCE_KEY.IN_APP]: ['inApp', 'in_app', 'inAppNotifications', 'pushInApp'],
  [NOTIFICATION_PREFERENCE_KEY.EMAIL]: ['email', 'emailNotifications', 'email_enabled'],
  [NOTIFICATION_PREFERENCE_KEY.SECURITY_ALERTS]: [
    'securityAlerts',
    'security_alerts',
    'securityNotifications',
  ],
  [NOTIFICATION_PREFERENCE_KEY.ACADEMIC_UPDATES]: [
    'academicUpdates',
    'academic_updates',
    'academicNotifications',
  ],
  [NOTIFICATION_PREFERENCE_KEY.BILLING_UPDATES]: [
    'billingUpdates',
    'billing_updates',
    'billingNotifications',
  ],
})

/**
 * Field metadata for the preference UI. `requiresBackend` marks everything that
 * cannot be honoured by the frontend alone, so the card can say so plainly.
 */
export const NOTIFICATION_PREFERENCE_FIELDS = Object.freeze([
  Object.freeze({
    key: NOTIFICATION_PREFERENCE_KEY.IN_APP,
    channel: NOTIFICATION_PREFERENCE_CHANNEL.IN_APP,
    label: 'In-app notifications',
    description:
      'Shows announcements, schedule changes, attendance, assessment and grade updates inside the portal.',
  }),
  Object.freeze({
    key: NOTIFICATION_PREFERENCE_KEY.EMAIL,
    channel: NOTIFICATION_PREFERENCE_CHANNEL.EMAIL,
    label: 'Email notifications',
    description:
      'A copy of important updates by email. Requires a backend delivery service — no email is sent from this app.',
  }),
  Object.freeze({
    key: NOTIFICATION_PREFERENCE_KEY.SECURITY_ALERTS,
    channel: NOTIFICATION_PREFERENCE_CHANNEL.IN_APP,
    label: 'Security alerts',
    description:
      'Sign-in, password and connected-account changes. Critical alerts may be mandatory, so the backend can refuse to disable them.',
  }),
  Object.freeze({
    key: NOTIFICATION_PREFERENCE_KEY.ACADEMIC_UPDATES,
    channel: NOTIFICATION_PREFERENCE_CHANNEL.IN_APP,
    label: 'Academic updates',
    description: 'Announcements, timetable changes, attendance and assessment activity.',
  }),
  Object.freeze({
    key: NOTIFICATION_PREFERENCE_KEY.BILLING_UPDATES,
    channel: NOTIFICATION_PREFERENCE_CHANNEL.IN_APP,
    label: 'Billing updates',
    description: 'Plan, invoice and payment activity for this account.',
  }),
])

export const NOTIFICATION_PREFERENCE_FIELDS_BY_KEY = Object.freeze(
  Object.fromEntries(
    NOTIFICATION_PREFERENCE_FIELDS.map((field) => [field.key, field]),
  ),
)

export const NOTIFICATION_PREFERENCES_PATH = '/notifications/preferences'

/**
 * Local view state for the form. These are *unsaved form values* only — they
 * are not a stored preference, are never treated as confirmation and are never
 * persisted to local storage.
 */
export const createNotificationPreferencesDraft = () =>
  Object.fromEntries(
    NOTIFICATION_PREFERENCE_FIELDS.map((field) => [field.key, field.channel === NOTIFICATION_PREFERENCE_CHANNEL.IN_APP]),
  )

const readBoolean = (payload, key) => {
  for (const alias of FIELD_ALIASES[key]) {
    const value = payload?.[alias]
    if (typeof value === 'boolean') {
      return value
    }
  }
  return null
}

/**
 * Normalises a backend preferences payload into a partial record.
 * Returns `null` when the payload is not an object, so callers can tell
 * "unknown" apart from "all off".
 */
export const toNotificationPreferences = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null
  }
  const values = {}
  for (const field of NOTIFICATION_PREFERENCE_FIELDS) {
    const value = readBoolean(payload, field.key)
    if (value !== null) {
      values[field.key] = value
    }
  }
  return values
}

/** True when the draft differs from the last known server values. */
export const hasNotificationPreferenceChanges = (draft, saved) => {
  if (!draft) {
    return false
  }
  const baseline = saved ?? {}
  return NOTIFICATION_PREFERENCE_FIELDS.some(
    (field) => typeof draft[field.key] === 'boolean' && draft[field.key] !== baseline[field.key],
  )
}

/**
 * Request body for `updateNotificationPreferences`. Only known keys are sent
 * and no identifying field is included: the backend resolves the account from
 * the authenticated session.
 */
export const toNotificationPreferencesPayload = (draft) => {
  const payload = {}
  for (const field of NOTIFICATION_PREFERENCE_FIELDS) {
    if (typeof draft?.[field.key] === 'boolean') {
      payload[field.key] = draft[field.key]
    }
  }
  return payload
}
