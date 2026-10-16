/**
 * Profile model.
 *
 * The account profile edits only what the session already carries: a display
 * name, plus the optional bio/company fields when the account record exposes
 * them. Everything else on the profile page — the email address, the role, the
 * account status and the identifiers — is owned by the backend and stays
 * read-only here. Nothing in this module invents a value or persists anything.
 *
 * Avatar handling is deliberately local: the file picker produces an Object URL
 * for an instant preview, and the same URL-tracking helpers the editor media
 * layer uses keep that URL alive for exactly as long as it is shown. Uploading
 * is a separate, backend-gated step in `services/profileService`.
 */

/** Image formats the avatar picker accepts. JPG/JPEG, PNG and WEBP only. */
export const PROFILE_AVATAR_MIME = Object.freeze({
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  WEBP: 'image/webp',
})

export const PROFILE_AVATAR_MIME_LIST = Object.freeze(Object.values(PROFILE_AVATAR_MIME))

/** `accept` attribute for the file input. */
export const PROFILE_AVATAR_ACCEPT = PROFILE_AVATAR_MIME_LIST.join(',')

/**
 * Size ceiling for a local preview.
 *
 * A very large image can stall the tab while the browser decodes and paints it.
 * Refusing it up front keeps the UI responsive, and the limit is stated in the
 * picker hint so the rule is never a surprise.
 */
export const PROFILE_AVATAR_MAX_BYTES = 5 * 1024 * 1024
export const PROFILE_AVATAR_MAX_MB = PROFILE_AVATAR_MAX_BYTES / (1024 * 1024)

/** Why a chosen avatar file was refused. */
export const AVATAR_ERROR = Object.freeze({
  EMPTY: 'empty',
  TYPE: 'type',
  SIZE: 'size',
})

const AVATAR_ERROR_KEYS = Object.freeze({
  [AVATAR_ERROR.EMPTY]: 'accountProfile.avatarErrorEmpty',
  [AVATAR_ERROR.TYPE]: 'accountProfile.avatarErrorType',
  [AVATAR_ERROR.SIZE]: 'accountProfile.avatarErrorSize',
})

/** The translation key for an avatar rejection code, or `null` when valid. */
export const getAvatarErrorKey = (code) => AVATAR_ERROR_KEYS[code] ?? null

/**
 * Validates a picked file before it is turned into a preview.
 *
 * Returns an `AVATAR_ERROR` code, or `null` when the file is acceptable. The
 * check is about protecting the tab and the user's expectation, not about
 * security — the backend must validate the bytes again before storing them.
 */
export const validateAvatarFile = (file) => {
  if (!file) {
    return AVATAR_ERROR.EMPTY
  }
  if (!PROFILE_AVATAR_MIME_LIST.includes(file.type)) {
    return AVATAR_ERROR.TYPE
  }
  if (file.size > PROFILE_AVATAR_MAX_BYTES) {
    return AVATAR_ERROR.SIZE
  }
  return null
}

/* ── Text fields ─────────────────────────────────────────────────────────── */

export const PROFILE_DISPLAY_NAME_MAX_LENGTH = 80
export const PROFILE_BIO_MAX_LENGTH = 280
export const PROFILE_COMPANY_MAX_LENGTH = 120

/** Reads a profile value as trimmed text, or '' when it is not a string. */
export const readProfileText = (value) => (typeof value === 'string' ? value.trim() : '')

/**
 * The optional fields this profile exposes.
 *
 * `bio` and `company` are only offered when the account record already carries
 * the key, so the form never asks for data the product does not model yet.
 */
const OPTIONAL_PROFILE_FIELDS = Object.freeze([
  {
    key: 'bio',
    labelKey: 'accountProfile.bioLabel',
    placeholderKey: 'accountProfile.bioPlaceholder',
    maxLength: PROFILE_BIO_MAX_LENGTH,
    multiline: true,
  },
  {
    key: 'company',
    labelKey: 'accountProfile.companyLabel',
    placeholderKey: 'accountProfile.companyPlaceholder',
    maxLength: PROFILE_COMPANY_MAX_LENGTH,
    multiline: false,
  },
])

const hasOwn = (value, key) =>
  value != null && Object.prototype.hasOwnProperty.call(value, key)

/** The optional fields present on `user`, in a stable order. */
export const getOptionalProfileFields = (user) =>
  OPTIONAL_PROFILE_FIELDS.filter((field) => hasOwn(user, field.key))

/** The editable keys for the optional fields present on `user`. */
export const getOptionalProfileKeys = (user) =>
  getOptionalProfileFields(user).map((field) => field.key)

/** A local form draft built from the signed-in account record. */
export const createProfileDraft = (user) => ({
  displayName: readProfileText(user?.name ?? user?.fullName ?? user?.displayName),
  bio: readProfileText(user?.bio),
  company: readProfileText(user?.company),
})

/** Whether a display name is acceptable: present and within the limit. */
export const isValidProfileDisplayName = (value) => {
  const text = readProfileText(value)
  return text.length > 0 && text.length <= PROFILE_DISPLAY_NAME_MAX_LENGTH
}

/** Whether the draft differs from the last known server values. */
export const hasProfileChanges = (draft, saved, optionalKeys = []) => {
  if (readProfileText(draft?.displayName) !== readProfileText(saved?.displayName)) {
    return true
  }
  return optionalKeys.some(
    (key) => readProfileText(draft?.[key]) !== readProfileText(saved?.[key]),
  )
}

/**
 * Builds the payload for a profile write.
 *
 * Only the editable fields are sent. The optional keys are included only when
 * they are part of the profile, so an untouched field is never blanked out on
 * the server by a value this page happened to render.
 */
export const toProfilePayload = (draft, optionalKeys = []) => {
  const payload = { name: readProfileText(draft?.displayName) }
  optionalKeys.forEach((key) => {
    payload[key] = readProfileText(draft?.[key])
  })
  return payload
}

/** Initials for the avatar fallback. Falls back to an empty string. */
export const getProfileInitials = (name) =>
  readProfileText(name)
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
