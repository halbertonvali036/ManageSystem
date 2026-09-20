import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import NotificationDropdown from '@/components/notifications/NotificationDropdown'
import useUnreadNotificationCount from '@/hooks/useUnreadNotificationCount'

function NotificationBell() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const toggleRef = useRef(null)
  const { unreadCount, isLoading } = useUnreadNotificationCount()

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const showBadge = !isLoading && unreadCount > 0

  return (
    <div className="notification-bell" ref={containerRef}>
      <button
        type="button"
        ref={toggleRef}
        className="notification-bell__button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={
          showBadge
            ? `Notifications: ${unreadCount} unread`
            : 'Open notifications'
        }
        title="Notifications"
      >
        <Bell size={20} aria-hidden="true" />
        {showBadge ? (
          <span className="notification-bell__badge" aria-hidden="true">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>
      {open ? <NotificationDropdown onClose={() => setOpen(false)} /> : null}
    </div>
  )
}

export default NotificationBell