/**
 * Error routing for the create-site wizard.
 *
 * Pure functions that turn a failed `POST /api/sites` into the step the
 * visitor should see, the field to focus and the message to show. They live
 * apart from the page so the rules can be verified without a browser and so
 * the page only has to apply the plan.
 *
 * Routing rules:
 *  - name / projectName and slug server errors (including a duplicate URL)
 *    return to the Project step with the field focused;
 *  - content-field errors go to the content step;
 *  - template errors (an unknown template id, or a 404/422 with no field to
 *    attach to) go to the Template step;
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

const CONTENT_FIELD_SET = new Set(SITE_CONTENT_FIELDS)

/** The first message in a backend field error, which is a `string[]`. */
const firstErrorMessage = (value) => {
  if (Array.isArray(value)) {
    return value.find((item) => typeof item === 'string' && item.trim())?.trim() ?? ''
  }
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Reads `{ message, errors: { field: string[] } }` into form field errors.
 *
 * Unknown fields are ignored here: an error we cannot place is better shown in
 * the form's error area than attached to a field that does not exist.
 */
export const getServerFieldErrors = (error) => {
  const raw = error?.data?.errors
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
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

/**
 * A duplicate URL is reported as 409, as a 422 with a slug field error, or as a
 * plain message saying the slug/subdomain already exists.
 */
export const isDuplicateSlugError = (error) => {
  if (!(error instanceof RequestError)) {
    return false
  }
  if (error.status === HTTP_STATUS.CONFLICT) {
    return true
  }
  if (error.status === HTTP_STATUS.UNPROCESSABLE_ENTITY) {
    const raw = error.data?.errors
    if (raw && typeof raw === 'object' && ('slug' in raw || 'subdomain' in raw)) {
      return true
    }
  }
  const message = `${getServerMessage(error)} ${error.message ?? ''}`.toLocaleLowerCase()
  return (
    /(slug|subdomain)/.test(message) &&
    /(exist|taken|already|used|unique|in use|mövcud|istifadə|artıq)/.test(message)
  )
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
 * `{ step, focus, fieldErrors, formError }`; `step: null` means "stay on the
 * current step".
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

  // Network, 5xx and unknown failures stay on the current step.
  return {
    step: null,
    focus: null,
    fieldErrors: null,
    formError: getRequestErrorMessage(error) || t('createSite.failedNotice'),
  }
}
