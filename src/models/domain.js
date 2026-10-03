/**
 * Domain model — custom domains and the platform subdomain for a workspace.
 *
 * ── What a domain is here ─────────────────────────────────────────────────────
 *
 * A domain row is a *record the backend owns*. This file describes the states such
 * a record can be in and the DNS instructions that let someone point a name at the
 * platform. It does not perform DNS lookups, does not verify anything and does not
 * issue a certificate.
 *
 * Rules enforced by this file:
 * - A domain is only ever returned when the backend actually sent it. An empty list
 *   is the honest answer when no backend is connected, and the UI says so.
 * - Verification and SSL states come from the backend. `connected` is never derived
 *   from a hostname that merely looks right, and SSL is never reported as active
 *   without a backend state saying so.
 * - The platform subdomain is a projection of the workspace, not a stored record.
 *   It is never verified, never given DNS records and never faked as connected.
 * - No DNS value is invented. `dnsRecords` is an empty list until the backend
 *   supplies the real target, because a wrong value here breaks a live domain.
 */

// ── Domain types ──────────────────────────────────────────────────────────────

export const DOMAIN_TYPE = Object.freeze({
  /** Hosted by the platform, addressable as a subdomain of the platform domain. */
  PLATFORM: 'platform',
  /** A domain the customer owns and points at the platform. */
  CUSTOM: 'custom',
})

export const DOMAIN_TYPES = Object.freeze(Object.values(DOMAIN_TYPE))

export const DOMAIN_TYPE_LABEL_KEYS = Object.freeze({
  [DOMAIN_TYPE.PLATFORM]: 'workspaceDomains.type.platform',
  [DOMAIN_TYPE.CUSTOM]: 'workspaceDomains.type.custom',
})

export const DOMAIN_TYPE_VARIANTS = Object.freeze({
  [DOMAIN_TYPE.PLATFORM]: 'platform',
  [DOMAIN_TYPE.CUSTOM]: 'custom',
})

export const isKnownDomainType = (type) => DOMAIN_TYPES.includes(type)

// ── Domain states ─────────────────────────────────────────────────────────────

/**
 * Connection state of a custom domain.
 *
 * NOT_CONNECTED  — added, but DNS has not been confirmed yet.
 * PENDING        — the backend is checking, or is waiting for the records to exist.
 * CONNECTED      — the backend reported the name resolves and serves this workspace.
 * ERROR          — verification failed. The backend's reason is shown as-is.
 */
export const DOMAIN_STATUS = Object.freeze({
  NOT_CONNECTED: 'not_connected',
  PENDING: 'pending',
  CONNECTED: 'connected',
  ERROR: 'error',
})

export const DOMAIN_STATUSES = Object.freeze(Object.values(DOMAIN_STATUS))

export const DOMAIN_STATUS_LABEL_KEYS = Object.freeze({
  [DOMAIN_STATUS.NOT_CONNECTED]: 'workspaceDomains.status.notConnected',
  [DOMAIN_STATUS.PENDING]: 'workspaceDomains.status.pending',
  [DOMAIN_STATUS.CONNECTED]: 'workspaceDomains.status.connected',
  [DOMAIN_STATUS.ERROR]: 'workspaceDomains.status.error',
})

export const DOMAIN_STATUS_VARIANTS = Object.freeze({
  [DOMAIN_STATUS.NOT_CONNECTED]: 'notConnected',
  [DOMAIN_STATUS.PENDING]: 'pending',
  [DOMAIN_STATUS.CONNECTED]: 'connected',
  [DOMAIN_STATUS.ERROR]: 'error',
})

export const isKnownDomainStatus = (status) => DOMAIN_STATUSES.includes(status)

// ── SSL states ────────────────────────────────────────────────────────────────

/**
 * Certificate state, reported separately from the connection state.
 *
 * PENDING — the certificate has not been issued yet.
 * ACTIVE  — the backend reported an issued certificate. Never assumed.
 * FAILED  — issuance failed. The backend's reason is shown as-is.
 * NONE    — no certificate is tracked for this domain.
 */
