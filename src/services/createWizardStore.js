/**
 * Session-scoped persistence for the create-site wizard.
 *
 * A half-finished wizard survives a reload of the tab: one sessionStorage key
 * holds the form values and the step the visitor was on. It is deliberately
 * narrow:
 *
 *  - only the wizard's own form fields are ever written — never a token,
 *    password or any other session material;
 *  - every read is guarded, so a corrupted value, a JSON parse failure or a
 *    disabled storage simply reads as "no saved state" instead of crashing
 *    the page;
 *  - the state is cleared when the project is created, on logout and on
 *    session expiry (the same funnel that drops the session and the template
 *    cache), and by the wizard's "Start over" action.
 *
 * Nothing here pretends to be a draft on the server: it is only this browser
 * tab's memory of an unfinished form.
 */
export const CREATE_WIZARD_STORAGE_KEY = 'create-site-wizard'

/**
 * The only value keys ever stored. Anything else found under the key (for
 * example a token written by an older version) is dropped on read.
 */
const PERSISTED_VALUE_KEYS = Object.freeze([
  'name',
  'slug',
  'slugTouched',
  'templateId',
  'themePresetId',
  'siteName',
  'siteNameTouched',
  'tagline',
  'heroTitle',
  'heroSubtitle',
  'ctaLabel',
  'aboutText',
  'email',
  'phone',
  'address',
])

const BOOLEAN_VALUE_KEYS = new Set(['slugTouched', 'siteNameTouched'])

/** Mirrors the wizard's own step bounds (Project … Review). */
const MIN_STEP = 1
const MAX_STEP = 5

const getStorage = () => {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null
  } catch {
    // Storage access itself can throw (privacy mode, disabled storage).
    return null
  }
}

const normalizeStep = (step) =>
  Number.isInteger(step) && step >= MIN_STEP && step <= MAX_STEP ? step : MIN_STEP

/** Keeps only whitelisted keys with the expected primitive type. */
const normalizeValues = (raw) => {
  const values = {}
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return values
  }
  for (const key of PERSISTED_VALUE_KEYS) {
    const value = raw[key]
    if (BOOLEAN_VALUE_KEYS.has(key)) {
      if (typeof value === 'boolean') {
        values[key] = value
      }
    } else if (typeof value === 'string') {
      values[key] = value
    }
  }
  return values
}

/**
 * Reads the saved wizard state, or `null` when there is none.
 *
 * Never throws: a corrupt or inaccessible entry is treated as absent so the
 * wizard simply starts fresh.
 */
export const readCreateWizardState = () => {
  try {
    const raw = getStorage()?.getItem(CREATE_WIZARD_STORAGE_KEY)
    if (typeof raw !== 'string' || raw === '') {
      return null
    }
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null
    }
    return {
      values: normalizeValues(parsed.values),
      step: normalizeStep(parsed.step),
    }
  } catch {
    return null
  }
}

/**
 * Persists the wizard's values and current step. A storage failure is silent:
 * the worst case is a wizard that does not restore after a reload.
 */
export const writeCreateWizardState = ({ values, step } = {}) => {
  const storage = getStorage()
  if (!storage) {
    return
  }
  try {
    storage.setItem(
      CREATE_WIZARD_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        values: normalizeValues(values),
        step: normalizeStep(step),
      }),
    )
  } catch {
    // Storage can be full or disabled; the wizard simply will not restore.
  }
}

/** Discards the saved wizard state. Safe to call when nothing is stored. */
export const clearCreateWizardState = () => {
  try {
    getStorage()?.removeItem(CREATE_WIZARD_STORAGE_KEY)
  } catch {
    // Nothing to clean up when storage is unavailable.
  }
}
