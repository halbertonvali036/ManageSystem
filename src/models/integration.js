/**
 * Integration model — external services a workspace can connect.
 *
 * ── What an integration is ────────────────────────────────────────────────────
 *
 * An integration is a *declaration* of an external service, not a working
 * connection. The catalog lists what the product knows how to talk to; the
 * backend decides which of them are actually connected. Nothing in this file
 * performs a handshake, holds a credential, or reports a live status on its own.
 *
 * Rules enforced by this file:
 * - An integration is only ever returned when the backend actually sent a known id.
 * - `status` is derived from real data. `connected` is only ever reached from a
 *   backend payload that says so — never from a local toggle.
 * - `configuration` keys are declared here. An unknown key sent by a backend is
 *   dropped rather than stored, so the config form always matches the schema.
 * - Secrets are never modelled as values. A field can be declared as a secret so
 *   the form can render a masked input, but the value is never read back, never
 *   compared, and never written to storage by this file.
 *
 * ── Reuse over duplication ────────────────────────────────────────────────────
 *
 * Integrations deliberately do not re-implement product modules. Where a
 * capability already owns a feature, the integration names the module it feeds
 * (`modulePath`) so the UI links to the real thing: billing, notifications,
 * media, security. See `WORKSPACE_MODULE_PATHS` in `utils/constants.js`.
 */

// ── Status vocabulary ─────────────────────────────────────────────────────────

/**
 * Status shown on an integration card.
 *
 * AVAILABLE           — the product knows this service, but nothing is connected.
 * CONNECTED           — the backend reported an active connection. Real data only.
 * NOT_CONNECTED       — the backend reported the integration as present but off.
 * REQUIRES_CONFIG     — a connection was started but required fields are missing,
 *                        so it is not usable yet.
 */
export const INTEGRATION_STATUS = Object.freeze({
  AVAILABLE: 'available',
  CONNECTED: 'connected',
  NOT_CONNECTED: 'not_connected',
  REQUIRES_CONFIG: 'requires_config',
})

export const INTEGRATION_STATUSES = Object.freeze(Object.values(INTEGRATION_STATUS))

/** Translation key for each status badge label. Never hard-coded in components. */
export const INTEGRATION_STATUS_LABEL_KEYS = Object.freeze({
  [INTEGRATION_STATUS.AVAILABLE]: 'workspaceIntegrations.status.available',
  [INTEGRATION_STATUS.CONNECTED]: 'workspaceIntegrations.status.connected',
  [INTEGRATION_STATUS.NOT_CONNECTED]: 'workspaceIntegrations.status.notConnected',
  [INTEGRATION_STATUS.REQUIRES_CONFIG]: 'workspaceIntegrations.status.requiresConfig',
})

/** Shared badge variant for each status, so all cards speak the same language. */
export const INTEGRATION_STATUS_VARIANTS = Object.freeze({
  [INTEGRATION_STATUS.AVAILABLE]: 'available',
  [INTEGRATION_STATUS.CONNECTED]: 'connected',
  [INTEGRATION_STATUS.NOT_CONNECTED]: 'notConnected',
  [INTEGRATION_STATUS.REQUIRES_CONFIG]: 'requiresConfig',
})

export const isKnownIntegrationStatus = (status) => INTEGRATION_STATUSES.includes(status)

// ── Categories ────────────────────────────────────────────────────────────────

/**
 * The category a service belongs to. Used for grouping and filtering, never for
 * deciding behaviour.
 */
export const INTEGRATION_CATEGORY = Object.freeze({
  EMAIL: 'email',
  ANALYTICS: 'analytics',
  PAYMENTS: 'payments',
  STORAGE: 'storage',
  API: 'api',
  AUTHENTICATION: 'authentication',
  AUTOMATION: 'automation',
})

export const INTEGRATION_CATEGORIES = Object.freeze(Object.values(INTEGRATION_CATEGORY))

