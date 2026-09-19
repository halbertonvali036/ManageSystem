import { Eye, Award } from 'lucide-react'
import Card from '@/components/common/Card'
import {
  formatGradeAssessmentType,
  formatGradeClassName,
  formatGradeCourseName,
  formatGradeDate,
  formatGradeMaximumScore,
  formatGradePercentage,
  formatGradeScoreValue,
  formatGradeStudentId,
  formatGradeStudentName,
} from '@/models/grade'

const COLUMNS = [
  { key: 'student', label: 'Student' },
  { key: 'studentId', label: 'Student ID' },
  { key: 'class', label: 'Class' },
  { key: 'course', label: 'Course' },
  { key: 'assessment', label: 'Assessment' },
  { key: 'score', label: 'Score' },
  { key: 'maximumScore', label: 'Maximum Score' },
  { key: 'percentage', label: 'Percentage' },
  { key: 'date', label: 'Date' },
  { key: 'actions', label: 'Actions' },
]

const resolveStudentId = (grade) =>
  grade?.student?.id ?? grade?.studentId ?? null

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
          Grade records will appear here once your class data is available.
        </p>
      </div>
    </Card>
  )
}

function TeacherGradesTable({ grades, isLoading, error, onRetry, onView }) {
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
          {grades.map((grade) => {
            const studentId = resolveStudentId(grade)
            return (
              <tr key={grade.id} className="grades-table__row">
                <td className="grades-table__name">
                  {formatGradeStudentName(grade)}
                </td>
                <td className="grades-table__id">
                  {formatGradeStudentId(grade)}
                </td>
                <td>{formatGradeClassName(grade)}</td>
                <td>{formatGradeCourseName(grade)}</td>
                <td>{formatGradeAssessmentType(grade)}</td>
                <td className="grades-table__score">
                  {formatGradeScoreValue(grade)}
                </td>
                <td>{formatGradeMaximumScore(grade)}</td>
                <td className="grades-table__percentage">
                  {formatGradePercentage(grade)}
                </td>
                <td className="grades-table__date">
                  {formatGradeDate(grade.date)}
                </td>
                <td>
                  <div className="grades-table__actions">
                    <button
                      type="button"
                      className="grades-table__action"
                      aria-label="View student profile"
                      title="View student profile"
                      disabled={!studentId || !onView}
                      onClick={() => onView?.(studentId)}
                    >
                      <Eye size={16} aria-hidden="true" />
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

export default TeacherGradesTable