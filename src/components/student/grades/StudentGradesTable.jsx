import { Award, Eye } from 'lucide-react'
import Card from '@/components/common/Card'
import GradeStatusBadge from '@/components/grades/GradeStatusBadge'
import {
  deriveGradeLetter,
  formatGradeAssessmentType,
  formatGradeClassName,
  formatGradeCourseName,
  formatGradeDate,
  formatGradeMaximumScore,
  formatGradePercentage,
  formatGradeScoreValue,
} from '@/models/grade'

const COLUMNS = [
  { key: 'course', label: 'Course' },
  { key: 'class', label: 'Class' },
  { key: 'assessmentType', label: 'Assessment Type' },
  { key: 'assessmentName', label: 'Assessment Name' },
  { key: 'score', label: 'Score' },
  { key: 'maximumScore', label: 'Maximum Score' },
  { key: 'percentage', label: 'Percentage' },
  { key: 'letter', label: 'Letter Grade' },
  { key: 'date', label: 'Date' },
  { key: 'notes', label: 'Notes' },
  { key: 'actions', label: '' },
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

function EmptyState({ hasActiveFilters, onClearFilters, backendConnected }) {
  const title = !backendConnected
    ? 'Grades not available yet'
    : hasActiveFilters
      ? 'No matching grades'
      : 'No grades yet'

  const text = !backendConnected
    ? 'Grade data will be available when the backend API is connected.'
    : hasActiveFilters
      ? 'Try adjusting your search or filters.'
      : 'Grades published for your courses will appear here once they are available.'

  return (
    <Card>
      <div className="table-state">
        <Award className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">{title}</h3>
        <p className="table-state__text">{text}</p>
        {hasActiveFilters ? (
          <button
            type="button"
            className="btn btn--icon-left"
            onClick={onClearFilters}
          >
            Clear filters
          </button>
        ) : null}
      </div>
    </Card>
  )
}

function StudentGradesTable({
  grades,
  isLoading,
  error,
  onRetry,
  onView,
  hasActiveFilters,
  onClearFilters,
  backendConnected,
}) {
  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={onRetry} />
  }

  if (grades.length === 0) {
    return (
      <EmptyState
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
        backendConnected={backendConnected}
      />
    )
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
              onClick={() => onView(grade)}
            >
              <td className="grades-table__name">
                {formatGradeCourseName(grade)}
              </td>
              <td>{formatGradeClassName(grade)}</td>
              <td>{formatGradeAssessmentType(grade)}</td>
              <td>{grade.assessmentName || '—'}</td>
              <td>{formatGradeScoreValue(grade)}</td>
              <td>{formatGradeMaximumScore(grade)}</td>
              <td>{formatGradePercentage(grade)}</td>
              <td>
                {deriveGradeLetter(grade) ? (
                  <GradeStatusBadge record={grade} />
                ) : (
                  '—'
                )}
              </td>
              <td>{formatGradeDate(grade.date)}</td>
              <td>{grade.notes || '—'}</td>
              <td>
                <div className="grades-table__actions">
                  <button
                    type="button"
                    className="grades-table__action"
                    aria-label="View grade details"
                    title="View grade details"
                    onClick={(event) => {
                      event.stopPropagation()
                      onView(grade)
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

export default StudentGradesTable