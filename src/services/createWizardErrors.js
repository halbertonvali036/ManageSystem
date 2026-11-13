/**
 * Error routing for the create-site wizard.
 *
 * Pure functions that turn a failed `POST /api/sites` into the step the
 * visitor should see, the field to focus and the message to show. They live
 * apart from the page so the rules can be verified without a browser and so
 * the page only has to apply the plan.
 *
 * Routing rules:
 *  - a duplicate URL (a slug/subdomain field error, or a message that names the
 *    slug/subdomain/URL as taken) returns to the Project step with the slug
 *    focused;
 *  - a plan/site-limit refusal (a site-limit code, or a 403/409/422 whose
 *    message is about the plan/limit/max sites) stays on the current step with
 *    a form error and an upgrade link;
 *  - a duplicate project name returns to the Project step with the name focused;
 *  - other name / projectName and slug server errors return to the Project step
 *    with the field focused;
 *  - content-field errors go to the content step;
 *  - template errors (an unknown template id, or a 404/422 with no field to
 *    attach to) go to the Template step;
 *  - any other 409 shows the backend message in the form error area, stays on
 *    the current step and keeps the typed values;
 *  - network, 5xx and unknown errors stay on the current step and show
 *    `getRequestErrorMessage`.
 *
 * A plan never carries form values, so no failure can clear what was typed.
 */
import { TEMPLATE_UNAVAILABLE_CODE } from '@/services/siteService'
import {
  BackendNotConnectedError,
  getRequestErrorMessage,
  HTTP_STATUS,
  RequestError,
} from '@/services/httpClient'
import { SITE_CONTENT_FIELDS } from '@/models/siteContent'

/** The wizard's step count: Project, Template, Content, Theme, Review. */
export const LAST_STEP = 5

const STEP_PROJECT = 1
const STEP_TEMPLATE = 2
const STEP_CONTENT = 3

/**
 * Backend field names that do not match the form's own names.
 *
 * `title` and `subdomain` are the two aliases the API contract allows for the
 * project name and URL. Content fields keep their exact names.
 */
const SERVER_FIELD_ALIASES = Object.freeze({
  projectName: 'name',
  name: 'name',
  title: 'name',
  slug: 'slug',
  subdomain: 'slug',
  templateId: 'templateId',
  template: 'templateId',
})

const SLUG_FIELDS = ['slug', 'subdomain']
const NAME_FIELDS = ['projectName', 'name', 'title']

const CONTENT_FIELD_SET = new Set(SITE_CONTENT_FIELDS)

/**
 * Words a backend uses when a value must be unique. Kept deliberately broad and
 * includes the Azerbaijani wording the API has used before.
 */
const TAKEN_PATTERN = /(exist|taken|already|used|unique|in use|reserved|mövcud|istifadə|artıq)/

/**
 * A machine code for "this plan cannot hold another site". Matches
 * `SITE_LIMIT_REACHED`, `PLAN_LIMIT_EXCEEDED`, `SITE_QUOTA`, `LIMIT_REACHED`
 * and similar spellings, in any status.
 */
const SITE_LIMIT_CODE_PATTERN =
  /(SITE|PLAN|ACCOUNT)[\s_-]*(LIMIT|QUOTA)|(LIMIT|QUOTA)[\s_-]*(REACHED|EXCEEDED)|SITE_QUOTA/

/**
 * A human message about the plan or site limit. Only `limit`-style words plus a
 * site/plan noun match, so unrelated messages ("rate limit", "URL taken")
 * cannot be mistaken for a plan limit.
 */
const LIMIT_WORD_PATTERN = /\b(limit|limited|quota|maximum|max|exceeded?|upgrade)\b/
const SITE_WORD_PATTERN = /\b(site|sites|website|websites|project|projects|plan|subscription)\b/

const LIMIT_STATUSES = new Set([
  HTTP_STATUS.FORBIDDEN,
  HTTP_STATUS.CONFLICT,
  HTTP_STATUS.UNPROCESSABLE_ENTITY,
])

