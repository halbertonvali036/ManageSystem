import { Eye, Pencil, Trash2, Users } from 'lucide-react'
import Card from '@/components/common/Card'
import StudentStatusBadge from '@/components/students/StudentStatusBadge'
import { formatStudentName } from '@/models/student'

const COLUMNS = [
  { key: 'studentId', label: 'Student ID' },
  { key: 'fullName', label: 'Full Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'className', label: 'Class' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

function LoadingState() {
  return (
    <Card>
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        Loading students&hellip;
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state table-state--error">
        <h3 className="table-state__title">Failed to load students</h3>
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
        <h3 className="table-state__title">No students yet</h3>
        <p className="table-state__text">
          Student records will appear here once data is available.
        </p>
      </div>
    </Card>
  )
}

function StudentsTable({ students, isLoading, error, onRetry, onView, onEdit, onDelete }) {
  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={onRetry} />
  }

  if (students.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="table-responsive">
      <table className="students-table">
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
          {students.map((student) => (
            <tr
              key={student.id}
              className="students-table__row"
              onClick={() => onView(student)}
            >
              <td className="students-table__id">{student.studentId}</td>
              <td className="students-table__name">
                {formatStudentName(student)}
              </td>
              <td>{student.email}</td>
              <td>{student.phone}</td>
              <td>{student.className}</td>
              <td>
                <StudentStatusBadge status={student.status} />
              </td>
              <td>
                <div className="students-table__actions">
                  <button
                    type="button"
                    className="students-table__action"
                    aria-label="View student"
                    title="View student"
                    onClick={(event) => {
                      event.stopPropagation()
                      onView(student)
                    }}
                  >
                    <Eye size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="students-table__action"
                    aria-label="Edit student"
                    title="Edit student"
                    onClick={(event) => {
                      event.stopPropagation()
                      onEdit(student)
                    }}
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="students-table__action students-table__action--danger"
                    aria-label="Delete student"
                    title="Delete student"
                    onClick={(event) => {
                      event.stopPropagation()
                      onDelete(student)
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

export default StudentsTable