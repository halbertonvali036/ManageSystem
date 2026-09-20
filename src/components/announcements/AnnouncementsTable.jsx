import { Eye, Megaphone, Pencil, Trash2 } from 'lucide-react'
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
  { key: 'actions', label: 'Actions' },
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
        <p className="table-state__text">
          Announcements will appear here once data is available.
        </p>
      </div>
    </Card>
  )
}

function AnnouncementsTable({
  announcements,
  isLoading,
  error,
  onRetry,
  onView,
  onEdit,
  onDelete,
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

  const deleteDisabled = !onDelete

  return (
    <div className="table-responsive">
      <table className="announcements-table">
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
                onClick={() => onView(announcement)}
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
                <td>
                  <div className="announcements-table__actions">
                    <button
                      type="button"
                      className="announcements-table__action"
                      aria-label="View announcement"
                      title="View announcement"
                      onClick={(event) => {
                        event.stopPropagation()
                        onView(announcement)
                      }}
                    >
                      <Eye size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="announcements-table__action"
                      aria-label="Edit announcement"
                      title="Edit announcement"
                      onClick={(event) => {
                        event.stopPropagation()
                        onEdit(announcement)
                      }}
                    >
                      <Pencil size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="announcements-table__action announcements-table__action--danger"
                      aria-label={
                        deleteDisabled
                          ? 'Delete announcement will be available later'
                          : 'Delete announcement'
                      }
                      title={
                        deleteDisabled
                          ? 'Delete becomes available in a later milestone'
                          : 'Delete announcement'
                      }
                      disabled={deleteDisabled}
                      onClick={
                        deleteDisabled
                          ? undefined
                          : (event) => {
                              event.stopPropagation()
                              onDelete(announcement)
                            }
                      }
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default AnnouncementsTable