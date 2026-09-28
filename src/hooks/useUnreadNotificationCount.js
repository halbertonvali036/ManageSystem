import { useEffect } from 'react'
import notificationStore, { useNotificationStore } from '@/stores/notificationStore'

/**
 * Unread total for the header badge.
 *
 * The count is derived from the records the store has actually loaded, so the
 * badge can never show a fabricated or hardcoded number. While the backend is
 * absent the list is empty and the count stays `0`, which hides the badge.
 */
function useUnreadNotificationCount() {
  const store = useNotificationStore()

  useEffect(() => {
    if (!store.isLoaded) {
      notificationStore.load()
    }
  }, [store.isLoaded])

  return {
    unreadCount: store.unreadCount,
    isLoading: store.isLoading,
    isAvailable: store.isAvailable,
    error: store.error,
    refetch: notificationStore.reload,
  }
}

export default useUnreadNotificationCount
