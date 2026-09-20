import { CheckCircle2, Info, TriangleAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import {
  formatNotificationCreatedAt,
  formatNotificationMessage,
  formatNotificationTitle,
  getNotificationType,
  isNotificationUnread,
  resolveNotificationTarget,
} from '@/models/notification'

const TYPE_ICONS = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: TriangleAlert,
}

function NotificationItem({ notification, compact = false }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const title = formatNotificationTitle(notification)
  const message = formatNotificationMessage(notification)
  const createdAt = formatNotificationCreatedAt(notification)
  const unread = isNotificationUnread(notification)
  const target = resolveNotificationTarget(notification, user?.role)
  const Icon = TYPE_ICONS[getNotificationType(notification)] ?? Info

  const handleClick = () => {
    if (target) {
      navigate(target)
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
    <li className={className}>
      <button
        type="button"
        className="notification-item__button"
        onClick={handleClick}
        disabled={!target}
      >
        <span
          className={`notification-item__icon notification-item__icon--${getNotificationType(
            notification,
          )}`}
        >
          <Icon size={16} aria-hidden="true" />
        </span>
        <span className="notification-item__body">
          <span className="notification-item__title">{title}</span>
          {!compact && message ? (
            <span className="notification-item__message">{message}</span>
          ) : null}
          <span className="notification-item__meta">
            {createdAt ? (
              <span className="notification-item__date">{createdAt}</span>
            ) : null}
            {unread ? (
              <span className="notification-item__dot" aria-hidden="true" />
            ) : null}
          </span>
        </span>
      </button>
    </li>
  )
}

export default NotificationItem