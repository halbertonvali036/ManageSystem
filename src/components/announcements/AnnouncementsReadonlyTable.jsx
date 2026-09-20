import { Megaphone } from 'lucide-react'
import Card from '@/components/common/Card'
import AnnouncementStatusBadge from '@/components/announcements/AnnouncementStatusBadge'
import {
  formatAnnouncementAudienceLabel,
  formatAnnouncementContextLabel,
  formatAnnouncementDate,
  formatAnnouncementMessage,
  formatAnnouncementTitle,
} from '@/models/announcement'

const COLUMNS = [
  { key: 'title', label: 'Title' },
  { key: 'message', label: 'Message' },
  { key: 'audience', label: 'Audience' },
  { key: 'publishDate', label: 'Publish Date' },
  { key: 'expiryDate', label: 'Expiry' },
  { key: 'status', label: 'Status' },
]

function LoadingState() {
  return (
    <Card>
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        Loading announcements&hellip;
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state table-state--error">
        <h3 className="table-state__title">Failed to load announcements</h3>
        <p className="table-state__text">{message}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      </div>
    </Card>
  )
}

function EmptyState() {
  return (
    <Card>
      <div className="table-state">
        <Megaphone className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">No announcements are available.</h3>
      </div>
    </Card>
  )
}

function AnnouncementsReadonlyTable({
  announcements,
  isLoading,
  error,
  onRetry,
}) {
  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={onRetry} />
  }

  if (announcements.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="table-responsive">
      <table className="announcements-table announcements-table--readonly">
        <thead>
          <tr>
            {COLUMNS.map((column) => (
              <th key={column.key} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {announcements.map((announcement) => {
            const context = formatAnnouncementContextLabel(announcement)
            return (
              <tr
                key={announcement.id}
                className="announcements-table__row"
              >
                <td className="announcements-table__title">
                  {formatAnnouncementTitle(announcement)}
                </td>
                <td className="announcements-table__message">
                  {formatAnnouncementMessage(announcement)}
                </td>
                <td>
                  {formatAnnouncementAudienceLabel(announcement.audience)}
                  {context && context !== '—' ? (
                    <>
                      {' '}
                      <span className="text-muted">· {context}</span>
                    </>
                  ) : null}
                </td>
                <td className="announcements-table__date">
                  {formatAnnouncementDate(announcement.publishDate)}
                </td>
                <td className="announcements-table__expiry">
                  {announcement.expiryDate
                    ? formatAnnouncementDate(announcement.expiryDate)
                    : '—'}
                </td>
                <td>
                  <AnnouncementStatusBadge status={announcement.status} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default AnnouncementsReadonlyTable