/** Translation key for each category chip. */
export const INTEGRATION_CATEGORY_LABEL_KEYS = Object.freeze(
  Object.fromEntries(
    INTEGRATION_CATEGORIES.map((category) => [
      category,
      `workspaceIntegrations.category.${category}`,
    ])
  )
)

export const isKnownIntegrationCategory = (category) =>
  INTEGRATION_CATEGORIES.includes(category)

// ── Config field types ────────────────────────────────────────────────────────

export const INTEGRATION_CONFIG_TYPE = Object.freeze({
  BOOLEAN: 'boolean',
  TEXT: 'text',
  SELECT: 'select',
  /**
   * A write-only secret.
   *
   * The form renders a masked input that starts empty on every open and is never
   * echoed back from the backend. The browser never keeps the value after save.
   */
  SECRET: 'secret',
  /**
   * A credential the backend stores and shows only masked ("••••1234"). The
   * frontend can tell the user one is set, but it can never read it.
   */
  STORED_SECRET: 'storedSecret',
})

/** Field types whose value must never be persisted or displayed back. */
export const INTEGRATION_SENSITIVE_CONFIG_TYPES = Object.freeze([
  INTEGRATION_CONFIG_TYPE.SECRET,
  INTEGRATION_CONFIG_TYPE.STORED_SECRET,
])

const isSensitiveConfigType = (type) => INTEGRATION_SENSITIVE_CONFIG_TYPES.includes(type)

/**
 * @typedef {Object} IntegrationConfigField
 * @property {string}  key          Machine key stored by the backend.
 * @property {'boolean'|'text'|'select'|'secret'|'storedSecret'} type Control to render.
 * @property {boolean} [required]   Blocks `connect` until it holds a value.
 * @property {string}  label        Translation key for the field label.
 * @property {string}  description  Translation key for the helper text.
 * @property {string[]} options     Allowed values, only for `select`.
 * @property {*}       defaultValue Suggested value. A suggestion, never a saved value.
 *
 * @typedef {Object} Integration
 * @property {string}       id          Stable service id, e.g. `payments-stripe`.
 * @property {string}       nameKey     Translation key for the display name.
 * @property {string}       descriptionKey Translation key for what it does.
 * @property {string}       category    One of INTEGRATION_CATEGORY.
 * @property {IntegrationStatus} status Availability, derived from real data.
 * @property {boolean}      connected   Only ever true from a backend payload.
 * @property {Object}       configuration Saved settings. Secrets are markers only.
 * @property {IntegrationConfigField[]} configFields The config form schema.
 * @property {string|null}  modulePath  Route of the existing product module it feeds.
 * @property {boolean}      requiresBackend True until the backend contract exists.
 * @property {string|null}  connectedAt ISO 8601 timestamp.
 * @property {string|null}  updatedAt   ISO 8601 timestamp.
 */

// ── The catalog ───────────────────────────────────────────────────────────────

/**
 * The compact first-version catalog.
 *
 * `modulePath` is the important field: it names the product module this service
 * feeds, so the card links to the real feature instead of duplicating it.
 * `requiresBackend` marks a service that cannot be exercised until the backend
 * contract exists — shown honestly rather than pretended.
 */
