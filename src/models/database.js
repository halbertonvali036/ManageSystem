/**
 * Data model / schema definitions for the workspace database builder.
 *
 * A Model is one table-like entity inside a workspace. A Field is one column of
 * that entity, optionally pointing at another model through a relation. This
 * file owns the frontend shape only — the backend will own persistence. No
 * sample model is defined on purpose: pages render honest empty states until the
 * API is connected, and every write is refused by the service layer.
 */

/**
 * @typedef {Object} DatabaseRelation
 * @property {'one_to_one'|'one_to_many'|'many_to_many'} type      Relation kind.
 * @property {string|null} targetModelId   Model this field points at.
 * @property {string|null} targetModelKey  Key of the target model, for display.
 *
 * @typedef {Object} DatabaseField
 * @property {string|null} id         Backend identifier.
 * @property {string}      name       User-facing field name.
 * @property {string}      key        Machine key used by the future API.
 * @property {string}      type       One of FIELD_TYPE.
 * @property {boolean}     required   Whether the field must be filled in.
 * @property {string|null} defaultValue Default value as entered by the user.
 * @property {string[]}    options    Allowed values, only meaningful for Select.
 * @property {DatabaseRelation|null} relation Relation foundation, or null.
 *
 * @typedef {Object} DatabaseModel
 * @property {string|null}  id          Backend identifier.
 * @property {string}       name        User-facing model name.
 * @property {string}       key         Machine key used by the future API.
 * @property {string}       description Optional free-text description.
 * @property {DatabaseField[]} fields    Fields belonging to this model.
 * @property {string|null}  createdAt   ISO 8601 timestamp.
 * @property {string|null}  updatedAt   ISO 8601 timestamp.
 */

// ── Field types ───────────────────────────────────────────────────────────────

export const FIELD_TYPE = Object.freeze({
  TEXT: 'text',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  DATE: 'date',
  EMAIL: 'email',
  URL: 'url',
  SELECT: 'select',
})

/** Field types offered in the field editor, in display order. */
export const FIELD_TYPES = Object.freeze([
  FIELD_TYPE.TEXT,
  FIELD_TYPE.NUMBER,
  FIELD_TYPE.BOOLEAN,
  FIELD_TYPE.DATE,
  FIELD_TYPE.EMAIL,
  FIELD_TYPE.URL,
  FIELD_TYPE.SELECT,
])

/** Translation key for each field type label. Labels are never hard-coded. */
export const FIELD_TYPE_LABEL_KEYS = Object.freeze({
  [FIELD_TYPE.TEXT]: 'database.fieldTypes.text',
  [FIELD_TYPE.NUMBER]: 'database.fieldTypes.number',
  [FIELD_TYPE.BOOLEAN]: 'database.fieldTypes.boolean',
  [FIELD_TYPE.DATE]: 'database.fieldTypes.date',
  [FIELD_TYPE.EMAIL]: 'database.fieldTypes.email',
  [FIELD_TYPE.URL]: 'database.fieldTypes.url',
  [FIELD_TYPE.SELECT]: 'database.fieldTypes.select',
})

export const DEFAULT_FIELD_TYPE = FIELD_TYPE.TEXT

/** Only Select carries a list of allowed values. */
export const isSelectFieldType = (type) => type === FIELD_TYPE.SELECT

export const isKnownFieldType = (type) => FIELD_TYPES.includes(type)

export const normalizeFieldType = (type) =>
  isKnownFieldType(type) ? type : DEFAULT_FIELD_TYPE

// ── Relation foundation ───────────────────────────────────────────────────────

export const RELATION_TYPE = Object.freeze({
  ONE_TO_ONE: 'one_to_one',
  ONE_TO_MANY: 'one_to_many',
  MANY_TO_MANY: 'many_to_many',
})

/** Relation kinds offered in the field settings. Order is display order. */
export const RELATION_TYPES = Object.freeze([
  RELATION_TYPE.ONE_TO_ONE,
  RELATION_TYPE.ONE_TO_MANY,
  RELATION_TYPE.MANY_TO_MANY,
])

