/** Proposed platform read models. No seeded platform records or totals. */
export const ADMIN_COLLECTIONS = Object.freeze({
  users: ['name', 'email', 'role', 'status', 'lastLogin'],
  websites: ['name', 'owner', 'status', 'updatedAt', 'publishedAt', 'domain'],
  templates: ['name', 'category', 'status', 'updatedAt'],
  billing: ['owner', 'plan', 'status', 'cycle', 'updatedAt'],
  domains: ['domain', 'owner', 'site', 'status', 'verification', 'ssl'],
  notifications: ['title', 'type', 'audience', 'status', 'createdAt'],
  support: ['subject', 'owner', 'status', 'updatedAt'],
  audit: ['action', 'actor', 'target', 'createdAt'],
})

export const ADMIN_METRICS = Object.freeze([
  'totalUsers', 'totalWebsites', 'publishedSites', 'drafts',
  'subscriptions', 'domains', 'supportRequests',
])

export const ADMIN_SETTINGS_FIELDS = Object.freeze([
  'productName', 'supportContact', 'registrationPolicy', 'defaultLanguage',
  'platformUrl', 'apiBaseUrl', 'baseDomain',
])

export const ADMIN_STATES = Object.freeze([
  'active', 'inactive', 'enabled', 'disabled', 'draft', 'published', 'unpublished',
  'pending', 'verified', 'unverified', 'connected', 'unconfigured', 'failed',
  'open', 'closed', 'resolved', 'scheduled', 'sent', 'cancelled', 'trialing', 'past_due',
])

export const readAdminText = value => typeof value === 'string' || typeof value === 'number' ? String(value) : ''
export const readAdminIdentity = value => typeof value === 'object' && value
  ? readAdminText(value.name || value.email || value.id)
  : readAdminText(value)