const INTEGRATION_DEFINITIONS = [
  {
    id: 'email-resend',
    category: INTEGRATION_CATEGORY.EMAIL,
    nameKey: 'workspaceIntegrations.catalog.emailResend.name',
    descriptionKey: 'workspaceIntegrations.catalog.emailResend.description',
    modulePath: 'notifications',
    requiresBackend: true,
    configFields: [
      {
        key: 'apiKey',
        type: INTEGRATION_CONFIG_TYPE.STORED_SECRET,
        required: true,
        label: 'workspaceIntegrations.catalog.emailResend.apiKey',
        description: 'workspaceIntegrations.catalog.emailResend.apiKeyHint',
      },
      {
        key: 'fromAddress',
        type: INTEGRATION_CONFIG_TYPE.TEXT,
        required: true,
        label: 'workspaceIntegrations.catalog.emailResend.fromAddress',
        description: 'workspaceIntegrations.catalog.emailResend.fromAddressHint',
      },
    ],
  },
  {
    id: 'analytics-ga4',
    category: INTEGRATION_CATEGORY.ANALYTICS,
    nameKey: 'workspaceIntegrations.catalog.analyticsGa4.name',
    descriptionKey: 'workspaceIntegrations.catalog.analyticsGa4.description',
    modulePath: 'sites',
    requiresBackend: true,
    configFields: [
      {
        key: 'measurementId',
        type: INTEGRATION_CONFIG_TYPE.TEXT,
        required: true,
        label: 'workspaceIntegrations.catalog.analyticsGa4.measurementId',
        description: 'workspaceIntegrations.catalog.analyticsGa4.measurementIdHint',
      },
      {
        key: 'trackPageViews',
        type: INTEGRATION_CONFIG_TYPE.BOOLEAN,
        label: 'workspaceIntegrations.catalog.analyticsGa4.trackPageViews',
        description: 'workspaceIntegrations.catalog.analyticsGa4.trackPageViewsHint',
        defaultValue: true,
      },
    ],
  },
  {
    id: 'payments-stripe',
    category: INTEGRATION_CATEGORY.PAYMENTS,
    nameKey: 'workspaceIntegrations.catalog.paymentsStripe.name',
    descriptionKey: 'workspaceIntegrations.catalog.paymentsStripe.description',
    modulePath: 'billing',
    requiresBackend: true,
    configFields: [
      {
        key: 'publishableKey',
        type: INTEGRATION_CONFIG_TYPE.TEXT,
        required: true,
        label: 'workspaceIntegrations.catalog.paymentsStripe.publishableKey',
        description: 'workspaceIntegrations.catalog.paymentsStripe.publishableKeyHint',
      },
      {
        key: 'secretKey',
        type: INTEGRATION_CONFIG_TYPE.STORED_SECRET,
        required: true,
        label: 'workspaceIntegrations.catalog.paymentsStripe.secretKey',
        description: 'workspaceIntegrations.catalog.paymentsStripe.secretKeyHint',
      },
      {
        key: 'currency',
        type: INTEGRATION_CONFIG_TYPE.SELECT,
        label: 'workspaceIntegrations.catalog.paymentsStripe.currency',
        description: 'workspaceIntegrations.catalog.paymentsStripe.currencyHint',
        options: ['AZN', 'USD', 'EUR'],
        defaultValue: 'AZN',
      },
    ],
  },
  {
    id: 'storage-s3',
    category: INTEGRATION_CATEGORY.STORAGE,
    nameKey: 'workspaceIntegrations.catalog.storageS3.name',
    descriptionKey: 'workspaceIntegrations.catalog.storageS3.description',
    modulePath: 'sites',
    requiresBackend: true,
    configFields: [
      {
        key: 'bucket',
        type: INTEGRATION_CONFIG_TYPE.TEXT,
        required: true,
        label: 'workspaceIntegrations.catalog.storageS3.bucket',
        description: 'workspaceIntegrations.catalog.storageS3.bucketHint',
      },
      {
        key: 'region',
        type: INTEGRATION_CONFIG_TYPE.SELECT,
        label: 'workspaceIntegrations.catalog.storageS3.region',
        description: 'workspaceIntegrations.catalog.storageS3.regionHint',
        options: ['eu-central-1', 'us-east-1', 'ap-southeast-1'],
        defaultValue: 'eu-central-1',
      },
      {
        key: 'accessKeyId',
        type: INTEGRATION_CONFIG_TYPE.SECRET,
        required: true,
        label: 'workspaceIntegrations.catalog.storageS3.accessKeyId',
        description: 'workspaceIntegrations.catalog.storageS3.accessKeyIdHint',
      },
      {
        key: 'secretAccessKey',
        type: INTEGRATION_CONFIG_TYPE.SECRET,
        required: true,
        label: 'workspaceIntegrations.catalog.storageS3.secretAccessKey',
        description: 'workspaceIntegrations.catalog.storageS3.secretAccessKeyHint',
      },
    ],
  },
  {
    id: 'api-webhooks',
    category: INTEGRATION_CATEGORY.API,
    nameKey: 'workspaceIntegrations.catalog.apiWebhooks.name',
    descriptionKey: 'workspaceIntegrations.catalog.apiWebhooks.description',
    modulePath: 'settings',
    requiresBackend: true,
    configFields: [
      {
        key: 'outboundUrl',
        type: INTEGRATION_CONFIG_TYPE.TEXT,
        required: true,
        label: 'workspaceIntegrations.catalog.apiWebhooks.outboundUrl',
        description: 'workspaceIntegrations.catalog.apiWebhooks.outboundUrlHint',
      },
      {
        key: 'signingSecret',
        type: INTEGRATION_CONFIG_TYPE.STORED_SECRET,
        label: 'workspaceIntegrations.catalog.apiWebhooks.signingSecret',
        description: 'workspaceIntegrations.catalog.apiWebhooks.signingSecretHint',
      },
    ],
  },
  {
    id: 'auth-google',
    category: INTEGRATION_CATEGORY.AUTHENTICATION,
    nameKey: 'workspaceIntegrations.catalog.authGoogle.name',
    descriptionKey: 'workspaceIntegrations.catalog.authGoogle.description',
    modulePath: 'security',
    requiresBackend: true,
    configFields: [
      {
        key: 'clientId',
        type: INTEGRATION_CONFIG_TYPE.TEXT,
        required: true,
        label: 'workspaceIntegrations.catalog.authGoogle.clientId',
        description: 'workspaceIntegrations.catalog.authGoogle.clientIdHint',
      },
      {
        key: 'clientSecret',
        type: INTEGRATION_CONFIG_TYPE.STORED_SECRET,
        required: true,
        label: 'workspaceIntegrations.catalog.authGoogle.clientSecret',
        description: 'workspaceIntegrations.catalog.authGoogle.clientSecretHint',
      },
      {
        key: 'redirectUri',
        type: INTEGRATION_CONFIG_TYPE.TEXT,
        required: true,
        label: 'workspaceIntegrations.catalog.authGoogle.redirectUri',
        description: 'workspaceIntegrations.catalog.authGoogle.redirectUriHint',
      },
    ],
  },
  {
    id: 'automation-webhook',
    category: INTEGRATION_CATEGORY.AUTOMATION,
    nameKey: 'workspaceIntegrations.catalog.automationWebhook.name',
    descriptionKey: 'workspaceIntegrations.catalog.automationWebhook.description',
    modulePath: 'settings',
    requiresBackend: true,
    configFields: [
      {
        key: 'triggerUrl',
        type: INTEGRATION_CONFIG_TYPE.TEXT,
        required: true,
        label: 'workspaceIntegrations.catalog.automationWebhook.triggerUrl',
        description: 'workspaceIntegrations.catalog.automationWebhook.triggerUrlHint',
      },
      {
        key: 'enabled',
        type: INTEGRATION_CONFIG_TYPE.BOOLEAN,
        label: 'workspaceIntegrations.catalog.automationWebhook.enabled',
        description: 'workspaceIntegrations.catalog.automationWebhook.enabledHint',
        defaultValue: false,
      },
    ],
  },
]