/** The first message in a backend field error, which is a `string[]`. */
const firstErrorMessage = (value) => {
  if (Array.isArray(value)) {
    return value.find((item) => typeof item === 'string' && item.trim())?.trim() ?? ''
  }
  return typeof value === 'string' ? value.trim() : ''
}

/** The raw `errors` object of an error envelope, when it is a plain object. */
const errorFieldMap = (error) => {
  const raw = error?.data?.errors
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : null
}

/**
 * Reads `{ message, errors: { field: string[] } }` into form field errors.
 *
 * Unknown fields are ignored here: an error we cannot place is better shown in
 * the form's error area than attached to a field that does not exist.
 */
export const getServerFieldErrors = (error) => {
  const raw = errorFieldMap(error)
  if (!raw) {
    return {}
  }

  const fieldErrors = {}
  for (const [key, value] of Object.entries(raw)) {
    const field = SERVER_FIELD_ALIASES[key] ?? (CONTENT_FIELD_SET.has(key) ? key : null)
    if (!field || fieldErrors[field]) {
      continue
    }
    const message = firstErrorMessage(value)
    if (message) {
      fieldErrors[field] = message
    }
  }
  return fieldErrors
}

export const getServerMessage = (error) => {
  const value = error?.data?.message
  return typeof value === 'string' ? value.trim() : ''
}

/** Backend message plus the HTTP fallback, lowercased for pattern matching. */
const getErrorText = (error) =>
  `${getServerMessage(error)} ${typeof error?.message === 'string' ? error.message : ''}`.toLocaleLowerCase()

/** Whether the envelope carries one of the given `errors` keys. */
const hasErrorField = (error, keys) => {
  const raw = errorFieldMap(error)
  return Boolean(raw) && keys.some((key) => key in raw)
}

/**
 * The machine code a limit response can carry: `{ code }`, `{ error: { code } }`
 * or a string `{ error }`. `error.code` is deliberately not read here — on the
 * frontend that field is the HTTP-derived `ERROR_CODE` (e.g. `CONFLICT`).
 */
const getBackendErrorCode = (error) => {
  const data = error?.data
  const candidates = [
    data?.code,
    data?.error?.code,
    typeof data?.error === 'string' ? data.error : null,
    data?.errorCode,
  ]
  return candidates.find((value) => typeof value === 'string' && value.trim())?.trim() ?? ''
}

/**
 * A duplicate URL is reported as a slug/subdomain field error or as a message
 * that names the slug/subdomain/URL as already taken. A bare 409 is *not*
 * enough: the backend also answers 409 when the plan's site limit is reached.
 */
export const isDuplicateSlugError = (error) => {
  if (!(error instanceof RequestError)) {
    return false
  }
  if (hasErrorField(error, SLUG_FIELDS)) {
    return true
  }
  const message = getErrorText(error)
  return /\b(slug|subdomain|url)\b/.test(message) && TAKEN_PATTERN.test(message)
}

/**
 * Whether the refusal is the plan's site limit rather than a bad value.
 *
 * A machine code is trusted whatever the status. Without one, only a
 * 403/409/422 whose message talks about a limit/quota/max and a site/plan can
 * be a limit error, so an unrelated 409 keeps its own message.
 */
export const isSiteLimitError = (error) => {
  const code = getBackendErrorCode(error)
  if (code && SITE_LIMIT_CODE_PATTERN.test(code)) {
    return true
  }
  if (!(error instanceof RequestError) || !LIMIT_STATUSES.has(error.status)) {
    return false
  }
  const message = getErrorText(error)
  return LIMIT_WORD_PATTERN.test(message) && SITE_WORD_PATTERN.test(message)
}

/**
 * A duplicate project name (not the URL) is reported as a name/projectName/title
 * field error or as a message that names it as taken.
 */
export const isDuplicateNameError = (error) => {
  if (!(error instanceof RequestError) || isDuplicateSlugError(error)) {
    return false
  }
  const raw = errorFieldMap(error)
  if (raw) {
    const duplicated = NAME_FIELDS.some((key) => {
      const message = firstErrorMessage(raw[key]).toLocaleLowerCase()
      return Boolean(message) && TAKEN_PATTERN.test(message)
    })
    if (duplicated) {
      return true
    }
  }
  const message = getErrorText(error)
  return /\b(name|title)\b/.test(message) && TAKEN_PATTERN.test(message)
}

