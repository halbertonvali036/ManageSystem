import { useState } from 'react'
import NotificationList from '@/components/notifications/NotificationList'
import useNotifications from '@/hooks/useNotifications'

const FILTERS = {
  ALL: 'all',
  UNREAD: 'unread',
}

const FILTER_LABELS = {
  [FILTERS.ALL]: 'All',
  [FILTERS.UNREAD]: 'Unread',
}

function NotificationsPage() {
  const [filter, setFilter] = useState(FILTERS.ALL)
  const { notifications, isLoading, error, refetch } = useNotifications({
    unreadOnly: filter === FILTERS.UNREAD,
  })

  return (
    <div className="notifications-page">
      <div className="notifications-toolbar">
        <p className="page-description">
          Review notifications for your account. They will be available once the
          backend is connected.
        </p>
        <div className="segmented" role="group" aria-label="Filter notifications">
          {Object.values(FILTERS).map((value) => (
            <button
              key={value}
              type="button"
              className={value === filter ? 'segmented__option segmented__option--active' : 'segmented__option'}
              aria-pressed={value === filter}
              onClick={() => setFilter(value)}
            >
              {FILTER_LABELS[value]}
            </button>
          ))}
        </div>
      </div>

      <NotificationList
        notifications={notifications}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        wrapInCard
      />
    </div>
  )
}

export default NotificationsPage