/** Catalog ids in display order. */
export const INTEGRATION_IDS = Object.freeze(
  INTEGRATION_DEFINITIONS.map((definition) => definition.id)
)

const DEFINITIONS_BY_ID = Object.freeze(
  Object.fromEntries(
    INTEGRATION_DEFINITIONS.map((definition) => [definition.id, definition])
  )
)

export const isKnownIntegration = (id) => Object.hasOwn(DEFINITIONS_BY_ID, id)

export const getIntegrationDefinition = (id) => DEFINITIONS_BY_ID[id] ?? null

/** Config form schema for one integration, or an empty list. */
export const getIntegrationConfigFields = (id) =>
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
 * Secret fields are treated specially: a backend can only report *that* a stored
 * secret exists, never its value, so those keys are reduced to a boolean marker
 * and the raw value is discarded here. Defaults are not applied — an unsent value
 * stays absent so the form can show "not set" instead of claiming a saved value.
 */
export const normalizeIntegrationConfig = (raw, configFields = []) => {
  if (!raw || typeof raw !== 'object') {
    return {}
  }

  const config = {}
  for (const field of configFields) {
    const value = raw[field.key]

    if (field.type === INTEGRATION_CONFIG_TYPE.BOOLEAN) {
      if (typeof value === 'boolean') config[field.key] = value
      continue
    }

    // A stored secret is a marker, never a value. Keep only its presence.
    if (field.type === INTEGRATION_CONFIG_TYPE.STORED_SECRET) {
      if (value === true || (typeof value === 'string' && value.trim())) {
        config[field.key] = true
      }
      continue
    }

    // A write-only secret is never accepted back from the server.
    if (field.type === INTEGRATION_CONFIG_TYPE.SECRET) {
      continue
    }

    if (typeof value === 'string' && value.trim()) {
      // A value outside the declared options is dropped rather than stored.
      if (!field.options || field.options.includes(value)) {
        config[field.key] = value
      }
    }
  }

  return config
}

