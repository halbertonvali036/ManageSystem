import { ClipboardList } from 'lucide-react'
import Card from '@/components/common/Card'
import AssessmentStatusBadge from '@/components/assessments/AssessmentStatusBadge'
import {
  formatAssessmentClassName,
  formatAssessmentCourseName,
  formatAssessmentDate,
  formatAssessmentMaximumScore,
  formatAssessmentTitle,
  formatAssessmentType,
} from '@/models/assessment'

const COLUMNS = [
  { key: 'assessment', label: 'Assessment' },
  { key: 'type', label: 'Type' },
  { key: 'course', label: 'Course' },
  { key: 'class', label: 'Class' },
  { key: 'maxScore', label: 'Max Score' },
  { key: 'date', label: 'Date' },
  { key: 'status', label: 'Status' },
]

function LoadingState() {
  return (
    <Card>
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        Loading assessments&hellip;
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state table-state--error">
        <h3 className="table-state__title">Failed to load assessments</h3>
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
        <ClipboardList
          className="table-state__icon"
          size={40}
          aria-hidden="true"
        />
        <h3 className="table-state__title">No assessments yet</h3>
        <p className="table-state__text">
          Assessments published for your classes will appear here once data is
          available.
        </p>
      </div>
    </Card>
  )
}

function StudentAssessmentsTable({
  assessments,
  isLoading,
  error,
  onRetry,
}) {
  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={onRetry} />
  }

  if (assessments.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="table-responsive">
      <table className="assessments-table">
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
          {assessments.map((assessment) => (
            <tr key={assessment.id}>
              <td className="assessments-table__name">
                {formatAssessmentTitle(assessment)}
              </td>
              <td>{formatAssessmentType(assessment)}</td>
              <td>{formatAssessmentCourseName(assessment)}</td>
              <td>{formatAssessmentClassName(assessment)}</td>
              <td className="assessments-table__score">
                {formatAssessmentMaximumScore(assessment)}
              </td>
              <td className="assessments-table__date">
                {formatAssessmentDate(assessment)}
              </td>
              <td>
                <AssessmentStatusBadge status={assessment.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default StudentAssessmentsTable