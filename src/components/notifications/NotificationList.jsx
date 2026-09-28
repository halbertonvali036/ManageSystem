import { BellRing, PlugZap } from 'lucide-react'
import Card from '@/components/common/Card'
import NotificationItem from '@/components/notifications/NotificationItem'
import { getNotificationId } from '@/models/notification'

function NotificationLoading({ compact = false }) {
  return (
    <div
      className={`page-status notification-status${compact ? ' notification-status--compact' : ''}`}
      role="status"
    >
      <span className="spinner" aria-hidden="true" />
      Loading notifications&hellip;
    </div>
  )
}

function NotificationError({ message, onRetry, compact = false }) {
  return (
    <div
      className={`table-state table-state--error notification-fallback${
        compact ? ' notification-fallback--compact' : ''
      }`}
    >
      <h3 className="table-state__title">Notifications could not be loaded</h3>
      <p className="table-state__text">
        {message ?? 'The request did not complete. Your notifications were not changed.'}
      </p>
      {onRetry ? (
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  )
}

/**
 * Intentional empty states.
 *
 * "No backend" and "no notifications" are different situations and are shown
 * differently: one is an integration gap, the other is simply a quiet account.
 */
function NotificationEmpty({ message, compact = false, isAvailable = true }) {
  return (
    <div className={`notification-empty${compact ? ' notification-fallback--compact' : ''}`}>
      <span className="widget-empty__icon">
        {isAvailable ? <BellRing size={24} aria-hidden="true" /> : <PlugZap size={24} aria-hidden="true" />}
      </span>
      <p className="widget-empty__title">
        {isAvailable ? 'You are all caught up.' : 'Notifications are not connected yet.'}
      </p>
      <p className="widget-empty__text">
        {message ??
          (isAvailable
            ? 'When your institution publishes an announcement, or your schedule, attendance, assessment or grade changes, it appears here.'
            : 'This account has no notification service attached yet, so no records are shown. Nothing is being held back locally.')}
      </p>
    </div>
  )
}

/** A compact note shown when a read/unread action could not be completed. */
function NotificationActionError({ message }) {
  return (
    <div className="notification-action-error" role="alert">
      <PlugZap size={14} aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}

function NotificationList({
  notifications,
  isLoading,
  error,
  onRetry,
  emptyMessage,
  compact = false,
  wrapInCard = true,
  isAvailable = true,
  actionError = null,
  pendingId = null,
  markReadDisabled = false,
  onMarkAsRead,
}) {
  let content

  if (isLoading) {
    content = <NotificationLoading compact={compact} />
  } else if (error) {
    content = <NotificationError message={error.message} onRetry={onRetry} compact={compact} />
  } else if (notifications.length === 0) {
    content = (
      <NotificationEmpty
        message={emptyMessage}
        compact={compact}
        isAvailable={isAvailable}
      />
    )
  } else {
    content = (
      <>
        {actionError ? <NotificationActionError message={actionError} /> : null}
        <ul className="notification-list">
          {notifications.map((notification) => {
            const id = getNotificationId(notification)
            return (
              <NotificationItem
                key={id ?? `${notification.title}-${notification.createdAt}`}
                notification={notification}
                compact={compact}
                isMarking={Boolean(id) && pendingId === id}
                markReadDisabled={markReadDisabled}
                onMarkAsRead={onMarkAsRead}
              />
            )
          })}
        </ul>
      </>
    )
  }

  if (!wrapInCard) {
    return content
  }

  return <Card>{content}</Card>
}

export { NotificationEmpty, NotificationActionError }
export default NotificationList