/**
 * Maps a raw API record onto an Integration.
 *
 * Returns null for an unknown id or a non-object payload: a service the catalog
 * does not declare is not something this frontend can connect or configure, so
 * it is not shown at all.
 *
 * `name` and `description` are translation keys, not sentences. This file stays
 * locale-free and the UI resolves them with the active language.
 */
export const normalizeIntegration = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const id = readString(raw, 'id', 'key', 'integration')
  if (!id || !isKnownIntegration(id)) {
    return null
  }

  const definition = DEFINITIONS_BY_ID[id]
  const category = isKnownIntegrationCategory(definition.category)
    ? definition.category
    : INTEGRATION_CATEGORY.API

  // Only the backend can report a connection. `connected` is taken from a declared
  // backend status; when none is sent it is derived, never assumed.
  const declaredStatus = isKnownIntegrationStatus(raw.status)
    ? raw.status
    : null
  const connected =
    declaredStatus === INTEGRATION_STATUS.CONNECTED ||
    readBoolean(raw, 'connected', 'isConnected', 'is_connected') === true

  return {
    id,
    nameKey: definition.nameKey,
    descriptionKey: definition.descriptionKey,
    category,
    modulePath: definition.modulePath,
    requiresBackend: Boolean(definition.requiresBackend),
    status: declaredStatus ?? deriveIntegrationStatus(connected, definition.configFields, raw),
    connected,
    configuration: normalizeIntegrationConfig(
      raw.config ?? raw.configuration,
      definition.configFields
    ),
    configFields: getIntegrationConfigFields(id),
    connectedAt: readString(raw, 'connectedAt', 'connected_at'),
    updatedAt: readString(raw, 'updatedAt', 'updated_at'),
  }
}

/**
 * The status an integration shows when the backend did not send one.
 *
 * A connected service is `connected`; a service that still has required fields
 * unset is `requires_config`; anything else is simply `available`. A service that
 * the backend explicitly marked present but off stays `not_connected` via the
 * declared status path above.
 */
