import config from '@/config'
import httpClient, { BackendNotConnectedError, RequestError } from '@/services/httpClient'
import usersService from '@/services/usersService'
import { ADMIN_COLLECTIONS } from '@/models/adminPlatform'

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
}

export default adminPlatformService
