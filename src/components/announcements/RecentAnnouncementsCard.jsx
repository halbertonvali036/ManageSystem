import { Megaphone } from 'lucide-react'
import Card from '@/components/common/Card'
import {
  formatAnnouncementAudienceLabel,
  formatAnnouncementDate,
  formatAnnouncementMessage,
  formatAnnouncementTitle,
} from '@/models/announcement'

function LoadingState() {
  return (
    <div className="recent-announcements__status">
      <span className="spinner" aria-hidden="true" />
      Loading announcements&hellip;
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="table-state table-state--error recent-announcements__status">
      <h3 className="table-state__title">Failed to load announcements</h3>
      <p className="table-state__text">{message}</p>
      <button type="button" className="btn btn--primary" onClick={onRetry}>
        Retry
      </button>
    </div>
  )
}

function EmptyState({ emptyText }) {
  return (
    <div className="table-state">
      <Megaphone className="table-state__icon" size={34} aria-hidden="true" />
      <h3 className="table-state__title">{emptyText}</h3>
    </div>
  )
}

function RecentAnnouncementsCard({
  title = 'Announcements',
  announcements,
  isLoading,
  error,
  onRetry,
  action,
  limit = 5,
  emptyText = 'No announcements are available.',
}) {
  return (
    <Card title={title} className="recent-announcements" action={action}>
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error.message} onRetry={onRetry} />
      ) : announcements.length === 0 ? (
        <EmptyState emptyText={emptyText} />
      ) : (
        <ul className="recent-announcements__list">
          {announcements.slice(0, limit).map((announcement) => (
            <li key={announcement.id} className="recent-announcements__item">
              <h3 className="recent-announcements__title">
                {formatAnnouncementTitle(announcement)}
              </h3>
              <p className="recent-announcements__meta">
                {formatAnnouncementAudienceLabel(announcement.audience)} ·{' '}
                {formatAnnouncementDate(announcement.publishDate)}
              </p>
              <p className="recent-announcements__preview">
                {formatAnnouncementMessage(announcement)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default RecentAnnouncementsCard