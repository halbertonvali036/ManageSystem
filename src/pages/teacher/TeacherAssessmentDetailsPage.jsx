import { useNavigate, useParams } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import Card from '@/components/common/Card'
import TeacherAssessmentDetailsCard from '@/components/teacher/assessments/TeacherAssessmentDetailsCard'
import useMyAssessment from '@/hooks/teacher/useMyAssessment'
import { BackendNotConnectedError } from '@/services/httpClient'

function UnavailableState() {
  return (
    <Card>
      <div className="table-state">
        <ClipboardList className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">Assessment data is unavailable</h3>
        <p className="table-state__text">
          Assessment data will be available when the backend API is connected.
        </p>
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state">
        <h3 className="table-state__title">Failed to load assessment</h3>
        <p className="table-state__text">{message}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      </div>
    </Card>
  )
}

function TeacherAssessmentDetails({ assessmentId }) {
  const navigate = useNavigate()
  const { assessment, isLoading, error, refetch } = useMyAssessment(
    assessmentId,
  )

  const handleEnterGrades = () => {
    if (assessmentId) {
      navigate(
        `/teacher/grades/bulk?assessmentId=${encodeURIComponent(assessmentId)}`,
      )
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading assessment details&hellip;
        </div>
      </Card>
    )
  }

  if (error) {
    return error instanceof BackendNotConnectedError ? (
      <UnavailableState />
    ) : (
      <ErrorState message={error.message} onRetry={refetch} />
    )
  }

  if (!assessment) {
    return null
  }

  return (
    <TeacherAssessmentDetailsCard
      assessment={assessment}
      onBack={() => navigate('/teacher/assessments')}
      onEnterGrades={handleEnterGrades}
    />
  )
}

function TeacherAssessmentDetailsPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <TeacherAssessmentDetails key={id} assessmentId={id} />
}

export default TeacherAssessmentDetailsPage