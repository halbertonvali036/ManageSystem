import { Link } from 'react-router-dom'
import NotificationList from '@/components/notifications/NotificationList'
import useNotifications from '@/hooks/useNotifications'

function NotificationDropdown({ onClose }) {
  const { notifications, isLoading, error, refetch } = useNotifications()

  return (
    <div className="notification-dropdown" role="region" aria-label="Notifications">
      <header className="notification-dropdown__header">
        <h2 className="notification-dropdown__title">Notifications</h2>
        <Link
          to="/notifications"
          className="notification-dropdown__view-all"
          onClick={onClose}
        >
          View all
        </Link>
      </header>
      <div className="notification-dropdown__body">
        <NotificationList
          notifications={notifications}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          compact
          wrapInCard={false}
          emptyMessage="You are all caught up."
        />
      </div>
    </div>
  )
}

export default NotificationDropdown