import config from '@/config'
import httpClient, {
  BackendNotConnectedError,
  isEndpointUnavailable,
} from '@/services/httpClient'
import {
  NOTIFICATION_PREFERENCES_PATH,
  toNotificationPreferences,
  toNotificationPreferencesPayload,
} from '@/models/notificationPreferences'
import { toNotificationCategoryFilter } from '@/models/notification'

const NOTIFICATIONS_PATH = '/notifications'

const ensureBackendConnection = () => {
  if (!config.api.baseUrl) {
    throw new BackendNotConnectedError()
  }
}

const isBackendConnected = () => Boolean(config.api.baseUrl)

const buildQuery = (params = {}) => {
  const query = new URLSearchParams()
  if (params.unreadOnly) {
    query.set('unread', 'true')
  }
  if (params.type) {
    query.set('type', params.type)
  }
  const category = toNotificationCategoryFilter(params.category)
  if (category) {
    query.set('category', category)
  }
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

/**
 * Reads never invent data.
 *
 * While the backend is absent they resolve to the same empty shape a real
 * empty account would produce, so the UI shows a true empty state instead of
 * demo records. `isBackendConnected()` is what the UI uses to tell the two
 * apart.
 */
const getNotifications = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  try {
    const response = await httpClient.get(`${NOTIFICATIONS_PATH}${buildQuery(params)}`)
    const records = Array.isArray(response)
      ? response
      : response?.data ?? response?.notifications ?? []
    return Array.isArray(records) ? records : []
  } catch (error) {
    // The notifications resource is not implemented yet: 404/403/405 reads as
    // "no notifications", which is the empty state the page already renders.
    if (isEndpointUnavailable(error)) {
      return []
    }
    throw error
  }
}

/**
 * Server-side unread total, for when the list becomes paginated. The header
 * badge currently counts the records it has actually loaded, so it can never
 * show a number this app did not receive.
 */
const getUnreadCount = async () => {
  if (!config.api.baseUrl) {
    return 0
  }
  try {
    const response = await httpClient.get(`${NOTIFICATIONS_PATH}/unread-count`)
    if (typeof response === 'number') {
      return response
    }
    return response?.count ?? 0
  } catch (error) {
    if (isEndpointUnavailable(error)) {
      return 0
    }
    throw error
  }
}

/**
 * Stored preferences for the authenticated account, or `null` while unknown.
 * `null` means "not served by a backend", never "everything is off".
 */
const getNotificationPreferences = async () => {
  if (!config.api.baseUrl) {
    return null
  }
  try {
    const response = await httpClient.get(NOTIFICATION_PREFERENCES_PATH)
    const source = response?.data ?? response?.preferences ?? response
    return toNotificationPreferences(source)
  } catch (error) {
    // Not served yet: `null` means "unknown / not loaded", which the hook
    // already renders as its unavailable state.
    if (isEndpointUnavailable(error)) {
      return null
    }
    throw error
  }
}

// Mutations deliberately refuse to run without a backend.
// They must not simulate successful state changes. A 404/403/405 from the
// unimplemented resource is the same refusal: the existing "unavailable" state
// rather than a generic error.

const asUnavailable = (error) => {
  if (isEndpointUnavailable(error)) {
    throw new BackendNotConnectedError('Notification integration is unavailable.')
  }
  throw error
}

const markAsRead = async (id) => {
  ensureBackendConnection()
  try {
    await httpClient.patch(`${NOTIFICATIONS_PATH}/${id}/read`)
  } catch (error) {
    return asUnavailable(error)
  }
}

const markAllAsRead = async () => {
  ensureBackendConnection()
  try {
    await httpClient.post(`${NOTIFICATIONS_PATH}/read-all`)
  } catch (error) {
    return asUnavailable(error)
  }
}

/**
 * Persists preference changes. The body carries only the toggles — the backend
 * resolves the account from the session, so no user id is sent from here.
 */
const updateNotificationPreferences = async (draft) => {
  ensureBackendConnection()
  const payload = toNotificationPreferencesPayload(draft)
  try {
    const response = await httpClient.patch(NOTIFICATION_PREFERENCES_PATH, payload)
    const source = response?.data ?? response?.preferences ?? response
    return toNotificationPreferences(source) ?? payload
  } catch (error) {
    return asUnavailable(error)
  }
}

const notificationsService = {
  isBackendConnected,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getNotificationPreferences,
  updateNotificationPreferences,
}

export default notificationsService