export const SSL_STATUS = Object.freeze({
  NONE: 'none',
  PENDING: 'pending',
  ACTIVE: 'active',
  FAILED: 'failed',
})

export const SSL_STATUSES = Object.freeze(Object.values(SSL_STATUS))

export const SSL_STATUS_LABEL_KEYS = Object.freeze({
  [SSL_STATUS.NONE]: 'workspaceDomains.ssl.none',
  [SSL_STATUS.PENDING]: 'workspaceDomains.ssl.pending',
  [SSL_STATUS.ACTIVE]: 'workspaceDomains.ssl.active',
  [SSL_STATUS.FAILED]: 'workspaceDomains.ssl.failed',
})

export const SSL_STATUS_VARIANTS = Object.freeze({
  [SSL_STATUS.NONE]: 'none',
  [SSL_STATUS.PENDING]: 'pending',
  [SSL_STATUS.ACTIVE]: 'active',
  [SSL_STATUS.FAILED]: 'failed',
})

export const isKnownSslStatus = (status) => SSL_STATUSES.includes(status)

// ── DNS record types ──────────────────────────────────────────────────────────

/**
 * Record kinds a custom domain can need.
 *
 * A  — points the apex at an IP the backend supplies.
 * CNAME — points a subdomain at the backend's hostname.
 * TXT   — proves ownership; the backend supplies the value.
 */
export const DNS_RECORD_TYPE = Object.freeze({
  A: 'A',
  CNAME: 'CNAME',
  TXT: 'TXT',
})

export const DNS_RECORD_TYPES = Object.freeze(Object.values(DNS_RECORD_TYPE))

/** One-line explanation of each record kind, so the table can teach as it lists. */
export const DNS_RECORD_TYPE_HINT_KEYS = Object.freeze({
  [DNS_RECORD_TYPE.A]: 'workspaceDomains.dns.hintA',
  [DNS_RECORD_TYPE.CNAME]: 'workspaceDomains.dns.hintCname',
  [DNS_RECORD_TYPE.TXT]: 'workspaceDomains.dns.hintTxt',
})

/**
 * True when a hostname is syntactically a domain name.
 *
 * This checks shape only. It says nothing about whether the name exists, resolves,
 * is owned by the customer or is safe to serve — all of that is the backend's call.
 */
export const isPlausibleDomain = (hostname) => {
  const value = String(hostname ?? '').trim().toLowerCase()
  if (!value || value.length > 253) return false
  // Reject a scheme, a path, a port and a wildcard: the form takes a bare name.
  if (/[/:?#*@\s]/.test(value)) return false
  if (value.startsWith('.') || value.endsWith('.')) return false
  if (!value.includes('.')) return false

  return value
    .split('.')
    .every(
      (label) =>
        label.length > 0 &&
        label.length <= 63 &&
        /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label)
    )
}

/**
 * True when a string is a single DNS label — a workspace slug, not a domain.
 *
 * Used for the platform subdomain's slug, which is one label rather than a name, so
 * it must not be run through `isPlausibleDomain` (which requires a dot).
 */
export const isPlausibleSlug = (slug) => {
  const value = String(slug ?? '').trim().toLowerCase()
  return value.length > 0 && value.length <= 63 && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(value)
}

const readString = (payload, ...keys) => {
  for (const key of keys) {
    const value = payload?.[key]
    if (typeof value === 'string' && value.trim()) return value
  }
  return null
}

const readBoolean = (payload, ...keys) => {
  for (const key of keys) {
    const value = payload?.[key]
    if (typeof value === 'boolean') return value
  }
  return null
}

// ── DNS records ───────────────────────────────────────────────────────────────

/**
 * Normalizes one DNS record.
 *
 * Only the record kind and the host are trusted from the payload, and only when
 * they are known. `value` and `priority` are kept exactly as the backend sent them
 * and are never generated: a placeholder target would send someone to a hostname
 * that does not exist. A record with no value returns null, so the UI cannot render
 * an empty instruction as if it were a real one.
 */
export const normalizeDnsRecord = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const type = readString(raw, 'type', 'recordType')?.toUpperCase() ?? null
  if (!DNS_RECORD_TYPES.includes(type)) {
    return null
  }

  const value = readString(raw, 'value', 'target', 'content')
  if (!value) {
    return null
  }

  const priorityRaw = raw.priority ?? raw.ttl
  const priority = Number.isFinite(priorityRaw) ? Number(priorityRaw) : null

  return {
    id: readString(raw, 'id', 'name', 'host') ?? `${type}:${value}`,
    type,
    host: readString(raw, 'host', 'name', 'label') ?? '@',
    value,
    priority,
  }
}

