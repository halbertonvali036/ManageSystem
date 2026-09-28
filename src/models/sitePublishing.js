// Only a future backend adapter may supply remote status. Local edits never publish.
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

export const normalizeDomainStatus = (remote) => ({
  status: DOMAIN_STATES.includes(remote?.status) ? remote.status : 'unconfigured',
  ssl: SSL_STATES.includes(remote?.ssl) ? remote.ssl : 'unconfigured',
  records: Array.isArray(remote?.records) ? remote.records.filter((record) =>
    ['A', 'CNAME', 'TXT'].includes(record?.type) && typeof record.name === 'string' && typeof record.value === 'string',
  ) : [],
})
