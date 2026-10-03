import {
  Check,
  CheckCircle2,
  CreditCard,
  Info,
  Globe,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import {
  formatNotificationCreatedAt,
  formatNotificationMessage,
  formatNotificationRelativeTime,
  formatNotificationTitle,
  getNotificationCategory,
  getNotificationCategoryIcon,
  getNotificationCategoryLabel,
  getNotificationDateTime,
  getNotificationId,
  getNotificationType,
  isNotificationUnread,
  resolveNotificationTarget,
} from '@/models/notification'

/** Severity icons. Presentational only — never a behaviour signal. */
const TYPE_ICONS = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: TriangleAlert,
}

/** Category icons for the small leading badge. */
const CATEGORY_ICONS = {
  globe: Globe, info: Info, shield: ShieldCheck, card: CreditCard,
}

/**
 * One notification row.
 *
 * Everything rendered comes from the record the backend returned: severity,
 * category, title, message and timestamp. A row that carries a category (or an
 * explicit target) opens the page that already exists for it, and an unread row
 * can be marked read through the backend. Nothing is inferred as a delivered or
 * read state that the backend did not report.
 */
function NotificationItem({
  notification,
  compact = false,
  onMarkAsRead,
  isMarking = false,
  markReadDisabled = false,
}) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const title = formatNotificationTitle(notification)
  const message = formatNotificationMessage(notification)
  const unread = isNotificationUnread(notification)
  const target = resolveNotificationTarget(notification, user?.role)
  const category = getNotificationCategory(notification)
  const categoryLabel = getNotificationCategoryLabel(notification)
  const dateTime = getNotificationDateTime(notification)
  const relativeTime = formatNotificationRelativeTime(notification)
  const absoluteTime = formatNotificationCreatedAt(notification)
  const TypeIcon = TYPE_ICONS[getNotificationType(notification)] ?? Info
  const categoryIcon = getNotificationCategoryIcon(notification)
  const CategoryIcon = CATEGORY_ICONS[categoryIcon] ?? null
  const id = getNotificationId(notification)

  const handleClick = () => {
    if (target) {
      navigate(target)
    }
  }

  const handleMarkAsRead = () => {
    if (id) {
      onMarkAsRead?.(notification)
    }
  }

  const className = [
    'notification-item',
    unread ? 'notification-item--unread' : '',
    target ? 'notification-item--interactive' : '',
    compact ? 'notification-item--compact' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <li className={className} data-category={category ?? undefined}>
      <button
        type="button"
        className="notification-item__button"
        onClick={handleClick}
        disabled={!target}
        aria-label={
          target
            ? `${title || 'Notification'}${unread ? ', unread' : ''}. Opens the related page.`
            : undefined
        }
      >
        <span
          className={`notification-item__icon notification-item__icon--${getNotificationType(
            notification,
          )}`}
          aria-hidden="true"
        >
          {CategoryIcon ? <CategoryIcon size={16} /> : <TypeIcon size={16} />}
        </span>

        <span className="notification-item__body">
          <span className="notification-item__title-row">
            <span className="notification-item__title">{title || 'Notification'}</span>
            {categoryLabel ? (
              <span className="notification-item__category">{categoryLabel}</span>
            ) : null}
          </span>

          {!compact && message ? (
            <span className="notification-item__message">{message}</span>
          ) : null}

          <span className="notification-item__meta">
            {dateTime ? (
              <time
                className="notification-item__date"
                dateTime={dateTime}
                title={absoluteTime || undefined}
              >
                {relativeTime}
              </time>
            ) : null}
            {unread ? (
              <>
                <span className="notification-item__dot" aria-hidden="true" />
                <span className="visually-hidden">Unread</span>
              </>
            ) : null}
          </span>
        </span>
      </button>

      {!compact && unread ? (
        <button
          type="button"
          className="notification-item__read"
          onClick={handleMarkAsRead}
          disabled={!id || markReadDisabled || isMarking}
          aria-label={
            isMarking ? 'Marking as read' : `Mark "${title || 'notification'}" as read`
          }
          title="Mark as read"
        >
          {isMarking ? (
            <span className="spinner notification-item__read-spinner" aria-hidden="true" />
          ) : (
            <Check size={14} aria-hidden="true" />
          )}
        </button>
      ) : null}
    </li>
  )
}

export default NotificationItem
