/**
 * Support / contact model.
 *
 * The frontend collects a request and hands it to the backend. It does not
 * create, store, number or resolve anything itself, and it never pretends a
 * ticket exists. The authenticated account is inferred by the backend from the
 * session, so no user, student or staff id is sent from the client.
 */

export const SUPPORT_CATEGORY = Object.freeze({
  ACCOUNT: 'account',
  ACADEMIC_ACCESS: 'academic_access',
  BILLING: 'billing',
  TECHNICAL: 'technical',
  OTHER: 'other',
})

export const SUPPORT_CATEGORIES = Object.freeze(Object.values(SUPPORT_CATEGORY))

const CATEGORY_ALIASES = Object.freeze({
  account: SUPPORT_CATEGORY.ACCOUNT,
  login: SUPPORT_CATEGORY.ACCOUNT,
  security: SUPPORT_CATEGORY.ACCOUNT,
  academic_access: SUPPORT_CATEGORY.ACADEMIC_ACCESS,
  academic: SUPPORT_CATEGORY.ACADEMIC_ACCESS,
  access: SUPPORT_CATEGORY.ACADEMIC_ACCESS,
  billing: SUPPORT_CATEGORY.BILLING,
  invoice: SUPPORT_CATEGORY.BILLING,
  payment: SUPPORT_CATEGORY.BILLING,
  technical: SUPPORT_CATEGORY.TECHNICAL,
  technical_issue: SUPPORT_CATEGORY.TECHNICAL,
  bug: SUPPORT_CATEGORY.TECHNICAL,
  other: SUPPORT_CATEGORY.OTHER,
  general: SUPPORT_CATEGORY.OTHER,
})

/** Simple, product-relevant categories with one line of guidance each. */
export const SUPPORT_CATEGORY_META = Object.freeze({
  [SUPPORT_CATEGORY.ACCOUNT]: {
    label: 'Account',
    description: 'Sign-in, password, verification, connected accounts or sessions.',
  },
  [SUPPORT_CATEGORY.ACADEMIC_ACCESS]: {
    label: 'Academic access',
    description: 'Courses, classes, timetable, attendance, assessments or grades you cannot open.',
  },
  [SUPPORT_CATEGORY.BILLING]: {
    label: 'Billing',
    description: 'Plan, invoice or payment questions for this account.',
  },
  [SUPPORT_CATEGORY.TECHNICAL]: {
    label: 'Technical issue',
    description: 'Something behaves incorrectly, loads slowly or fails to load.',
  },
  [SUPPORT_CATEGORY.OTHER]: {
    label: 'Other',
    description: 'Anything that does not fit the categories above.',
  },
})

export const SUPPORT_REQUESTS_PATH = '/support/requests'

export const SUPPORT_FIELD_LIMITS = Object.freeze({
  SUBJECT_MIN: 4,
  SUBJECT_MAX: 120,
  MESSAGE_MIN: 10,
  MESSAGE_MAX: 2000,
})

export const getSupportCategory = (value) => {
  if (typeof value !== 'string') {
    return null
  }
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, '_')
  if (SUPPORT_CATEGORIES.includes(normalized)) {
    return normalized
  }
  return CATEGORY_ALIASES[normalized] ?? null
}

const asTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '')

/**
 * Validates the contact form.
 *
 * Returns a field-keyed error map, so the UI can mark the offending inputs
 * instead of showing one vague message. An empty object means the form is
 * ready to be submitted.
 */
export const validateSupportRequest = (draft) => {
  const errors = {}
  const subject = asTrimmedString(draft?.subject)
  const message = asTrimmedString(draft?.message)
  const category = getSupportCategory(draft?.category)

  if (!category) {
    errors.category = 'Choose what your request is about.'
  }
  if (subject.length < SUPPORT_FIELD_LIMITS.SUBJECT_MIN) {
    errors.subject = `Add a subject of at least ${SUPPORT_FIELD_LIMITS.SUBJECT_MIN} characters.`
  } else if (subject.length > SUPPORT_FIELD_LIMITS.SUBJECT_MAX) {
    errors.subject = `Keep the subject under ${SUPPORT_FIELD_LIMITS.SUBJECT_MAX} characters.`
  }
  if (message.length < SUPPORT_FIELD_LIMITS.MESSAGE_MIN) {
    errors.message = `Describe the problem in at least ${SUPPORT_FIELD_LIMITS.MESSAGE_MIN} characters.`
  } else if (message.length > SUPPORT_FIELD_LIMITS.MESSAGE_MAX) {
    errors.message = `Keep the message under ${SUPPORT_FIELD_LIMITS.MESSAGE_MAX} characters.`
  }

  return errors
}

export const isSupportRequestValid = (draft) =>
  Object.keys(validateSupportRequest(draft)).length === 0

/**
 * Builds the request body. The subject and message are trimmed; the category
 * is normalised; nothing identifying the user is added.
 */
export const toSupportRequestPayload = (draft) => {
  if (!isSupportRequestValid(draft)) {
    return null
  }
  return {
    category: getSupportCategory(draft.category),
    subject: asTrimmedString(draft.subject),
    message: asTrimmedString(draft.message),
  }
}
