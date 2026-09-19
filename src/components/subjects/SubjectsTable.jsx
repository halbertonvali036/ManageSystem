import { BookMarked, Eye, Pencil, Trash2 } from 'lucide-react'
import Card from '@/components/common/Card'
import SubjectStatusBadge from '@/components/subjects/SubjectStatusBadge'
import {
  formatSubjectCode,
  formatSubjectDepartmentName,
  formatSubjectName,
} from '@/models/subject'

const COLUMNS = [
  { key: 'code', label: 'Code' },
  { key: 'subject', label: 'Subject' },
  { key: 'department', label: 'Department' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

function LoadingState() {
  return (
    <Card>
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        Loading subjects&hellip;
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state table-state--error">
        <h3 className="table-state__title">Failed to load subjects</h3>
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
        <BookMarked className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">No subjects yet</h3>
        <p className="table-state__text">
          Subject records will appear here once data is available.
        </p>
      </div>
    </Card>
  )
}

function SubjectsTable({
  subjects,
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

  if (subjects.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="table-responsive">
      <table className="subjects-table">
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
          {subjects.map((subject) => (
            <tr key={subject.id} onClick={() => onView?.(subject)}>
              <td className="subjects-table__code">
                {formatSubjectCode(subject)}
              </td>
              <td className="subjects-table__name">{formatSubjectName(subject)}</td>
              <td>{formatSubjectDepartmentName(subject)}</td>
              <td>
                <SubjectStatusBadge status={subject.status} />
              </td>
              <td>
                <div className="students-table__actions">
                  <button
                    type="button"
                    className="students-table__action"
                    aria-label="View subject"
                    title="View subject"
                    disabled={!onView}
                    onClick={(event) => {
                      event.stopPropagation()
                      onView?.(subject)
                    }}
                  >
                    <Eye size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="students-table__action"
                    aria-label="Edit subject"
                    title="Edit subject"
                    disabled={!onEdit}
                    onClick={(event) => {
                      event.stopPropagation()
                      onEdit?.(subject)
                    }}
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="students-table__action students-table__action--danger"
                    aria-label="Delete subject"
                    title="Delete subject"
                    disabled={!onDelete}
                    onClick={(event) => {
                      event.stopPropagation()
                      onDelete?.(subject)
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

export default SubjectsTable