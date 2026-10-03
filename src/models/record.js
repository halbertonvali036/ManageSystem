import {
  FIELD_TYPE,
  normalizeFieldType,
} from '@/models/database'
import { isValidDate, isValidEmail, isValidUrl } from '@/utils/validation'

/**
 * Record model — one row of a database model.
 *
 * A record never carries its own column list. Its values are keyed by the field
 * keys of the model it belongs to, so the table, the form and the API all read
 * the same schema. A key the schema does not declare is dropped on the way in:
 * the model definition is the only source of columns.
 *
 * Nothing here persists. Reads degrade to an empty list / null and every write
 * is refused by the service layer while the backend is absent.
 */

/**
 * @typedef {Object} DatabaseRecord
 * @property {string|null} id      Backend identifier.
 * @property {Object}      values  `{ [fieldKey]: value }` for the model's fields.
 * @property {string|null} createdAt ISO 8601 timestamp.
 * @property {string|null} updatedAt ISO 8601 timestamp.
 */

export const RECORD_SORT_DIRECTION = Object.freeze({ ASC: 'asc', DESC: 'desc' })

/** Sentinel for "no field filter" in the records toolbar. */
export const ALL_RECORDS_FILTER = 'all'

/** Sentinel for "no explicit sort" — the backend's own order is kept. */
export const NO_RECORD_SORT = 'none'

/**
 * Validation failure codes.
 *
 * Codes, not sentences: the copy is chosen by the form from the active locale,
 * so this file stays free of user-facing text.
 */
export const RECORD_ERROR = Object.freeze({
  REQUIRED: 'required',
  NUMBER: 'number',
  DATE: 'date',
  EMAIL: 'email',
  URL: 'url',
  OPTION: 'option',
})

/** True when a value carries nothing. `false` and `0` are real values. */
export const isEmptyFieldValue = (value) =>
  value === null || value === undefined || value === ''

/**
 * Coerces a raw API value into the type its field declares.
 *
 * Anything unparseable becomes null rather than a half-typed value, so the table
 * never renders `NaN` and the form never loads a broken default.
 */
export const coerceFieldValue = (field, raw) => {
  const type = normalizeFieldType(field?.type)
  const value = isEmptyFieldValue(raw) ? null : raw

  if (value === null) {
    return null
  }

  switch (type) {
    case FIELD_TYPE.BOOLEAN:
      if (typeof value === 'boolean') return value
      if (value === 'true') return true
      if (value === 'false') return false
      return Boolean(value)
    case FIELD_TYPE.NUMBER: {
      const parsed = typeof value === 'number' ? value : Number(String(value).replace(',', '.'))
      return Number.isFinite(parsed) ? parsed : null
    }
    case FIELD_TYPE.DATE: {
      const text = String(value)
      const day = text.slice(0, 10)
      return isValidDate(day) ? day : null
    }
    default:
      return String(value)
  }
}

/**
 * Maps an API response onto the DatabaseRecord typedef.
 *
 * @param {Object} raw    Raw record from the API.
 * @param {Array}  fields The model's fields — the only columns that survive.
 */
export const normalizeRecord = (raw, fields = []) => {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const source = raw.values ?? raw.data ?? raw
  const values = {}

  for (const field of fields) {
    const candidate = source?.[field.key] ?? source?.[field.id] ?? null
    values[field.key] = coerceFieldValue(field, candidate)
  }

  return {
    id: raw.id ?? null,
    values,
    createdAt: raw.createdAt ?? raw.created_at ?? null,
    updatedAt: raw.updatedAt ?? raw.updated_at ?? null,
  }
}

/**
 * Turns one form input into a typed value.
 *
 * @returns {{ value: *, error: string|null }} `error` is a RECORD_ERROR code.
 */
export const coerceFieldInput = (field, input) => {
  const type = normalizeFieldType(field?.type)

  if (type === FIELD_TYPE.BOOLEAN) {
    if (input === '' || input === null || input === undefined) {
      return { value: null, error: null }
    }
    if (input === true || input === 'true') return { value: true, error: null }
    if (input === false || input === 'false') return { value: false, error: null }
    return { value: null, error: RECORD_ERROR.REQUIRED }
  }

  if (isEmptyFieldValue(input)) {
    return { value: null, error: null }
  }

  const text = String(input).trim()

  switch (type) {
    case FIELD_TYPE.NUMBER: {
      const parsed = Number(text.replace(',', '.'))
      return Number.isFinite(parsed)
        ? { value: parsed, error: null }
        : { value: null, error: RECORD_ERROR.NUMBER }
    }
    case FIELD_TYPE.DATE:
      return isValidDate(text)
        ? { value: text, error: null }
        : { value: null, error: RECORD_ERROR.DATE }
    case FIELD_TYPE.EMAIL:
      return isValidEmail(text)
        ? { value: text, error: null }
        : { value: null, error: RECORD_ERROR.EMAIL }
    case FIELD_TYPE.URL:
      return isValidUrl(text)
        ? { value: text, error: null }
        : { value: null, error: RECORD_ERROR.URL }
    case FIELD_TYPE.SELECT:
      return (field.options ?? []).includes(text)
        ? { value: text, error: null }
        : { value: null, error: RECORD_ERROR.OPTION }
    default:
      return { value: text, error: null }
  }
}

/**
 * Builds and validates the payload for one create / update call.
 *
 * Every field in the model is visited, so a required field can never be skipped
 * by omission. Field settings are the rules: `required` blocks an empty value,
 * a Select only accepts one of its own options, and each type is checked before
 * the value is allowed through.
 *
 * @returns {{ values: Object, errors: Object, isValid: boolean }}
 */
