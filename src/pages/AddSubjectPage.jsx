import { useNavigate } from 'react-router-dom'
import Card from '@/components/common/Card'
import SubjectForm from '@/components/subjects/SubjectForm'
import useCreateSubject from '@/hooks/useCreateSubject'

function AddSubjectPage() {
  const navigate = useNavigate()
  const { isSubmitting, submitError, fieldErrors, submit } =
    useCreateSubject()

  const handleCancel = () => {
    navigate('/subjects')
  }

  const handleSubmit = async (payload) => {
    const result = await submit(payload)
    if (result.ok) {
      navigate('/subjects')
    }
  }

  return (
    <div className="add-subject-page">
      <p className="page-description">
        Create a new subject and assign it to a department. Subject records
        can be reused by class and course forms.
      </p>
      <Card title="Add Subject">
        <SubjectForm
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

export default AddSubjectPage