export const deriveIntegrationStatus = (connected, configFields = [], raw = null) => {
  if (connected) return INTEGRATION_STATUS.CONNECTED

  // `requires_config` and `not_connected` both describe a connection record the
  // backend already knows about. Without that record the honest answer is
  // `available`: nothing has been started, so there is nothing to complete.
  const declaredPresence = readBoolean(raw, 'exists', 'present', 'hasConnection')
  if (declaredPresence !== true) return INTEGRATION_STATUS.AVAILABLE

  // Only fields the backend can report on count here. A write-only secret is
  // never echoed back, so it can never look satisfied and must not pin the status
  // to `requires_config` forever — the backend reports those as a stored marker.
  const missingRequired = (configFields ?? []).some(
    (field) =>
      field.required &&
      field.type !== INTEGRATION_CONFIG_TYPE.SECRET &&
      !hasConfigValue(field, raw?.config ?? raw?.configuration)
  )
  return missingRequired ? INTEGRATION_STATUS.REQUIRES_CONFIG : INTEGRATION_STATUS.NOT_CONNECTED
}

/** True when a field holds a usable value in a raw config payload. */
const hasConfigValue = (field, config) => {
  const value = config?.[field.key]

  if (field.type === INTEGRATION_CONFIG_TYPE.BOOLEAN) {
    return typeof value === 'boolean'
  }
  if (field.type === INTEGRATION_CONFIG_TYPE.STORED_SECRET) {
    return value === true || (typeof value === 'string' && value.trim().length > 0)
  }
  // A write-only secret is never readable, so its presence cannot be confirmed
  // from the server and it does not block the status derivation.
  if (field.type === INTEGRATION_CONFIG_TYPE.SECRET) {
    return false
  }
  return typeof value === 'string' && value.trim().length > 0
}

/** Maps a backend list onto known integrations, dropping unknown ids. */
export const normalizeIntegrationList = (items) => {
  if (!Array.isArray(items)) return []
  return items.map(normalizeIntegration).filter(Boolean)
}

/**
 * Fills gaps in a partially-loaded list from the catalog.
 *
 * An integration the backend has not mentioned yet is still shown, as *available*
 * and not connected. Nothing here can claim a service is connected.
 */
export const withCatalogIntegrations = (integrations = []) => {
  const byId = new Map(integrations.map((integration) => [integration.id, integration]))

  return INTEGRATION_IDS.map((id) => {
    const loaded = byId.get(id)
    if (loaded) return loaded

    // Catalog entry the backend has not mentioned: available, not connected.
    return normalizeIntegration({ id })
  })
}

// ── Search / filter / group ───────────────────────────────────────────────────

/** Case-insensitive match on id, name and description. */
export const integrationMatchesQuery = (integration, query, labels = {}) => {
  const needle = query.trim().toLowerCase()
  if (!needle) return true

  return [integration.id, labels.name, labels.description, integration.category]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(needle))
}

export const INTEGRATION_FILTER_ALL = 'all'

/**
 * Filters the loaded list by status, category and search term.
 *
 * `labels` carries the resolved name and description for one integration, so the
 * search matches what the user can actually see. Nothing here queries the server.
 */
export const filterIntegrations = (
  integrations = [],
  { query = '', status = INTEGRATION_FILTER_ALL, category = INTEGRATION_FILTER_ALL } = {},
  getLabels = () => ({})
) =>
  integrations.filter((integration) => {
    const matchesStatus =
      status === INTEGRATION_FILTER_ALL || integration.status === status
    const matchesCategory =
      category === INTEGRATION_FILTER_ALL || integration.category === category
    return (
      matchesStatus &&
      matchesCategory &&
      integrationMatchesQuery(integration, query, getLabels(integration))
    )
  })

/** Counts per status, for the filter summary. Derived from loaded rows only. */
export const countIntegrationsByStatus = (integrations = []) => {
  const counts = Object.fromEntries(
    INTEGRATION_STATUSES.map((status) => [status, 0])
  )
  for (const integration of integrations) {
    if (counts[integration.status] !== undefined) {
      counts[integration.status] += 1
    }
  }
  return counts
}

