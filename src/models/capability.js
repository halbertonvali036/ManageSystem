/**
 * Capability model — reusable feature modules a workspace can switch on.
 *
 * ── What a capability is ──────────────────────────────────────────────────────
 *
 * A capability is a *declaration* of a frontend-ready module, not an
 * implementation of it. Most of them already exist somewhere in this product:
 * the forms builder, the auth pages, the database builder, the notification
 * centre, the media library, billing. A capability therefore does not re-implement
 * any of that — it records that the workspace has switched the module on and
 * points at the route that already works. The configuration foundation is
 * declared here, never faked.
 *
 * Rules enforced by this file:
 * - A capability is only ever returned when the backend actually sent a known id.
 * - `status` is derived from real data. There is no optimistic state: a capability
 *   that was never persisted is simply not in the list.
 * - `configuration` keys are declared here. An unknown key sent by a backend is
 *   dropped rather than stored, so the settings form always matches the schema.
 * - Nothing in this file persists anything, and no module reports usage numbers.
 */

/**
 * @typedef {Object} CapabilityConfigField
 * @property {string}  key          Machine key stored by the backend.
 * @property {'boolean'|'text'|'select'} type Control the settings form renders.
 * @property {string}  label        Translation key for the field label.
 * @property {string}  description  Translation key for the helper text.
 * @property {string[]} options     Allowed values, only for `select`.
 * @property {*}       defaultValue Suggested value. A suggestion, never a value.
 *
 * @typedef {Object} Capability
 * @property {string}      id          Stable module id, e.g. `database`.
 * @property {string}      name        User-facing name.
 * @property {string}      description What the module does.
 * @property {CapabilityStatus} status Availability, derived from real data.
 * @property {boolean}     enabled     Whether the workspace switched it on.
 * @property {Object}      configuration Saved settings, keyed by declared field.
 * @property {CapabilityConfigField[]} configFields The settings form schema.
 * @property {string|null}  modulePath  Route of the existing product module.
 * @property {boolean}     requiresIntegration True when no backend can satisfy it yet.
 * @property {string|null}  updatedAt  ISO 8601 timestamp.
 */

// ── Status vocabulary ─────────────────────────────────────────────────────────

/**
 * Status shown on a capability card.
 *
 * AVAILABLE  — the module exists in this product and can be switched on.
 * ENABLED    — the backend reported it switched on for this workspace.
 * DISABLED   — known and off.
 * INTEGRATION— the module needs a backend or third-party service that is not
 *              connected, so it is listed honestly instead of pretending to work.
 */
export const CAPABILITY_STATUS = Object.freeze({
  AVAILABLE: 'available',
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  REQUIRES_INTEGRATION: 'requires_integration',
})

export const CAPABILITY_STATUSES = Object.freeze(Object.values(CAPABILITY_STATUS))

/** Translation key for each status badge label. Never hard-coded in components. */
export const CAPABILITY_STATUS_LABEL_KEYS = Object.freeze({
  [CAPABILITY_STATUS.AVAILABLE]: 'workspaceCapabilities.status.available',
  [CAPABILITY_STATUS.ENABLED]: 'workspaceCapabilities.status.enabled',
  [CAPABILITY_STATUS.DISABLED]: 'workspaceCapabilities.status.disabled',
  [CAPABILITY_STATUS.REQUIRES_INTEGRATION]: 'workspaceCapabilities.status.requiresIntegration',
})

/** Shared badge variant for each status, so all cards speak the same language. */
export const CAPABILITY_STATUS_VARIANTS = Object.freeze({
  [CAPABILITY_STATUS.AVAILABLE]: 'available',
  [CAPABILITY_STATUS.ENABLED]: 'enabled',
  [CAPABILITY_STATUS.DISABLED]: 'disabled',
  [CAPABILITY_STATUS.REQUIRES_INTEGRATION]: 'integration',
})

export const isKnownCapabilityStatus = (status) => CAPABILITY_STATUSES.includes(status)

// ── Configuration field types ─────────────────────────────────────────────────

export const CAPABILITY_CONFIG_TYPE = Object.freeze({
  BOOLEAN: 'boolean',
  TEXT: 'text',
  SELECT: 'select',
})

// ── The catalog ───────────────────────────────────────────────────────────────

/**
 * The compact first-version catalog.
 *
 * `modulePath` is the important field: it names the product module that already
 * implements this capability, so enabling one never duplicates logic — the card
 * simply links to the real thing.
 */
