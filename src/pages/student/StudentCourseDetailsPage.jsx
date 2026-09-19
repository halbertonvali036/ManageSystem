import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen } from 'lucide-react'
import Card from '@/components/common/Card'
import StudentCourseProfile from '@/components/student/courses/StudentCourseProfile'
import useMyCourse from '@/hooks/student/useMyCourse'
import { BackendNotConnectedError } from '@/services/httpClient'

function UnavailableState({ onBack }) {
  return (
    <>
      <div className="details-toolbar">
        <button type="button" className="btn btn--icon-left" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to My Courses
        </button>
      </div>
      <Card>
        <div className="table-state">
          <BookOpen className="table-state__icon" size={40} aria-hidden="true" />
          <h3 className="table-state__title">Course data is unavailable</h3>
          <p className="table-state__text">
            Course data will be available when the backend API is connected.
          </p>
        </div>
      </Card>
    </>
  )
}

function ErrorState({ message, onRetry, onBack }) {
  return (
    <>
      <div className="details-toolbar">
        <button type="button" className="btn btn--icon-left" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to My Courses
        </button>
      </div>
      <Card>
        <div className="table-state">
          <h3 className="table-state__title">Failed to load course</h3>
          <p className="table-state__text">{message}</p>
          <button type="button" className="btn btn--primary" onClick={onRetry}>
            Retry
          </button>
        </div>
      </Card>
    </>
  )
}

function CourseDetails({ courseId }) {
  const navigate = useNavigate()
  const { course, isLoading, error, refetch } = useMyCourse(courseId)

  const handleBack = () => navigate('/student/courses')

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading course details&hellip;
        </div>
      </Card>
    )
  }

  if (error) {
    return error instanceof BackendNotConnectedError ? (
      <UnavailableState onBack={handleBack} />
    ) : (
      <ErrorState message={error.message} onRetry={refetch} onBack={handleBack} />
    )
  }

  if (!course) {
    return null
  }

  return <StudentCourseProfile course={course} onBack={handleBack} />
}

function StudentCourseDetailsPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <CourseDetails key={id} courseId={id} />
}

export default StudentCourseDetailsPage