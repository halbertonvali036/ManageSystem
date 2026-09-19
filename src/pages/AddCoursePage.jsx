import { useNavigate } from 'react-router-dom'
import Card from '@/components/common/Card'
import CourseForm from '@/components/courses/CourseForm'
import useCreateCourse from '@/hooks/useCreateCourse'
import useDepartments from '@/hooks/useDepartments'
import useTeachers from '@/hooks/useTeachers'

function AddCoursePage() {
  const navigate = useNavigate()
  const { isSubmitting, submitError, fieldErrors, submit } = useCreateCourse()
  const { departments, isLoading: departmentsLoading } = useDepartments()
  const { teachers, isLoading: teachersLoading } = useTeachers()

  const handleCancel = () => {
    navigate('/courses')
  }

  const handleSubmit = async (values) => {
    const result = await submit(values)
    if (result.ok) {
      navigate('/courses')
    }
  }

  return (
    <div className="page">
      <p className="page-description">
        Fill in the details below to create a new course record.
      </p>
      <Card title="Add Course">
        <CourseForm
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

export default AddCoursePage