/**
 * Normalizes a backend record list.
 *
 * Returns an empty list for a non-array, so a missing payload reads as "no
 * instructions yet" rather than as a crash.
 */
export const normalizeDnsRecords = (items) => {
  if (!Array.isArray(items)) return []
  return items.map(normalizeDnsRecord).filter(Boolean)
}

// ── Normalization ─────────────────────────────────────────────────────────────

/**
 * Maps a raw API record onto a Domain.
 *
 * Returns null for a non-object or a payload with no usable hostname, so a
 * malformed row is dropped rather than rendered as an empty domain.
 *
 * `verificationMessage` is passed through untouched: when a verification fails the
 * backend's own reason is the useful text, and inventing one here would hide it.
 */
export const normalizeDomain = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const hostname = readString(raw, 'hostname', 'domain', 'name', 'host')
  if (!hostname) {
    return null
  }

  const type = isKnownDomainType(raw.type) ? raw.type : DOMAIN_TYPE.CUSTOM
  const isPrimary = readBoolean(raw, 'primary', 'isPrimary', 'is_primary') ?? false

  // State is read, never derived from the shape of the hostname.
  const status = isKnownDomainStatus(raw.status)
    ? raw.status
    : DOMAIN_STATUS.NOT_CONNECTED
  const sslStatus = isKnownSslStatus(raw.sslStatus ?? raw.ssl_status)
    ? raw.sslStatus ?? raw.ssl_status
    : SSL_STATUS.NONE

  return {
    id: readString(raw, 'id') ?? hostname,
    hostname: hostname.toLowerCase(),
    type,
    isPrimary,
    status,
    sslStatus,
    // The backend's own words, or null. Never substituted here.
    verificationMessage: readString(
      raw,
      'verificationMessage',
      'verification_message',
      'message',
      'errorMessage',
      'error'
    ),
    // Real records from the backend, or an empty list. Never a placeholder target.
    dnsRecords: normalizeDnsRecords(raw.dnsRecords ?? raw.dns_records),
    siteId: readString(raw, 'siteId', 'site_id'),
    verifiedAt: readString(raw, 'verifiedAt', 'verified_at'),
    sslExpiresAt: readString(raw, 'sslExpiresAt', 'ssl_expires_at'),
    createdAt: readString(raw, 'createdAt', 'created_at'),
    updatedAt: readString(raw, 'updatedAt', 'updated_at'),
  }
}

/**
 * Builds the platform subdomain for a workspace.
 *
 * This is a projection, not a stored record: it is always read from the workspace
 * the backend returned, and it is never marked verified, connected or certificate
 * bearing. A workspace with no known id yields null rather than a fake name.
 */
export const buildPlatformDomain = (workspace, platformHost = null) => {
  const slug = readString(workspace, 'slug', 'subdomain', 'handle')
  if (!isPlausibleSlug(slug)) {
    return null
  }

  const host = readString(platformHost, 'hostname', 'domain', 'host')
  const hostname = host ? `${slug}.${host.toLowerCase()}` : `${slug}.platform.local`

  return {
    id: `platform:${slug}`,
    hostname,
    type: DOMAIN_TYPE.PLATFORM,
    isPrimary: false,
    // Honest by construction: a platform subdomain is served by the platform, but
    // this frontend has no backend confirmation of that, so it reads as not connected.
    status: DOMAIN_STATUS.NOT_CONNECTED,
    sslStatus: SSL_STATUS.NONE,
    verificationMessage: null,
    // A platform subdomain needs no customer-side DNS, so it has no records to show.
    dnsRecords: [],
    siteId: readString(workspace, 'siteId', 'site_id'),
    verifiedAt: null,
    sslExpiresAt: null,
    createdAt: readString(workspace, 'createdAt', 'created_at'),
    updatedAt: readString(workspace, 'updatedAt', 'updated_at'),
  }
}

