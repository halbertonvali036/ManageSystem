// Status values a backend may report for a domain or its certificate. Local
// edits never publish; these only ever arrive from the domain adapter.
export const PUBLISH_STATES = ['unknown', 'unpublished', 'published']
export const DOMAIN_STATES = ['unconfigured', 'pending', 'connected', 'error']
export const SSL_STATES = ['unconfigured', 'pending', 'active', 'error']

export const getPublicationState = (remote, hasChanges = false) => ({
  status: PUBLISH_STATES.includes(remote?.status) ? remote.status : 'unknown',
  hasChanges,
})

export const getPublishReadiness = (siteName, document) => [
  { key: 'name', ready: Boolean(siteName?.trim()) },
  { key: 'pages', ready: document ? Boolean(document.pages?.length) : null },
  { key: 'home', ready: document ? Boolean(document.pages?.some((page) => page.isHome)) : null },
]

/**
 * The domain state as far as the frontend is willing to state it.
 *
 * Everything here is read from the server's answer: the hostname is the one
 * the backend holds (not the field the visitor typed), the timestamps are the
 * ones it recorded, and `error` is its own message. Anything unknown falls back
 * to the empty state rather than being guessed, so a response from a future
 * API cannot make the page claim a domain is connected, checked or secured
 * when the server has not said so.
 */
export const normalizeDomainStatus = (remote) => ({
  hostname:
    typeof remote?.hostname === 'string' ? remote.hostname.trim().toLowerCase() : '',
  status: DOMAIN_STATES.includes(remote?.status) ? remote.status : 'unconfigured',
  ssl: SSL_STATES.includes(remote?.ssl) ? remote.ssl : 'unconfigured',
  records: Array.isArray(remote?.records) ? remote.records.filter((record) =>
    ['A', 'CNAME', 'TXT'].includes(record?.type) && typeof record.name === 'string' && typeof record.value === 'string',
  ) : [],
  verifiedAt: typeof remote?.verifiedAt === 'string' && remote.verifiedAt ? remote.verifiedAt : null,
  lastCheckedAt:
    typeof remote?.lastCheckedAt === 'string' && remote.lastCheckedAt
      ? remote.lastCheckedAt
      : null,
  error: typeof remote?.error === 'string' && remote.error.trim() ? remote.error.trim() : null,
})