export const RELATION_TYPE_LABEL_KEYS = Object.freeze({
  [RELATION_TYPE.ONE_TO_ONE]: 'database.relation.oneToOne',
  [RELATION_TYPE.ONE_TO_MANY]: 'database.relation.oneToMany',
  [RELATION_TYPE.MANY_TO_MANY]: 'database.relation.manyToMany',
})

/** Sentinel for "this field has no relation". Never persisted as a relation. */
export const NO_RELATION = 'none'

export const isKnownRelationType = (type) => RELATION_TYPES.includes(type)

/**
 * Normalizes a raw relation.
 *
 * A relation is only kept when both halves are meaningful: a known kind and a
 * target model. Anything else reads as "no relation yet", so a half-filled form
 * never pretends to describe a working link.
 */
export const normalizeRelation = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const type = isKnownRelationType(raw.type) ? raw.type : null
  const targetModelId = raw.targetModelId ?? raw.target_model_id ?? null

  if (!type || !targetModelId) {
    return null
  }

  return {
    type,
    targetModelId: String(targetModelId),
    targetModelKey: raw.targetModelKey ?? raw.target_model_key ?? null,
  }
}

// ── Validation ────────────────────────────────────────────────────────────────

export const MODEL_NAME_MAX_LENGTH = 60
export const MODEL_KEY_MAX_LENGTH = 48
export const FIELD_NAME_MAX_LENGTH = 60
export const FIELD_KEY_MAX_LENGTH = 48

/** Machine keys are snake_case so a future backend can use them as columns. */
export const KEY_PATTERN = /^[a-z][a-z0-9_]*$/

export const isValidModelName = (value) =>
  typeof value === 'string' &&
  value.trim().length > 0 &&
  value.trim().length <= MODEL_NAME_MAX_LENGTH

export const isValidModelKey = (value) =>
  typeof value === 'string' &&
  value.trim().length > 0 &&
  value.length <= MODEL_KEY_MAX_LENGTH &&
  KEY_PATTERN.test(value)

export const isValidFieldName = (value) =>
  typeof value === 'string' &&
  value.trim().length > 0 &&
  value.trim().length <= FIELD_NAME_MAX_LENGTH

export const isValidFieldKey = (value) =>
  typeof value === 'string' &&
  value.trim().length > 0 &&
  value.length <= FIELD_KEY_MAX_LENGTH &&
  KEY_PATTERN.test(value)

/**
 * Azerbaijani letters that don't decompose under NFD. Same table as
 * workspace.js, so keys generated anywhere in the app behave identically.
 */
const KEY_CHARACTER_FOLD = Object.freeze({
  ə: 'e', Ə: 'e',
  ı: 'i', I: 'i', İ: 'i',
  ş: 's', Ş: 's',
  ğ: 'g', Ğ: 'g',
  ç: 'c', Ç: 'c',
  ö: 'o', Ö: 'o',
  ü: 'u', Ü: 'u',
})

/**
 * Suggests a snake_case machine key from a human name.
 *
 * Only a suggestion: the editor keeps the key editable and validation is the
 * authority, because a name like "1st" cannot produce a valid key on its own.
 */
export const toKeySegment = (value, maxLength = MODEL_KEY_MAX_LENGTH) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[əƏıIİşŞğĞçÇöÖüÜ]/g, (char) => KEY_CHARACTER_FOLD[char] ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_{2,}/g, '_')
    .replace(/^[0-9_]+/, '')
    .slice(0, maxLength)
    .replace(/_+$/, '')

/** Appends `_2`, `_3`, … until the key is not in `takenKeys`. */
export const uniqueKey = (key, takenKeys = []) => {
  const taken = new Set(takenKeys)
  if (!taken.has(key)) {
    return key
  }

  let suffix = 2
  let candidate = `${key}_${suffix}`
  while (taken.has(candidate)) {
    suffix += 1
    candidate = `${key}_${suffix}`
  }

  return candidate
}

// ── Drafts ────────────────────────────────────────────────────────────────────

/**
 * Shape sent to the backend when creating a model.
 *
 * A new model starts with no fields: fields are added deliberately in the model
 * page, so nothing is invented on the user's behalf.
 */
export const buildModelDraft = ({ name = '', key = '', description = '' } = {}) => ({
  name: name.trim(),
  key: key.trim(),
  description: description.trim(),
  fields: [],
})

