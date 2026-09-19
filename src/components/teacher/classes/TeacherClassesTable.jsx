import { Eye, School } from 'lucide-react'
import Card from '@/components/common/Card'
import ClassStatusBadge from '@/components/classes/ClassStatusBadge'
import { formatClassCourseName, formatClassName } from '@/models/class'
import { parseSchedule } from '@/utils/classForm'

const COLUMNS = [
  { key: 'classCode', label: 'Class Code' },
  { key: 'name', label: 'Class Name' },
  { key: 'course', label: 'Course' },
  { key: 'academicYear', label: 'Academic Year' },
  { key: 'semester', label: 'Semester' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'room', label: 'Room' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

const formatSchedule = (classRecord) => {
  const schedule = parseSchedule(classRecord.schedule || '')
  const time = schedule.startTime || classRecord.startTime || ''
  const days = schedule.days || classRecord.days || ''
  return [days, time].filter(Boolean).join(' ') || '—'
}

function LoadingState() {
  return (
    <Card>
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        Loading my classes&hellip;
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state table-state--error">
        <h3 className="table-state__title">Failed to load my classes</h3>
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
        <h3 className="table-state__title">No classes assigned yet</h3>
        <p className="table-state__text">
          Classes assigned to you will appear here once data is available.
        </p>
      </div>
    </Card>
  )
}

function TeacherClassesTable({ classes, isLoading, error, onRetry, onView }) {
  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={onRetry} />
  }

  if (classes.length === 0) {
    return <EmptyState />
  }

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
              <td className="classes-table__id">{classRecord.classCode || '—'}</td>
              <td className="classes-table__name">{formatClassName(classRecord)}</td>
              <td>{formatClassCourseName(classRecord)}</td>
              <td>{classRecord.academicYear || '—'}</td>
              <td>{classRecord.semester || '—'}</td>
              <td>{formatSchedule(classRecord)}</td>
              <td>{classRecord.room || '—'}</td>
              <td>
                <ClassStatusBadge status={classRecord.status} />
              </td>
              <td>
                <div className="classes-table__actions">
                  <button
                    type="button"
                    className="classes-table__action"
                    aria-label="View class details"
                    title="View class details"
                    onClick={(event) => {
                      event.stopPropagation()
                      onView(classRecord)
                    }}
                  >
                    <Eye size={16} aria-hidden="true" />
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

export default TeacherClassesTable