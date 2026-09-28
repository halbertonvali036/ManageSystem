import { useSyncExternalStore } from 'react'
import notificationsService from '@/services/notificationsService'
import { getNotificationId, isNotificationUnread } from '@/models/notification'

/**
 * Shared notification store.
 *
 * The header badge, the bell dropdown and the notification page all read the
 * same loaded records through this store, so a read/unread change made in one
 * place is reflected everywhere at once and the badge can never show a number
 * the app did not actually receive.
 *
 * Rules:
 * - Reads use only what the backend returned. With no backend the list is
 *   empty, `isAvailable` is false and the unread count is `0`.
 * - Mutations go to the backend and then reload. Nothing is flipped locally on
 *   failure, so a rejected request leaves the record unread.
 * - Delivery is not implemented here: no polling, no websocket, no push.
 *   `load()` runs on mount and after each mutation.
 */

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isLoaded: false,
  error: null,
  isAvailable: false,
  pendingId: null,
  isMarkingAll: false,
  actionError: null,
}

let state = initialState
let inFlight = null
let generation = 0
const listeners = new Set()

const emit = () => {
  const snapshot = state
  listeners.forEach((listener) => listener(snapshot))
}

const setState = (patch) => {
  state = { ...state, ...patch }
  emit()
}

const subscribe = (listener) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => state

const countUnread = (records) => records.filter((record) => isNotificationUnread(record)).length

/** Loads the notification list. Concurrent calls share the same request. */
const load = async () => {
  if (inFlight) {
    return inFlight
  }
  const requestGeneration = generation
  setState({ isLoading: true, error: null })
  inFlight = notificationsService
    .getNotifications()
    .then((records) => {
      if (requestGeneration !== generation) {
        return
      }
      const notifications = Array.isArray(records) ? records : []
      setState({
        notifications,
        unreadCount: countUnread(notifications),
        error: null,
        isAvailable: true,
      })
    })
    .catch((error) => {
      if (requestGeneration !== generation) {
        return
      }
      setState({
        notifications: [],
        unreadCount: 0,
        error,
        isAvailable: notificationsService.isBackendConnected(),
      })
    })
    .finally(() => {
      if (requestGeneration !== generation) {
        return
      }
      inFlight = null
      setState({ isLoading: false, isLoaded: true })
    })
  return inFlight
}

const reload = () => load()

const markAsRead = async (notification) => {
  const id = getNotificationId(notification)
  if (!id || state.pendingId || state.isMarkingAll) {
    return false
  }
  setState({ pendingId: id, actionError: null })
  try {
    await notificationsService.markAsRead(id)
    await load()
    return true
  } catch (error) {
    setState({ actionError: error })
    return false
  } finally {
    setState({ pendingId: null })
  }
}

const markAllAsRead = async () => {
  if (state.isMarkingAll || state.pendingId) {
    return false
  }
  setState({ isMarkingAll: true, actionError: null })
  try {
    await notificationsService.markAllAsRead()
    await load()
    return true
  } catch (error) {
    setState({ actionError: error })
    return false
  } finally {
    setState({ isMarkingAll: false })
  }
}

const clearActionError = () => {
  if (state.actionError) {
    setState({ actionError: null })
  }
}

/** Called on sign-out so one account's records never leak into the next. */
const reset = () => {
  generation += 1
  inFlight = null
  state = initialState
  emit()
}

const notificationStore = {
  subscribe,
  getSnapshot,
  load,
  reload,
  markAsRead,
  markAllAsRead,
  clearActionError,
  reset,
}

/**
 * React binding for the store. It is a read-only view: the load is started by
 * `useNotifications`, so several components can mount without extra requests.
 */
export function useNotificationStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export { notificationStore }
export default notificationStore
