import { Eye, Pencil, Trash2, CalendarClock } from 'lucide-react'
import Card from '@/components/common/Card'
import ScheduleEntryStatusBadge from '@/components/schedules/ScheduleEntryStatusBadge'
import {
  formatScheduleClassName,
  formatScheduleCourseName,
  formatScheduleDayLabel,
  formatScheduleRoom,
  formatScheduleTimeRange,
} from '@/models/schedule'

const COLUMNS = [
  { key: 'day', label: 'Day' },
  { key: 'time', label: 'Time' },
  { key: 'class', label: 'Class' },
  { key: 'course', label: 'Course' },
  { key: 'room', label: 'Room' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

function LoadingState() {
  return (
    <Card>
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        Loading schedule entries&hellip;
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state table-state--error">
        <h3 className="table-state__title">Failed to load schedules</h3>
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
        <CalendarClock className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">No schedule entries yet</h3>
        <p className="table-state__text">
          No schedule has been created for this period yet. Use “Add Entry” to
          set up classes once the data sources are available.
        </p>
      </div>
    </Card>
  )
}

function SchedulesTable({
  schedules,
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

  if (schedules.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="table-responsive">
      <table className="schedules-table">
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
          {schedules.map((entry) => (
            <tr
              key={entry.id}
              className="schedules-table__row"
              onClick={() => onView(entry)}
            >
              <td className="schedules-table__day">
                {formatScheduleDayLabel(entry.dayOfWeek)}
              </td>
              <td className="schedules-table__time">
                {formatScheduleTimeRange(entry)}
              </td>
              <td className="schedules-table__name">
                {formatScheduleClassName(entry)}
              </td>
              <td>{formatScheduleCourseName(entry)}</td>
              <td>Room {formatScheduleRoom(entry)}</td>
              <td>
                <ScheduleEntryStatusBadge status={entry.status} />
              </td>
              <td>
                <div className="schedules-table__actions">
                  <button
                    type="button"
                    className="schedules-table__action"
                    aria-label="View schedule entry"
                    title="View schedule entry"
                    onClick={(event) => {
                      event.stopPropagation()
                      onView(entry)
                    }}
                  >
                    <Eye size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="schedules-table__action"
                    aria-label="Edit schedule entry"
                    title="Edit schedule entry"
                    onClick={(event) => {
                      event.stopPropagation()
                      onEdit(entry)
                    }}
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="schedules-table__action schedules-table__action--danger"
                    aria-label="Delete schedule entry"
                    title="Delete schedule entry"
                    onClick={(event) => {
                      event.stopPropagation()
                      onDelete(entry)
                    }}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default SchedulesTable