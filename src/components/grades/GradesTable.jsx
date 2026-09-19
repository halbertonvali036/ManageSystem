import { Eye, Pencil, Trash2, Award } from 'lucide-react'
import Card from '@/components/common/Card'
import GradeStatusBadge from '@/components/grades/GradeStatusBadge'
import {
  deriveGradeLetter,
  formatGradeAssessmentType,
  formatGradeCourseName,
  formatGradeDate,
  formatGradePercentage,
  formatGradeScore,
  formatGradeStudentId,
  formatGradeStudentName,
} from '@/models/grade'

const COLUMNS = [
  { key: 'student', label: 'Student' },
  { key: 'studentId', label: 'Student ID' },
  { key: 'course', label: 'Course' },
  { key: 'assessment', label: 'Assessment' },
  { key: 'score', label: 'Score' },
  { key: 'percentage', label: 'Percentage' },
  { key: 'grade', label: 'Grade' },
  { key: 'date', label: 'Date' },
  { key: 'actions', label: 'Actions' },
]

function LoadingState() {
  return (
    <Card>
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        Loading grades&hellip;
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state table-state--error">
        <h3 className="table-state__title">Failed to load grades</h3>
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
        <Award className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">No grades yet</h3>
        <p className="table-state__text">
          Grade records will appear here once data is available.
        </p>
      </div>
    </Card>
  )
}

function GradesTable({ grades, isLoading, error, onRetry, onView, onEdit, onDelete }) {
  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={onRetry} />
  }

  if (grades.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="table-responsive">
      <table className="grades-table">
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
          {grades.map((grade) => (
            <tr
              key={grade.id}
              className="grades-table__row"
              onClick={() => onView?.(grade)}
            >
              <td className="grades-table__name">
                {formatGradeStudentName(grade)}
              </td>
              <td className="grades-table__id">{formatGradeStudentId(grade)}</td>
              <td>{formatGradeCourseName(grade)}</td>
              <td>{formatGradeAssessmentType(grade)}</td>
              <td className="grades-table__score">
                {formatGradeScore(grade)}
              </td>
              <td className="grades-table__percentage">
                {formatGradePercentage(grade)}
              </td>
              <td>
                {deriveGradeLetter(grade) ? (
                  <GradeStatusBadge record={grade} />
                ) : (
                  '—'
                )}
              </td>
              <td className="grades-table__date">
                {formatGradeDate(grade.date)}
              </td>
              <td>
                <div className="grades-table__actions">
                  <button
                    type="button"
                    className="grades-table__action"
                    aria-label="View grade"
                    title="View grade"
                    disabled={!onView}
                    onClick={(event) => {
                      event.stopPropagation()
                      onView?.(grade)
                    }}
                  >
                    <Eye size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="grades-table__action"
                    aria-label="Edit grade"
                    title="Edit grade"
                    disabled={!onEdit}
                    onClick={(event) => {
                      event.stopPropagation()
                      onEdit?.(grade)
                    }}
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="grades-table__action grades-table__action--danger"
                    aria-label="Delete grade"
                    title="Delete grade"
                    disabled={!onDelete}
                    onClick={(event) => {
                      event.stopPropagation()
                      onDelete?.(grade)
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

export default GradesTable