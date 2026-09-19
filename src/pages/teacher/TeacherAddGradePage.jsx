import { useNavigate } from 'react-router-dom'
import Card from '@/components/common/Card'
import TeacherGradeForm from '@/components/teacher/grades/TeacherGradeForm'
import useTeacherCreateGrade from '@/hooks/teacher/useTeacherCreateGrade'
import { toGradePayload } from '@/utils/gradeForm'

function TeacherAddGradePage() {
  const navigate = useNavigate()
  const { isSubmitting, submitError, fieldErrors, submit } =
    useTeacherCreateGrade()

  const handleCancel = () => {
    navigate('/teacher/grades')
  }

  const handleSubmit = async (values) => {
    const result = await submit(toGradePayload(values))
    if (result.ok) {
      navigate('/teacher/grades')
    }
  }

  return (
    <div className="add-grade-page">
      <p className="page-description">
        Record a single grade for one of your students. Select the student, class
        and course, then enter the score details.
      </p>
      <Card title="Add Grade">
        <TeacherGradeForm
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

export default TeacherAddGradePage