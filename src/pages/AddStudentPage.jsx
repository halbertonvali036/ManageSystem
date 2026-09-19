import { useNavigate } from 'react-router-dom'
import Card from '@/components/common/Card'
import StudentForm from '@/components/students/StudentForm'
import useCreateStudent from '@/hooks/useCreateStudent'

function AddStudentPage() {
  const navigate = useNavigate()
  const { isSubmitting, submitError, fieldErrors, submit } = useCreateStudent()

  const handleCancel = () => {
    navigate('/students')
  }

  const handleSubmit = async (values) => {
    const result = await submit(values)
    if (result.ok) {
      navigate('/students')
    }
  }

  return (
    <div className="page">
      <p className="page-description">
        Fill in the details below to create a new student record.
      </p>
      <Card title="Add Student">
        <StudentForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          submitError={submitError}
          serverFieldErrors={fieldErrors}
        />
      </Card>
    </div>
  )
}

export default AddStudentPage