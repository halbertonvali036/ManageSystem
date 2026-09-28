import { useEffect, useMemo } from 'react'
import notificationStore, { useNotificationStore } from '@/stores/notificationStore'
import { getNotificationCategory, isNotificationUnread } from '@/models/notification'

/**
 * Notification list state for the bell dropdown and the notification page.
 *
 * Both read the shared store, so the header badge, the dropdown and the page
 * always show the same backend records. `filters` are applied to the loaded
 * records locally — the request itself always asks for the full list so the
 * unread count stays truthful.
 */
function useNotifications(filters = {}) {
  const { unreadOnly = false, category = null } = filters
  const store = useNotificationStore()

  useEffect(() => {
    if (!store.isLoaded) {
      notificationStore.load()
    }
  }, [store.isLoaded])

  const notifications = useMemo(() => {
    return store.notifications.filter((notification) => {
      if (unreadOnly && !isNotificationUnread(notification)) {
        return false
      }
      if (category && getNotificationCategory(notification) !== category) {
        return false
      }
      return true
    })
  }, [store.notifications, unreadOnly, category])

  return {
    notifications,
    unreadCount: store.unreadCount,
    isLoading: store.isLoading,
    isAvailable: store.isAvailable,
    error: store.error,
    actionError: store.actionError,
    pendingId: store.pendingId,
    isMarkingAll: store.isMarkingAll,
    hasUnread: store.unreadCount > 0,
    refetch: notificationStore.reload,
    markAsRead: notificationStore.markAsRead,
    markAllAsRead: notificationStore.markAllAsRead,
    clearActionError: notificationStore.clearActionError,
  }
}

export default useNotifications