const CAPABILITY_DEFINITIONS = [
  {
    id: 'forms',
    nameKey: 'workspaceCapabilities.catalog.forms.name',
    descriptionKey: 'workspaceCapabilities.catalog.forms.description',
    modulePath: 'sites',
    configFields: [
      {
        key: 'requireApproval',
        type: CAPABILITY_CONFIG_TYPE.BOOLEAN,
        label: 'workspaceCapabilities.catalog.forms.requireApproval',
        description: 'workspaceCapabilities.catalog.forms.requireApprovalHint',
        defaultValue: false,
      },
      {
        key: 'submitToInbox',
        type: CAPABILITY_CONFIG_TYPE.BOOLEAN,
        label: 'workspaceCapabilities.catalog.forms.submitToInbox',
        description: 'workspaceCapabilities.catalog.forms.submitToInboxHint',
        defaultValue: true,
      },
    ],
  },
  {
    id: 'auth',
    nameKey: 'workspaceCapabilities.catalog.auth.name',
    descriptionKey: 'workspaceCapabilities.catalog.auth.description',
    modulePath: 'security',
    requiresIntegration: true,
    configFields: [
      {
        key: 'allowSocialLogin',
        type: CAPABILITY_CONFIG_TYPE.BOOLEAN,
        label: 'workspaceCapabilities.catalog.auth.allowSocialLogin',
        description: 'workspaceCapabilities.catalog.auth.allowSocialLoginHint',
        defaultValue: false,
      },
      {
        key: 'sessionLengthDays',
        type: CAPABILITY_CONFIG_TYPE.SELECT,
        label: 'workspaceCapabilities.catalog.auth.sessionLength',
        description: 'workspaceCapabilities.catalog.auth.sessionLengthHint',
        options: ['1', '7', '30'],
        defaultValue: '7',
      },
    ],
  },
  {
    id: 'database',
    nameKey: 'workspaceCapabilities.catalog.database.name',
    descriptionKey: 'workspaceCapabilities.catalog.database.description',
    modulePath: 'database',
    configFields: [
      {
        key: 'allowPublicReads',
        type: CAPABILITY_CONFIG_TYPE.BOOLEAN,
        label: 'workspaceCapabilities.catalog.database.allowPublicReads',
        description: 'workspaceCapabilities.catalog.database.allowPublicReadsHint',
        defaultValue: false,
      },
    ],
  },
  {
    id: 'notifications',
    nameKey: 'workspaceCapabilities.catalog.notifications.name',
    descriptionKey: 'workspaceCapabilities.catalog.notifications.description',
    modulePath: 'notifications',
    requiresIntegration: true,
    configFields: [
      {
        key: 'emailChannel',
        type: CAPABILITY_CONFIG_TYPE.BOOLEAN,
        label: 'workspaceCapabilities.catalog.notifications.emailChannel',
        description: 'workspaceCapabilities.catalog.notifications.emailChannelHint',
        defaultValue: false,
      },
    ],
  },
  {
    id: 'media',
    nameKey: 'workspaceCapabilities.catalog.media.name',
    descriptionKey: 'workspaceCapabilities.catalog.media.description',
    modulePath: 'sites',
    requiresIntegration: true,
    configFields: [
      {
        key: 'maxUploadMb',
        type: CAPABILITY_CONFIG_TYPE.SELECT,
        label: 'workspaceCapabilities.catalog.media.maxUpload',
        description: 'workspaceCapabilities.catalog.media.maxUploadHint',
        options: ['5', '25', '100'],
        defaultValue: '25',
      },
    ],
  },
  {
    id: 'search',
    nameKey: 'workspaceCapabilities.catalog.search.name',
    descriptionKey: 'workspaceCapabilities.catalog.search.description',
    modulePath: 'database',
    requiresIntegration: true,
    configFields: [
      {
        key: 'indexModels',
        type: CAPABILITY_CONFIG_TYPE.BOOLEAN,
        label: 'workspaceCapabilities.catalog.search.indexModels',
        description: 'workspaceCapabilities.catalog.search.indexModelsHint',
        defaultValue: false,
      },
    ],
  },
  {
    id: 'api',
    nameKey: 'workspaceCapabilities.catalog.api.name',
    descriptionKey: 'workspaceCapabilities.catalog.api.description',
    modulePath: 'settings',
    requiresIntegration: true,
    configFields: [
      {
        key: 'publicApi',
        type: CAPABILITY_CONFIG_TYPE.BOOLEAN,
        label: 'workspaceCapabilities.catalog.api.publicApi',
        description: 'workspaceCapabilities.catalog.api.publicApiHint',
        defaultValue: false,
      },
    ],
  },
  {
    id: 'payments',
    nameKey: 'workspaceCapabilities.catalog.payments.name',
    descriptionKey: 'workspaceCapabilities.catalog.payments.description',
    modulePath: 'billing',
    requiresIntegration: true,
    configFields: [
      {
        key: 'currency',
        type: CAPABILITY_CONFIG_TYPE.SELECT,
        label: 'workspaceCapabilities.catalog.payments.currency',
        description: 'workspaceCapabilities.catalog.payments.currencyHint',
        options: ['AZN', 'USD', 'EUR'],
        defaultValue: 'AZN',
      },
    ],
  },
]

