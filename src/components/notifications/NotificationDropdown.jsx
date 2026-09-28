import { CheckCheck, Settings2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import NotificationList from '@/components/notifications/NotificationList'
import useNotifications from '@/hooks/useNotifications'
import { NOTIFICATION_PREFERENCES_ANCHOR, NOTIFICATIONS_PATH } from '@/utils/constants'
import { getRequestErrorMessage } from '@/services/httpClient'

/**
 * Header bell panel — the compact view of the same notification records the
 * full page shows. It never loads its own copy of the list and never shows an
 * unread number the store has not loaded.
 */
function NotificationDropdown({ onClose }) {
  const {
    notifications,
    unreadCount,
    isLoading,
    isAvailable,
    error,
    actionError,
    pendingId,
    isMarkingAll,
    refetch,
    markAsRead,
    markAllAsRead,
  } = useNotifications()

  const hasUnread = unreadCount > 0

  return (
    <div className="notification-dropdown" role="region" aria-label="Notifications">
      <header className="notification-dropdown__header">
        <div className="notification-dropdown__heading">
          <h2 className="notification-dropdown__title">Notifications</h2>
          {hasUnread ? (
            <span className="notification-dropdown__count">
              {unreadCount} unread
            </span>
          ) : null}
        </div>

        <div className="notification-dropdown__header-actions">
          {hasUnread ? (
            <button
              type="button"
              className="notification-dropdown__read-all"
              onClick={markAllAsRead}
              disabled={isMarkingAll || Boolean(pendingId) || !isAvailable}
              aria-busy={isMarkingAll}
            >
              <CheckCheck size={14} aria-hidden="true" />
              {isMarkingAll ? 'Marking…' : 'Mark all read'}
            </button>
          ) : null}
          <Link
            to={NOTIFICATIONS_PATH}
            className="notification-dropdown__view-all"
            onClick={onClose}
          >
            View all
          </Link>
        </div>
      </header>

      <div className="notification-dropdown__body">
        <NotificationList
          notifications={notifications}
          isLoading={isLoading}
          isAvailable={isAvailable}
          error={error}
          actionError={
            actionError
              ? `Nothing was changed: ${getRequestErrorMessage(actionError)}`
              : null
          }
          pendingId={pendingId}
          markReadDisabled={!isAvailable || isMarkingAll}
          onMarkAsRead={markAsRead}
          onRetry={refetch}
          compact
          wrapInCard={false}
        />
      </div>

      <footer className="notification-dropdown__footer">
        <Link
          to={NOTIFICATION_PREFERENCES_ANCHOR}
          className="notification-dropdown__preferences"
          onClick={onClose}
        >
          <Settings2 size={14} aria-hidden="true" />
          Notification preferences
        </Link>
      </footer>
    </div>
  )
}

export default NotificationDropdown
