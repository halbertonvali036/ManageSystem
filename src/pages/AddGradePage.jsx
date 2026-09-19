import { useNavigate } from 'react-router-dom'
import Card from '@/components/common/Card'
import GradeForm from '@/components/grades/GradeForm'
import useCreateGrade from '@/hooks/useCreateGrade'
import { toGradePayload } from '@/utils/gradeForm'

function AddGradePage() {
  const navigate = useNavigate()
  const { isSubmitting, submitError, fieldErrors, submit } = useCreateGrade()

  const handleCancel = () => {
    navigate('/grades')
  }

  const handleSubmit = async (values) => {
    const result = await submit(toGradePayload(values))
    if (result.ok) {
      navigate('/grades')
    }
  }

  return (
    <div className="add-grade-page">
      <p className="page-description">
        Record a single grade for one student. Select the student, class and
        course, then enter the score details.
      </p>
      <Card title="Add Grade">
        <GradeForm
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

export default AddGradePage