/** Groups integrations by category, preserving catalog order within each group. */
export const groupIntegrationsByCategory = (integrations = []) => {
  const groups = new Map()

  for (const integration of integrations) {
    if (!groups.has(integration.category)) groups.set(integration.category, [])
    groups.get(integration.category).push(integration)
  }

  return INTEGRATION_CATEGORIES.filter((category) => groups.has(category)).map(
    (category) => ({ category, integrations: groups.get(category) })
  )
}

// ── Drafts ────────────────────────────────────────────────────────────────────

/**
 * Form inputs for the detail view.
 *
 * A stored secret starts as an empty string, not as a masked value: the frontend
 * never receives one. A boolean is prefilled from the saved value, otherwise from
 * the declared default.
 */
export const toIntegrationConfigInputs = (integration) => {
  const inputs = {}

  for (const field of integration?.configFields ?? []) {
    if (isSensitiveConfigType(field.type)) {
      // Always blank. The saved marker decides whether the user must retype it.
      inputs[field.key] = ''
      continue
    }

    const saved = integration?.configuration?.[field.key]
    const value = saved === undefined ? field.defaultValue : saved
    inputs[field.key] =
      field.type === INTEGRATION_CONFIG_TYPE.BOOLEAN ? Boolean(value) : String(value ?? '')
  }

  return inputs
}

/**
 * Validates the config form and builds the payload.
 *
 * Secret fields are only included when the user actually typed something new, so
 * saving the form never re-sends a value the browser no longer holds. Returns an
 * empty `config` when nothing was set — an absent value is not the same as a
 * saved `false`.
 */
export const buildIntegrationConfigDraft = (inputs = {}, configFields = []) => {
  const config = {}
  const errors = {}
  const secretKeys = []

  for (const field of configFields) {
    const input = inputs?.[field.key]

    if (field.type === INTEGRATION_CONFIG_TYPE.BOOLEAN) {
      if (typeof input === 'boolean') config[field.key] = input
      continue
    }

    // A write-only secret: only sent when newly typed, never read back.
    if (field.type === INTEGRATION_CONFIG_TYPE.SECRET) {
      const value = typeof input === 'string' ? input.trim() : ''
      if (value) {
        config[field.key] = value
        secretKeys.push(field.key)
      }
      continue
    }

    // A stored secret is not editable from the form; its marker is never sent back.
    if (field.type === INTEGRATION_CONFIG_TYPE.STORED_SECRET) {
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

  return { config, errors, secretKeys, isValid: Object.keys(errors).length === 0 }
}

/** True when the draft differs from what the backend last reported. */
export const hasIntegrationConfigChanges = (inputs = {}, integration) => {
  if (!integration) return false

  return integration.configFields.some((field) => {
    const input = inputs?.[field.key]

    if (isSensitiveConfigType(field.type)) {
      // A secret changed only when the user typed a new value.
      return typeof input === 'string' && input.trim().length > 0
    }

    const saved = integration.configuration?.[field.key]
    return field.type === INTEGRATION_CONFIG_TYPE.BOOLEAN
      ? typeof input === 'boolean' && input !== (saved ?? false)
      : String(input ?? '') !== String(saved ?? '')
  })
}

/**
 * Which declared fields a form is still missing, for the detail view summary.
 *
 * A write-only secret is excluded: the backend never sends it back, so the frontend
 * cannot tell whether one is stored. The form asks for it again instead of claiming
 * it is missing or already set.
 */
export const getMissingConfigFields = (integration) => {
  if (!integration) return []

  return integration.configFields.filter(
    (field) =>
      field.required &&
      field.type !== INTEGRATION_CONFIG_TYPE.SECRET &&
      !hasConfigValue(field, integration.configuration)
  )
}
