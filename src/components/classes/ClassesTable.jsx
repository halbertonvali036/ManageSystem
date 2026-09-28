import { Eye, Pencil, School, Trash2 } from 'lucide-react'
import Card from '@/components/common/Card'
import ClassStatusBadge from '@/components/classes/ClassStatusBadge'
import {
  formatClassCourseName,
  formatClassName,
} from '@/models/class'

const COLUMNS = [
  { key: 'classCode', label: 'Class Code' },
  { key: 'name', label: 'Class Name' },
  { key: 'course', label: 'Course' },
  { key: 'academicYear', label: 'Academic Year' },
  { key: 'room', label: 'Room' },
  { key: 'capacity', label: 'Capacity' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

function LoadingState() {
  return (
    <Card>
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        Loading classes&hellip;
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state table-state--error">
        <h3 className="table-state__title">Failed to load classes</h3>
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
        <School className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">No classes yet</h3>
        <p className="table-state__text">
          Class records will appear here once data is available.
        </p>
      </div>
    </Card>
  )
}

function ClassesTable({
  classes,
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

  if (classes.length === 0) {
    return <EmptyState />
  }

  const deleteDisabled = !onDelete

  return (
    <div className="table-responsive">
      <table className="classes-table">
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
          {classes.map((classRecord) => (
            <tr
              key={classRecord.id}
              className="classes-table__row"
              onClick={() => onView(classRecord)}
            >
              <td className="classes-table__id">{classRecord.classCode}</td>
              <td className="classes-table__name">{formatClassName(classRecord)}</td>
              <td>{formatClassCourseName(classRecord)}</td>
              <td>{classRecord.academicYear || '—'}</td>
              <td>{classRecord.room || '—'}</td>
              <td className="classes-table__capacity">
                {classRecord.capacity != null ? classRecord.capacity : '—'}
              </td>
              <td>
                <ClassStatusBadge status={classRecord.status} />
              </td>
              <td>
                <div className="classes-table__actions">
                  <button
                    type="button"
                    className="classes-table__action"
                    aria-label="View class"
                    title="View class"
                    onClick={(event) => {
                      event.stopPropagation()
                      onView(classRecord)
                    }}
                  >
                    <Eye size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="classes-table__action"
                    aria-label="Edit class"
                    title="Edit class"
                    onClick={(event) => {
                      event.stopPropagation()
                      onEdit(classRecord)
                    }}
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="classes-table__action classes-table__action--danger"
                    aria-label={
                      deleteDisabled
                        ? 'Delete class will be available later'
                        : 'Delete class'
                    }
                    title={
                      deleteDisabled
                        ? 'Delete becomes available in a later milestone'
                        : 'Delete class'
                    }
                    disabled={deleteDisabled}
                    onClick={
                      deleteDisabled
                        ? undefined
                        : (event) => {
                            event.stopPropagation()
                            onDelete(classRecord)
                          }
                    }
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

export default ClassesTable