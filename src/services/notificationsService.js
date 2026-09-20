import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'

const NOTIFICATIONS_PATH = '/notifications'

const ensureBackendConnection = () => {
  if (!config.api.baseUrl) {
    throw new BackendNotConnectedError()
  }
}

const buildQuery = (params = {}) => {
  const query = new URLSearchParams()
  if (params.unreadOnly) {
    query.set('unread', 'true')
  }
  if (params.type) {
    query.set('type', params.type)
  }
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

/**
 * Backend does not exist yet. Read methods return empty/zero values
 * consistently so the UI renders real empty states instead of demo data.
 */
const getNotifications = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  const response = await httpClient.get(`${NOTIFICATIONS_PATH}${buildQuery(params)}`)
  const records = Array.isArray(response)
    ? response
    : response?.data ?? response?.notifications ?? []
  return Array.isArray(records) ? records : []
}

const getUnreadCount = async () => {
  if (!config.api.baseUrl) {
    return 0
  }
  const response = await httpClient.get(`${NOTIFICATIONS_PATH}/unread-count`)
  if (typeof response === 'number') {
    return response
  }
  return response?.count ?? 0
}

// Mutations deliberately refuse to run without a backend.
// They must not simulate successful state changes.

const markAsRead = async (id) => {
  ensureBackendConnection()
  await httpClient.patch(`${NOTIFICATIONS_PATH}/${id}/read`)
}

const markAllAsRead = async () => {
  ensureBackendConnection()
  await httpClient.post(`${NOTIFICATIONS_PATH}/read-all`)
}

const notificationsService = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
}

export default notificationsService