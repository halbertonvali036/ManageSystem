import { useNavigate } from 'react-router-dom'
import Card from '@/components/common/Card'
import TeacherForm from '@/components/teachers/TeacherForm'
import useCreateTeacher from '@/hooks/useCreateTeacher'

function AddTeacherPage() {
  const navigate = useNavigate()
  const { isSubmitting, submitError, fieldErrors, submit } = useCreateTeacher()

  const handleCancel = () => {
    navigate('/teachers')
  }

  const handleSubmit = async (values) => {
    const result = await submit(values)
    if (result.ok) {
      navigate('/teachers')
    }
  }

  return (
    <div className="page">
      <p className="page-description">
        Fill in the details below to create a new teacher record.
      </p>
      <Card title="Add Teacher">
        <TeacherForm
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

export default AddTeacherPage