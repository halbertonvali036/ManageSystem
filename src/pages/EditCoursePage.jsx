import { useNavigate, useParams } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import Card from '@/components/common/Card'
import CourseForm from '@/components/courses/CourseForm'
import useCourse from '@/hooks/useCourse'
import useDepartments from '@/hooks/useDepartments'
import useTeachers from '@/hooks/useTeachers'
import useUpdateCourse from '@/hooks/useUpdateCourse'
import { BackendNotConnectedError } from '@/services/httpClient'

function EditCourseContent({ courseId }) {
  const navigate = useNavigate()
  const { course, isLoading, error, refetch } = useCourse(courseId)
  const { departments, isLoading: departmentsLoading } = useDepartments()
  const { teachers, isLoading: teachersLoading } = useTeachers()
  const { isSubmitting, submitError, fieldErrors, submit } =
    useUpdateCourse(courseId)

  const handleCancel = () => {
    navigate(`/courses/${courseId}`)
  }

  const handleSubmit = async (values) => {
    const result = await submit(values)
    if (result.ok) {
      navigate(`/courses/${courseId}`)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading course&hellip;
        </div>
      </Card>
    )
  }

  if (error) {
    return error instanceof BackendNotConnectedError ? (
      <Card>
        <div className="table-state">
          <BookOpen className="table-state__icon" size={40} aria-hidden="true" />
          <h3 className="table-state__title">Course data is unavailable</h3>
          <p className="table-state__text">
            Course data will be available when the backend API is connected.
          </p>
        </div>
      </Card>
    ) : (
      <Card>
        <div className="table-state">
          <h3 className="table-state__title">Failed to load course</h3>
          <p className="table-state__text">{error.message}</p>
          <button type="button" className="btn btn--primary" onClick={refetch}>
            Retry
          </button>
        </div>
      </Card>
    )
  }

  if (!course) {
    return null
  }

  return (
    <div className="edit-course-page">
      <p className="page-description">
        Update the course record below and save your changes.
      </p>
      <Card title="Edit Course">
        <CourseForm
          initialValues={course}
          submitLabel="Save Changes"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          submitError={submitError}
          serverFieldErrors={fieldErrors}
          departments={departments}
          departmentsLoading={departmentsLoading}
          teachers={teachers}
          teachersLoading={teachersLoading}
        />
      </Card>
    </div>
  )
}

function EditCoursePage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <EditCourseContent key={id} courseId={id} />
}

export default EditCoursePage