export const buildRecordDraft = (inputs = {}, fields = []) => {
  const values = {}
  const errors = {}

  for (const field of fields) {
    const { value, error } = coerceFieldInput(field, inputs?.[field.key])

    if (error) {
      errors[field.key] = error
      continue
    }

    if (field.required && isEmptyFieldValue(value)) {
      errors[field.key] = RECORD_ERROR.REQUIRED
      continue
    }

    values[field.key] = value
  }

  return { values, errors, isValid: Object.keys(errors).length === 0 }
}

/**
 * Form inputs for a record, with the field's declared default filled in when the
 * record itself has no value. New records therefore start from the schema's own
 * defaults instead of a blank guess.
 */
export const toRecordInputs = (record, fields = []) => {
  const inputs = {}

  for (const field of fields) {
    const value = record ? record.values?.[field.key] : null
    const fallback = isEmptyFieldValue(value) ? (field.defaultValue ?? null) : value
    inputs[field.key] = isEmptyFieldValue(fallback) ? '' : String(fallback)
  }

  return inputs
}

// ── Display ───────────────────────────────────────────────────────────────────

/**
 * Text for one table cell / detail row.
 *
 * Labels for Booleans and the empty placeholder are passed in by the caller so
 * this module never hard-codes a language.
 */
export const formatRecordValue = (
  field,
  value,
  { locale, trueLabel, falseLabel, emptyLabel } = {},
) => {
  if (isEmptyFieldValue(value)) {
    return emptyLabel ?? '—'
  }

  const type = normalizeFieldType(field?.type)

  if (type === FIELD_TYPE.BOOLEAN) {
    return value ? (trueLabel ?? 'true') : (falseLabel ?? 'false')
  }

  if (type === FIELD_TYPE.DATE) {
    const date = new Date(`${value}T00:00:00`)
    if (Number.isNaN(date.getTime())) {
      return String(value)
    }
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)
  }

  return String(value)
}

// ── Search / filter / sort ────────────────────────────────────────────────────

/** Case-insensitive match across every declared field of the record. */
export const recordMatchesQuery = (record, query, fields = []) => {
  const needle = query.trim().toLowerCase()
  if (!needle) return true

  return fields.some((field) => {
    const value = record?.values?.[field.key]
    if (isEmptyFieldValue(value)) return false
    return String(value).toLowerCase().includes(needle)
  })
}

const matchesFieldFilter = (record, fieldKey, filterValue) => {
  if (filterValue === ALL_RECORDS_FILTER || !fieldKey) {
    return true
  }

  const value = record?.values?.[fieldKey]
  if (isEmptyFieldValue(value)) {
    // A record without a value in the filtered column is not a match: showing
    // it under a concrete value would misreport what the filter means.
    return false
  }

  return String(value) === String(filterValue)
}

/**
 * Filters already-loaded records.
 *
 * The field filter only matches records that actually carry the chosen value, so
 * a filter never invents rows that were not loaded.
 */
export const filterRecords = (
  records = [],
  { query = '', fieldKey = '', value = ALL_RECORDS_FILTER } = {},
  fields = [],
) =>
  records.filter(
    (record) =>
      recordMatchesQuery(record, query, fields) &&
      matchesFieldFilter(record, fieldKey, value),
  )

const compareValues = (field, a, b) => {
  const type = normalizeFieldType(field?.type)

  if (type === FIELD_TYPE.BOOLEAN) {
    return Number(Boolean(a)) - Number(Boolean(b))
  }

  if (type === FIELD_TYPE.NUMBER) {
    const left = Number(a)
    const right = Number(b)
    if (Number.isFinite(left) && Number.isFinite(right)) {
      return left - right
    }
  }

  if (type === FIELD_TYPE.DATE) {
    const left = new Date(`${a}T00:00:00`).getTime()
    const right = new Date(`${b}T00:00:00`).getTime()
    if (Number.isFinite(left) && Number.isFinite(right)) {
      return left - right
    }
  }

  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

/**
 * Sorts already-loaded records by one field.
 *
 * Sorting is type-aware — numbers compare numerically, dates chronologically,
 * Booleans false-before-true — so the order matches the column the user sees.
 * Records missing a value always sort last, in both directions, so they never
 * jump to the top and pretend to be the largest.
 */
export const sortRecords = (records = [], { key, direction } = {}, fields = []) => {
  if (!key || !direction) {
    return [...records]
  }

  const field = fields.find((item) => item.key === key)
  if (!field) {
    return [...records]
  }

  const factor = direction === RECORD_SORT_DIRECTION.DESC ? -1 : 1

  return [...records].sort((left, right) => {
    const a = left.values?.[key]
    const b = right.values?.[key]
    const aEmpty = isEmptyFieldValue(a)
    const bEmpty = isEmptyFieldValue(b)

    if (aEmpty && bEmpty) return 0
    if (aEmpty) return 1
    if (bEmpty) return -1

    return compareValues(field, a, b) * factor
  })
}

/**
 * Distinct values present in one loaded column, for the filter select.
 *
 * Derived from the records that were actually read, so the filter can never
 * offer a value the current page has no record for.
 */
export const getRecordFilterOptions = (records = [], fieldKey = '') => {
  if (!fieldKey) {
    return []
  }

  const seen = new Set()
  for (const record of records) {
    const value = record?.values?.[fieldKey]
    if (!isEmptyFieldValue(value)) {
      seen.add(String(value))
    }
  }

  return [...seen].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
}

export default normalizeRecord
