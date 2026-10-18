import config from '@/config'
import httpClient, { BackendNotConnectedError, RequestError } from '@/services/httpClient'
import usersService from '@/services/usersService'
import { ADMIN_COLLECTIONS } from '@/models/adminPlatform'
import { ADMIN_PLAN_IDS } from '@/models/adminPlan'
import { readAdminText } from '@/models/adminPlatform'

const requireBackend = () => {
  if (!config.api.baseUrl) throw new BackendNotConnectedError()
}

const readObject = response => {
  const data = response?.data ?? response
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new RequestError('Invalid platform response.')
  }
  return data
}

// A mutation may legitimately answer 204 No Content. An empty body after a
// successful request is an acknowledgement, not a payload to validate; it is
// never reached when the backend is unavailable, because `requireBackend()`
// and the transport both fail first.
const readMutation = response => {
  const data = response?.data ?? response
  return data === null || data === undefined ? {} : readObject(data)
}

// Mirrors `TEMPLATE_TIER` in `@/models/siteTemplate`. Kept local so the service
// does not import the whole template gallery just to validate two values.
const TEMPLATE_TIER_IDS = Object.freeze(['free', 'pro'])

const readList = value => {
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) {
    throw new RequestError('Invalid template list.')
  }
  return value.map(item => item.trim()).filter(Boolean)
}

/**
 * Validates template metadata before it is sent.
 *
 * Metadata only: name, description, category, tier, published, tags, features.
 * Page skeletons, section lists and theme presets are never accepted here, so a
 * form cannot quietly turn into a second template engine.
 */
const readTemplateMetadata = (payload, { partial = false } = {}) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new RequestError('Invalid template metadata.')
  }
  const metadata = {}
  if (partial ? Object.hasOwn(payload, 'name') : true) {
    const name = readAdminText(payload.name).trim()
    if (!name) throw new RequestError('A template name is required.')
    metadata.name = name
  }
  if (partial ? Object.hasOwn(payload, 'category') : true) {
    const category = readAdminText(payload.category).trim()
    if (!category) throw new RequestError('A template category is required.')
    metadata.category = category
  }
  if (partial ? Object.hasOwn(payload, 'tier') : true) {
    if (!TEMPLATE_TIER_IDS.includes(payload.tier)) throw new RequestError('Unknown template tier.')
    metadata.tier = payload.tier
  }
  if (Object.hasOwn(payload, 'description')) {
    metadata.description = readAdminText(payload.description).trim()
  }
  if (Object.hasOwn(payload, 'published')) {
    if (typeof payload.published !== 'boolean') {
      throw new RequestError('A published flag must be a boolean.')
    }
    metadata.published = payload.published
  }
  if (Object.hasOwn(payload, 'tags')) metadata.tags = readList(payload.tags)
  if (Object.hasOwn(payload, 'features')) metadata.features = readList(payload.features)
  return metadata
}

const adminPlatformService = {
  async getOverview() {
    requireBackend()
    return readObject(await httpClient.get('/admin/overview'))
  },
  async getSettings() {
    requireBackend()
    return readObject(await httpClient.get('/admin/settings'))
  },
  async getCollection(section, filters = {}) {
    requireBackend()
    if (!Object.hasOwn(ADMIN_COLLECTIONS, section)) throw new RequestError('Unknown platform resource.')
    // Preserve the existing generic account API contract. All other platform
    // paths are proposed read interfaces documented for backend handoff.
    const response = section === 'users'
      ? await usersService.getUsers(filters)
      : await httpClient.get(`/admin/${section}`)
    const records = response?.data ?? response
    if (!Array.isArray(records) || records.some(record => !record || typeof record !== 'object' || Array.isArray(record))) {
      throw new RequestError('Invalid platform collection.')
    }
    return records
  },
  async assignUserPlan(userId, planId) {
    requireBackend()
    if (!readAdminText(userId)) throw new RequestError('A user is required.')
    if (!ADMIN_PLAN_IDS.includes(planId)) throw new RequestError('Unknown plan.')
    return readObject(
      await httpClient.patch(`/admin/users/${encodeURIComponent(userId)}/plan`, { plan: planId }),
    )
  },
  /** Metadata-only creation. The page/section skeleton stays a backend concern. */
  async createTemplate(payload) {
    requireBackend()
    return readMutation(await httpClient.post('/admin/templates', readTemplateMetadata(payload)))
  },
  async updateTemplate(templateId, patch) {
    requireBackend()
    if (!readAdminText(templateId)) throw new RequestError('A template is required.')
    const metadata = readTemplateMetadata(patch, { partial: true })
    if (Object.keys(metadata).length === 0) throw new RequestError('No template changes were provided.')
    return readMutation(
      await httpClient.patch(`/admin/templates/${encodeURIComponent(templateId)}`, metadata),
    )
  },
  async deleteTemplate(templateId) {
    requireBackend()
    if (!readAdminText(templateId)) throw new RequestError('A template is required.')
    return readMutation(
      await httpClient.delete(`/admin/templates/${encodeURIComponent(templateId)}`),
    )
  },
}

export default adminPlatformService
