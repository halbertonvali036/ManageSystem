import { BellRing } from 'lucide-react'
import Card from '@/components/common/Card'
import NotificationItem from '@/components/notifications/NotificationItem'

function NotificationLoading({ compact = false }) {
  return (
    <div className={`page-status notification-status${compact ? ' notification-status--compact' : ''}`} role="status">
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
      <h3 className="table-state__title">Failed to load notifications</h3>
      <p className="table-state__text">{message}</p>
      {onRetry ? (
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  )
}

function NotificationEmpty({ message, compact = false }) {
  return (
    <div
      className={`notification-empty${compact ? ' notification-fallback--compact' : ''}`}
    >
      <span className="widget-empty__icon">
        <BellRing size={24} aria-hidden="true" />
      </span>
      <p className="widget-empty__title">No notifications yet.</p>
      <p className="widget-empty__text">
        {message ?? 'Notifications will appear here once they are available.'}
      </p>
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
}) {
  let content

  if (isLoading) {
    content = <NotificationLoading compact={compact} />
  } else if (error) {
    content = <NotificationError message={error.message} onRetry={onRetry} compact={compact} />
  } else if (notifications.length === 0) {
    content = <NotificationEmpty message={emptyMessage} compact={compact} />
  } else {
    content = (
      <ul className="notification-list">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id ?? notification._id}
            notification={notification}
            compact={compact}
          />
        ))}
      </ul>
    )
  }

  if (!wrapInCard) {
    return content
  }

  return <Card>{content}</Card>
}

export default NotificationList