/** Catalog ids in display order. */
export const CAPABILITY_IDS = Object.freeze(
  CAPABILITY_DEFINITIONS.map((definition) => definition.id),
)

const DEFINITIONS_BY_ID = Object.freeze(
  Object.fromEntries(CAPABILITY_DEFINITIONS.map((definition) => [definition.id, definition])),
)

export const isKnownCapability = (id) => Object.hasOwn(DEFINITIONS_BY_ID, id)

export const getCapabilityDefinition = (id) => DEFINITIONS_BY_ID[id] ?? null

/** Config form schema for one capability, or an empty list. */
export const getCapabilityConfigFields = (id) =>
  Object.freeze([...(DEFINITIONS_BY_ID[id]?.configFields ?? [])])

// ── Normalization ─────────────────────────────────────────────────────────────

const readBoolean = (payload, ...keys) => {
  for (const key of keys) {
    const value = payload?.[key]
    if (typeof value === 'boolean') return value
  }
  return null
}

const readString = (payload, ...keys) => {
  for (const key of keys) {
    const value = payload?.[key]
    if (typeof value === 'string' && value.trim()) return value
  }
  return null
}

/**
 * Keeps only the configuration keys this catalog declares.
 *
 * Defaults are *not* applied here: a value the backend never sent stays absent, so
 * the settings form can show "not set" rather than claim a saved value.
 */
export const normalizeCapabilityConfig = (raw, configFields = []) => {
  if (!raw || typeof raw !== 'object') {
    return {}
  }

  const config = {}
  for (const field of configFields) {
    const value = raw[field.key]

    if (field.type === CAPABILITY_CONFIG_TYPE.BOOLEAN) {
      if (typeof value === 'boolean') config[field.key] = value
      continue
    }

    if (typeof value === 'string' && value.trim()) {
      // A value outside the declared options is dropped rather than stored, so
      // the form can never offer something the schema does not allow.
      if (!field.options || field.options.includes(value)) {
        config[field.key] = value
      }
    }
  }

  return config
}

/**
 * Maps a raw API record onto a Capability.
 *
 * Returns null for an unknown id or a non-object payload: a capability the
 * catalog does not declare is not something this frontend can enable, configure
 * or link to, so it is not shown at all.
 *
 * `name` and `description` are translation keys, not sentences. This file stays
 * locale-free and the UI resolves them with the active language, the same way
 * field types and relation kinds already do.
 */
export const normalizeCapability = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const id = readString(raw, 'id', 'key', 'capability')
  if (!id || !isKnownCapability(id)) {
    return null
  }

  const definition = DEFINITIONS_BY_ID[id]
  const enabled = readBoolean(raw, 'enabled', 'isEnabled', 'is_enabled') ?? false
  const requiresIntegration = Boolean(definition.requiresIntegration)

  return {
    id,
    nameKey: definition.nameKey,
    descriptionKey: definition.descriptionKey,
    modulePath: definition.modulePath,
    requiresIntegration,
    // An undeclared backend status is ignored: status is derived, never trusted.
    status: isKnownCapabilityStatus(raw.status)
      ? raw.status
      : deriveCapabilityStatus(enabled, requiresIntegration),
    enabled,
    configuration: normalizeCapabilityConfig(raw.config ?? raw.configuration, definition.configFields),
    configFields: getCapabilityConfigFields(id),
    updatedAt: readString(raw, 'updatedAt', 'updated_at'),
  }
}

/**
 * The status a capability shows when the backend did not send one.
 *
 * Integration-gated modules read as `requires_integration` whether or not they
 * are on, because the missing piece is the integration — not the switch.
 */