/** The step that owns a mapped form field. */
export const stepForField = (field) => {
  if (field === 'name' || field === 'slug') {
    return STEP_PROJECT
  }
  if (field === 'templateId') {
    return STEP_TEMPLATE
  }
  return CONTENT_FIELD_SET.has(field) ? STEP_CONTENT : LAST_STEP
}

/**
 * Decides where a failed create attempt returns the visitor.
 *
 * Pure so the routing rules can be checked without a browser; `t` is passed in
 * so the plan carries ready-to-render messages. Returns
 * `{ step, focus, fieldErrors, formError, formErrorAction }`; `step: null`
 * means "stay on the current step".
 */
export const planCreateFailure = (error, t) => {
  if (error?.code === TEMPLATE_UNAVAILABLE_CODE) {
    return {
      step: STEP_TEMPLATE,
      focus: null,
      fieldErrors: null,
      formError: t('templates.catalogUnavailable'),
    }
  }
  if (error instanceof BackendNotConnectedError) {
    return {
      step: null,
      focus: null,
      fieldErrors: null,
      formError: t('createSite.unavailableNotice'),
    }
  }

  const fieldErrors = getServerFieldErrors(error)

  if (isDuplicateSlugError(error)) {
    const message =
      fieldErrors.slug || getServerMessage(error) || t('createSite.slugTakenError')
    return {
      step: STEP_PROJECT,
      focus: 'slug',
      fieldErrors: { ...fieldErrors, slug: message },
      formError: null,
    }
  }

  /*
   * The plan limit is not a problem with anything typed, so it must not clear
   * a field or move the visitor to another step. The upgrade link is the only
   * action that can resolve it.
   */
  if (isSiteLimitError(error)) {
    return {
      step: null,
      focus: null,
      fieldErrors: null,
      formError: t('createSite.siteLimitReached'),
      formErrorAction: {
        to: '/billing',
        labelKey: 'createSite.siteLimitUpgrade',
      },
    }
  }

  if (isDuplicateNameError(error)) {
    const message = fieldErrors.name || getServerMessage(error) || t('createSite.nameTakenError')
    return {
      step: STEP_PROJECT,
      focus: 'name',
      fieldErrors: { ...fieldErrors, name: message },
      formError: null,
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    /*
     * A field error can belong to a step the visitor has already passed.
     * Show every mapped error, then return to the earliest step that owns
     * one and focus that field, so the message is not stranded off-screen.
     */
    const earliest = Object.entries(fieldErrors).reduce(
      (best, [field]) => {
        const fieldStep = stepForField(field)
        return fieldStep < best.step ? { step: fieldStep, field } : best
      },
      { step: LAST_STEP, field: null },
    )
    /*
     * No input renders `errors.templateId`, so a template error would be
     * invisible on the Template step: surface its message in the form's error
     * area instead of focusing a field that does not exist.
     */
    if (earliest.field === 'templateId') {
      return {
        step: STEP_TEMPLATE,
        focus: null,
        fieldErrors,
        formError: fieldErrors.templateId,
      }
    }
    return { step: earliest.step, focus: earliest.field, fieldErrors, formError: null }
  }

  if (
    error instanceof RequestError &&
    (error.status === HTTP_STATUS.NOT_FOUND ||
      error.status === HTTP_STATUS.UNPROCESSABLE_ENTITY)
  ) {
    /*
     * The backend refused the request itself with nothing to attach to a
     * field: most often a template id it does not know. Back to the Template
     * step; the values stay exactly as they were.
     */
    return {
      step: STEP_TEMPLATE,
      focus: null,
      fieldErrors: null,
      formError: getRequestErrorMessage(error) || t('createSite.templateUnavailable'),
    }
  }

  /*
   * Network, 5xx, other 409s and unknown failures stay on the current step.
   * A 409 keeps whatever `message` the backend sent instead of being reported
   * as a URL problem.
   */
  return {
    step: null,
    focus: null,
    fieldErrors: null,
    formError: getRequestErrorMessage(error) || t('createSite.failedNotice'),
  }
}
