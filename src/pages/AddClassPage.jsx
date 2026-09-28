import { useNavigate } from 'react-router-dom'
import Card from '@/components/common/Card'
import ClassForm from '@/components/classes/ClassForm'
import useAcademicYears from '@/hooks/useAcademicYears'
import useCreateClass from '@/hooks/useCreateClass'
import useCourses from '@/hooks/useCourses'

function AddClassPage() {
  const navigate = useNavigate()
  const { isSubmitting, submitError, fieldErrors, submit } = useCreateClass()
  const { courses, isLoading: coursesLoading } = useCourses()
  const { academicYears, isLoading: academicYearsLoading } = useAcademicYears()

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
          academicYears={academicYears}
          coursesLoading={coursesLoading}
          academicYearsLoading={academicYearsLoading}
        />
      </Card>
    </div>
  )
}

export default AddClassPage