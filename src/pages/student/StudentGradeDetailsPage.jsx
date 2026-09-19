import { useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Card from '@/components/common/Card'
import StudentGradeDetails from '@/components/student/grades/StudentGradeDetails'
import useMyGrade from '@/hooks/student/useMyGrade'

function LoadingState() {
  return (
    <Card>
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        Loading grade&hellip;
      </div>
    </Card>
  )
}

function ErrorState({
  message,
  isNotFound,
  notFoundLabel,
  notFoundMessage,
  onBack,
}) {
  return (
    <Card>
      <div className="table-state table-state--error">
        <h3 className="table-state__title">
          {isNotFound ? notFoundLabel : 'Failed to load grade'}
        </h3>
        <p className="table-state__text">
          {isNotFound ? notFoundMessage : message}
        </p>
        <button type="button" className="btn btn--primary" onClick={onBack}>
          Back to Grades
        </button>
      </div>
    </Card>
  )
}

function StudentGradeDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { grade, isLoading, error } = useMyGrade(id)

  const handleBack = useCallback(() => {
    navigate('/student/grades')
  }, [navigate])

  if (isLoading) {
    return <LoadingState />
  }

  if (error || !grade) {
    const isNotFound = error?.status === 404

    return (
      <ErrorState
        message={error?.message || 'The requested grade could not be loaded.'}
        isNotFound={isNotFound}
        notFoundLabel="Grade not found"
        notFoundMessage="This grade may have been removed or is not available for your account."
        onBack={handleBack}
      />
    )
  }

  return (
    <div>
      <p className="page-description">
        Review the details of this published grade.
      </p>
      <StudentGradeDetails grade={grade} onBack={handleBack} />
    </div>
  )
}

export default StudentGradeDetailsPage