export const deriveCapabilityStatus = (enabled, requiresIntegration) => {
  if (enabled) return CAPABILITY_STATUS.ENABLED
  return requiresIntegration ? CAPABILITY_STATUS.REQUIRES_INTEGRATION : CAPABILITY_STATUS.AVAILABLE
}

/** Maps a backend list onto known capabilities, dropping unknown ids. */
export const normalizeCapabilityList = (items) => {
  if (!Array.isArray(items)) return []
  return items.map(normalizeCapability).filter(Boolean)
}

/**
 * Fills gaps in a partially-loaded list from the catalog.
 *
 * A capability the backend has not mentioned yet is still shown, as *available* and
 * disabled — the catalog is known code. Its `enabled` flag stays false, so nothing
 * here can claim a module was switched on.
 */
export const withCatalogCapabilities = (capabilities = []) => {
  const byId = new Map(capabilities.map((capability) => [capability.id, capability]))

  return CAPABILITY_IDS.map((id) => {
    const loaded = byId.get(id)
    if (loaded) return loaded

    // Catalog entry the backend has not mentioned: shown as available, off.
    return normalizeCapability({ id, enabled: false })
  })
}

// ── Search / filter ───────────────────────────────────────────────────────────

/** Case-insensitive match on id, name and description. */
export const capabilityMatchesQuery = (capability, query, labels = {}) => {
  const needle = query.trim().toLowerCase()
  if (!needle) return true

  return [capability.id, labels.name, labels.description]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(needle))
}

export const CAPABILITY_FILTER_ALL = 'all'

/**
 * Filters the loaded list.
 *
 * `labels` carries the resolved name and description for one capability, so the
 * search matches what the user can actually see. Nothing here queries the server.
 */
export const filterCapabilities = (
  capabilities = [],
  { query = '', status = CAPABILITY_FILTER_ALL } = {},
  getLabels = () => ({}),
) =>
  capabilities.filter((capability) => {
    const matchesStatus =
      status === CAPABILITY_FILTER_ALL || capability.status === status
    return matchesStatus && capabilityMatchesQuery(capability, query, getLabels(capability))
  })

/** Counts per status, for the filter summary. Derived from loaded rows only. */
export const countCapabilitiesByStatus = (capabilities = []) => {
  const counts = Object.fromEntries(CAPABILITY_STATUSES.map((status) => [status, 0]))
  for (const capability of capabilities) {
    if (counts[capability.status] !== undefined) {
      counts[capability.status] += 1
    }
  }
  return counts
}

// ── Drafts ────────────────────────────────────────────────────────────────────

/** Form inputs for the settings view: the saved value, or the suggested default. */
export const toCapabilityConfigInputs = (capability) => {
  const inputs = {}

  for (const field of capability?.configFields ?? []) {
    const saved = capability?.configuration?.[field.key]
    const value = saved === undefined ? field.defaultValue : saved
    inputs[field.key] = field.type === CAPABILITY_CONFIG_TYPE.BOOLEAN ? Boolean(value) : String(value ?? '')
  }

  return inputs
}

/**
 * Validates the settings form and builds the payload.
 *
 * Every declared field is visited, so a select that was left out cannot be
 * submitted silently. Returns an empty `config` when nothing was set — an absent
 * value is not the same as a saved `false`.
 */
export const buildCapabilityConfigDraft = (inputs = {}, configFields = []) => {
  const config = {}
  const errors = {}

  for (const field of configFields) {
    const input = inputs?.[field.key]

    if (field.type === CAPABILITY_CONFIG_TYPE.BOOLEAN) {
      if (typeof input === 'boolean') config[field.key] = input
      continue
    }

    const value = typeof input === 'string' ? input.trim() : ''

    if (!value) {
      errors[field.key] = 'required'
      continue
    }

    if (field.options && !field.options.includes(value)) {
      errors[field.key] = 'option'
      continue
    }

    config[field.key] = value
  }

  return { config, errors, isValid: Object.keys(errors).length === 0 }
}

/** True when the draft differs from what the backend last reported. */
export const hasCapabilityConfigChanges = (inputs = {}, capability) => {
  if (!capability) return false
  return capability.configFields.some((field) => {
    const input = inputs?.[field.key]
    const saved = capability.configuration?.[field.key]
    return field.type === CAPABILITY_CONFIG_TYPE.BOOLEAN
      ? typeof input === 'boolean' && input !== (saved ?? false)
      : String(input ?? '') !== String(saved ?? '')
  })
}
