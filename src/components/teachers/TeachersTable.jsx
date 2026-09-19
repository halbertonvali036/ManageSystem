import { Eye, Pencil, Trash2, Users } from 'lucide-react'
import Card from '@/components/common/Card'
import TeacherStatusBadge from '@/components/teachers/TeacherStatusBadge'
import { formatTeacherName } from '@/models/teacher'

const COLUMNS = [
  { key: 'teacherId', label: 'Teacher ID' },
  { key: 'fullName', label: 'Full Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'department', label: 'Department' },
  { key: 'subject', label: 'Subject' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

function LoadingState() {
  return (
    <Card>
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        Loading teachers&hellip;
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state table-state--error">
        <h3 className="table-state__title">Failed to load teachers</h3>
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
        <Users className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">No teachers yet</h3>
        <p className="table-state__text">
          Teacher records will appear here once data is available.
        </p>
      </div>
    </Card>
  )
}

function TeachersTable({
  teachers,
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

  if (teachers.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="table-responsive">
      <table className="teachers-table">
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
          {teachers.map((teacher) => (
            <tr
              key={teacher.id}
              className="teachers-table__row"
              onClick={() => onView(teacher)}
            >
              <td className="teachers-table__id">{teacher.teacherId}</td>
              <td className="teachers-table__name">
                {formatTeacherName(teacher)}
              </td>
              <td>{teacher.email}</td>
              <td>{teacher.phone}</td>
              <td>{teacher.department}</td>
              <td>{teacher.subject}</td>
              <td>
                <TeacherStatusBadge status={teacher.status} />
              </td>
              <td>
                <div className="teachers-table__actions">
                  <button
                    type="button"
                    className="teachers-table__action"
                    aria-label="View teacher"
                    title="View teacher"
                    onClick={(event) => {
                      event.stopPropagation()
                      onView(teacher)
                    }}
                  >
                    <Eye size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="teachers-table__action"
                    aria-label="Edit teacher"
                    title="Edit teacher"
                    onClick={(event) => {
                      event.stopPropagation()
                      onEdit(teacher)
                    }}
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="teachers-table__action teachers-table__action--danger"
                    aria-label="Delete teacher"
                    title="Delete teacher"
                    onClick={(event) => {
                      event.stopPropagation()
                      onDelete(teacher)
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

export default TeachersTable