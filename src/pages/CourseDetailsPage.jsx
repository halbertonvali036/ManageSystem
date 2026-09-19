import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import CourseProfile from '@/components/courses/CourseProfile'
import useCourse from '@/hooks/useCourse'
import useDeleteCourse from '@/hooks/useDeleteCourse'
import { BackendNotConnectedError } from '@/services/httpClient'

function UnavailableState() {
  return (
    <Card>
      <div className="table-state">
        <BookOpen className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">Course data is unavailable</h3>
        <p className="table-state__text">
          Course data will be available when the backend API is connected.
        </p>
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state">
        <h3 className="table-state__title">Failed to load course</h3>
        <p className="table-state__text">{message}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      </div>
    </Card>
  )
}

function CourseDetails({ courseId }) {
  const navigate = useNavigate()
  const { course, isLoading, error, refetch } = useCourse(courseId)
  const { isDeleting, deleteError, deleteCourse } = useDeleteCourse(courseId)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDeleteConfirm = async () => {
    const result = await deleteCourse()
    if (result.ok) {
      navigate('/courses', { replace: true })
    }
  }

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
      <UnavailableState />
    ) : (
      <ErrorState message={error.message} onRetry={refetch} />
    )
  }

  if (!course) {
    return null
  }

  return (
    <>
      <CourseProfile
        course={course}
        onBack={() => navigate('/courses')}
        onEdit={() => navigate(`/courses/${courseId}/edit`)}
        onDelete={() => setShowDeleteDialog(true)}
      />
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete course"
        message="This action is permanent and cannot be undone."
        confirmLabel="Delete Course"
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      >
        <div className="modal__target">
          <p className="modal__target-row">
            Course: <strong>{course.name || '—'}</strong>
          </p>
          <p className="modal__target-row">
            Course Code: <strong>{course.courseCode || '—'}</strong>
          </p>
        </div>
      </ConfirmDialog>
    </>
  )
}

function CourseDetailsPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <CourseDetails key={id} courseId={id} />
}

export default CourseDetailsPage