/** Only the identity a rename may change. Keeps PUT updates narrow on purpose. */
export const buildModelRename = ({ name = '', key = '' } = {}) => ({
  name: name.trim(),
  key: key.trim(),
})

/**
 * Draft for the duplicate action.
 *
 * Duplicate copies the shape, never the identity: the id is dropped and a free
 * key is derived from the models that already exist, so duplicating twice does
 * not produce two identical keys.
 */
export const buildModelDuplicateDraft = (model, existingModels = []) => {
  const takenKeys = existingModels
    .map((item) => item?.key)
    .filter(Boolean)

  const baseName = `${model?.name?.trim() || 'Model'}`
  const takenNames = new Set(
    existingModels.map((item) => item?.name).filter(Boolean),
  )

  let name = `${baseName} (2)`
  let counter = 2
  while (takenNames.has(name)) {
    counter += 1
    name = `${baseName} (${counter})`
  }

  const baseKey = toKeySegment(baseName) || 'model'
  return {
    ...buildModelDraft({ name, key: uniqueKey(baseKey, takenKeys) }),
    description: model?.description ?? '',
    fields: (model?.fields ?? []).map((field) => ({ ...field, id: null })),
  }
}

/**
 * Shape sent to the backend when saving one field.
 *
 * `defaultValue` stays a string so a future backend decides how to coerce it
 * per type. Select options are trimmed, de-duplicated and empty entries dropped.
 */
export const buildFieldDraft = ({
  name = '',
  key = '',
  type = DEFAULT_FIELD_TYPE,
  required = false,
  defaultValue = '',
  options = [],
  relation = null,
} = {}) => {
  const normalizedType = normalizeFieldType(type)
  const normalizedOptions = isSelectFieldType(normalizedType)
    ? [...new Set(
        (Array.isArray(options) ? options : String(options ?? '').split(','))
          .map((option) => String(option).trim())
          .filter(Boolean),
      )]
    : []

  return {
    name: name.trim(),
    key: key.trim(),
    type: normalizedType,
    required: Boolean(required),
    defaultValue: defaultValue === '' || defaultValue === null ? null : String(defaultValue),
    options: normalizedOptions,
    relation: normalizeRelation(relation),
  }
}

// ── Normalization ─────────────────────────────────────────────────────────────

/** Maps a raw field payload onto the DatabaseField typedef. */
export const normalizeDatabaseField = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const type = normalizeFieldType(raw.type)
  const options = Array.isArray(raw.options)
    ? raw.options.map((option) => String(option)).filter(Boolean)
    : []

  return {
    id: raw.id ?? null,
    name: raw.name ?? '',
    key: raw.key ?? '',
    type,
    required: Boolean(raw.required),
    defaultValue: raw.defaultValue ?? raw.default_value ?? null,
    options: isSelectFieldType(type) ? options : [],
    relation: normalizeRelation(raw.relation),
  }
}

/**
 * Maps a raw API response onto the DatabaseModel typedef.
 * Optional fields stay null rather than becoming empty strings, so the UI can
 * tell "not set" from "set to blank".
 */
export const normalizeDatabaseModel = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const fields = Array.isArray(raw.fields)
    ? raw.fields.map(normalizeDatabaseField).filter(Boolean)
    : []

  return {
    id: raw.id ?? null,
    name: raw.name ?? '',
    key: raw.key ?? '',
    description: raw.description ?? '',
    fields,
    createdAt: raw.createdAt ?? raw.created_at ?? null,
    updatedAt: raw.updatedAt ?? raw.updated_at ?? null,
  }
}

// ── Derived helpers ───────────────────────────────────────────────────────────

/** Case-insensitive match over a model's name and key. */
export const modelMatchesQuery = (model, query) => {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return (
    model?.name?.toLowerCase().includes(needle) ||
    model?.key?.toLowerCase().includes(needle)
  )
}

export const filterModels = (models, { query = '' } = {}) =>
  models.filter((model) => modelMatchesQuery(model, query))

/** Total field count across a model list, for the schema summary. */
export const countModelFields = (models) =>
  models.reduce((total, model) => total + (model?.fields?.length ?? 0), 0)

export const formatDatabaseDate = (value, locale) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)
}

export default normalizeDatabaseModel