/** Maps a backend list onto domains, dropping malformed rows. */
export const normalizeDomainList = (items) => {
  if (!Array.isArray(items)) return []
  return items.map(normalizeDomain).filter(Boolean)
}

// ── Search / filter / counts ──────────────────────────────────────────────────

/** Case-insensitive match on hostname, state and verification message. */
export const domainMatchesQuery = (domain, query) => {
  const needle = query.trim().toLowerCase()
  if (!needle) return true

  return [domain.hostname, domain.status, domain.sslStatus, domain.verificationMessage]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(needle))
}

export const DOMAIN_FILTER_ALL = 'all'

/**
 * Filters the loaded list by type, state and search term. Runs over loaded rows
 * only; nothing here queries the server.
 */
export const filterDomains = (
  domains = [],
  { query = '', type = DOMAIN_FILTER_ALL, status = DOMAIN_FILTER_ALL } = {}
) =>
  domains.filter((domain) => {
    const matchesType = type === DOMAIN_FILTER_ALL || domain.type === type
    const matchesStatus = status === DOMAIN_FILTER_ALL || domain.status === status
    return matchesType && matchesStatus && domainMatchesQuery(domain, query)
  })

/** Counts per state, for the summary. Derived from loaded rows only. */
export const countDomainsByStatus = (domains = []) => {
  const counts = Object.fromEntries(DOMAIN_STATUSES.map((status) => [status, 0]))
  for (const domain of domains) {
    if (counts[domain.status] !== undefined) {
      counts[domain.status] += 1
    }
  }
  return counts
}

// ── Action availability ───────────────────────────────────────────────────────

/**
 * Which actions the UI may offer for one domain.
 *
 * This is a *presentation* guard derived from the reported state, not permission
 * logic. It never enables anything by itself: every action still calls the service,
 * which refuses without a backend. Its job is only to avoid offering "Set primary"
 * on a name that does not resolve, or "Verify" on one the backend already confirmed.
 */
export const getDomainActions = (domain) => {
  if (!domain) {
    return { canVerify: false, canRemove: false, canSetPrimary: false }
  }

  const isCustom = domain.type === DOMAIN_TYPE.CUSTOM
  const isConnected = domain.status === DOMAIN_STATUS.CONNECTED

  return {
    // A platform subdomain is managed by the platform: there is nothing to verify.
    canVerify: isCustom && !isConnected,
    canRemove: isCustom,
    // A primary domain has to be one that actually serves the workspace.
    canSetPrimary: isCustom && isConnected && !domain.isPrimary,
  }
}

// ── Add-domain form ───────────────────────────────────────────────────────────

/**
 * Validates the add-domain form.
 *
 * Shape only: a plausible hostname is not a domain anyone owns, and only the
 * backend can say whether it is available. A domain that is already in the list is
 * rejected here so the user gets an immediate answer instead of a server round trip.
 */
export const buildDomainDraft = (inputs = {}, { existingHostnames = [] } = {}) => {
  const hostname = String(inputs.hostname ?? '').trim().toLowerCase()
  const errors = {}

  if (!hostname) {
    errors.hostname = 'required'
    return { hostname: '', errors, isValid: false }
  }

  if (!isPlausibleDomain(hostname)) {
    errors.hostname = 'format'
    return { hostname, errors, isValid: false }
  }

  const already = existingHostnames.map((value) => value.toLowerCase())
  if (already.includes(hostname)) {
    errors.hostname = 'duplicate'
    return { hostname, errors, isValid: false }
  }

  return { hostname, errors, isValid: true }
}
