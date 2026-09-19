import { useNavigate } from 'react-router-dom'
import Card from '@/components/common/Card'
import ClassForm from '@/components/classes/ClassForm'
import useCreateClass from '@/hooks/useCreateClass'
import useCourses from '@/hooks/useCourses'
import useTeachers from '@/hooks/useTeachers'

function AddClassPage() {
  const navigate = useNavigate()
  const { isSubmitting, submitError, fieldErrors, submit } = useCreateClass()
  const { courses, isLoading: coursesLoading } = useCourses()
  const { teachers, isLoading: teachersLoading } = useTeachers()

  const handleCancel = () => {
    navigate('/classes')
  }

  const handleSubmit = async (values) => {
    const result = await submit(values)
    if (result.ok) {
      navigate('/classes')
    }
  }

  return (
    <div className="page">
      <p className="page-description">
        Fill in the details below to create a new class record.
      </p>
      <Card title="Add Class">
        <ClassForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          submitError={submitError}
          serverFieldErrors={fieldErrors}
          courses={courses}
          teachers={teachers}
          coursesLoading={coursesLoading}
          teachersLoading={teachersLoading}
        />
      </Card>
    </div>
  )
}

export default AddClassPage