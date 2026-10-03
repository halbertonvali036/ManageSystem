import { useState } from 'react'
import { CheckCheck, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import NotificationList from '@/components/notifications/NotificationList'
import useNotifications from '@/hooks/useNotifications'
import { getRequestErrorMessage } from '@/services/httpClient'
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_LABELS,
} from '@/models/notification'
import { NOTIFICATION_PREFERENCES_ANCHOR } from '@/utils/constants'

const FILTERS = {
  ALL: 'all',
  UNREAD: 'unread',
}

const FILTER_LABELS = {
  [FILTERS.ALL]: 'All',
  [FILTERS.UNREAD]: 'Unread',
}

/**
 * Notification centre.
 *
 * This is the only full-page notification view; the header bell shows the same
 * records in a compact panel. Filters are applied to the loaded data, and every
 * read/unread action is a backend request — nothing is marked read locally and
 * no record is created to fill the page.
 */
function NotificationsPage() {
  const [filter, setFilter] = useState(FILTERS.ALL)
  const [category, setCategory] = useState('all')

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
  } = useNotifications({
    unreadOnly: filter === FILTERS.UNREAD,
    category: category === 'all' ? null : category,
  })

  const hasUnread = unreadCount > 0
  const isFiltered = filter === FILTERS.UNREAD || category !== 'all'

  return (
    <div className="notifications-page">
      <div className="notifications-toolbar">
        <p className="page-description">
          Website, publishing, domain and account updates for this
          account. Read state is stored by the backend.
        </p>

        <div className="notifications-toolbar__actions">
          <div className="segmented" role="group" aria-label="Filter notifications by read state">
            {Object.values(FILTERS).map((value) => (
              <button
                key={value}
                type="button"
                className={
                  value === filter
                    ? 'segmented__option segmented__option--active'
                    : 'segmented__option'
                }
                aria-pressed={value === filter}
                onClick={() => setFilter(value)}
              >
                {FILTER_LABELS[value]}
                {value === FILTERS.UNREAD && hasUnread ? (
                  <span className="notifications-toolbar__count">{unreadCount}</span>
                ) : null}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn btn--outline btn--icon-left"
            onClick={markAllAsRead}
            disabled={!hasUnread || isMarkingAll || Boolean(pendingId) || !isAvailable}
            aria-busy={isMarkingAll}
          >
            <CheckCheck size={16} aria-hidden="true" />
            {isMarkingAll ? 'Marking all…' : 'Mark all as read'}
          </button>

          <button
            type="button"
            className="btn btn--ghost btn--icon-left"
            onClick={refetch}
            disabled={isLoading}
          >
            <RefreshCw size={16} aria-hidden="true" />
            Refresh
          </button>
        </div>
      </div>

      <div className="notifications-categories" role="group" aria-label="Filter by category">
        <button
          type="button"
          className={`notifications-category${category === 'all' ? ' notifications-category--active' : ''}`}
          aria-pressed={category === 'all'}
          onClick={() => setCategory('all')}
        >
          All categories
        </button>
        {NOTIFICATION_CATEGORIES.map((value) => (
          <button
            key={value}
            type="button"
            className={`notifications-category${category === value ? ' notifications-category--active' : ''}`}
            aria-pressed={category === value}
            onClick={() => setCategory(value)}
          >
            {NOTIFICATION_CATEGORY_LABELS[value]}
          </button>
        ))}
      </div>

      {isFiltered && !isLoading && !error ? (
        <p className="notifications-filter-note" role="status">
          Showing {notifications.length} filtered{' '}
          {notifications.length === 1 ? 'notification' : 'notifications'}.
        </p>
      ) : null}

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
        wrapInCard
        emptyMessage={
          isFiltered
            ? 'Nothing matches this filter. Try "All" to see everything the backend has sent.'
            : undefined
        }
      />

      <p className="notifications-footnote">
        Delivery preferences, including email notifications, are managed on your account page:{' '}
        <Link className="form__link" to={NOTIFICATION_PREFERENCES_ANCHOR}>
          notification preferences
        </Link>
        .
      </p>
    </div>
  )
}

export default NotificationsPage
