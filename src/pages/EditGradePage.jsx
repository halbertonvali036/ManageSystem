import { useNavigate, useParams } from 'react-router-dom'
import Card from '@/components/common/Card'
import GradeForm from '@/components/grades/GradeForm'
import useGrade from '@/hooks/useGrade'
import useUpdateGrade from '@/hooks/useUpdateGrade'
import { BackendNotConnectedError } from '@/services/httpClient'
import { toGradeFormValues } from '@/utils/gradeForm'

function EditGradeContent({ gradeId }) {
  const navigate = useNavigate()
  const { grade, isLoading, error, refetch } = useGrade(gradeId)
  const { isSubmitting, submitError, fieldErrors, submit } =
    useUpdateGrade(gradeId)

  const handleCancel = () => {
    navigate(`/grades/${gradeId}`)
  }

  const handleSubmit = async (values) => {
    const result = await submit(values)
    if (result.ok) {
      navigate(`/grades/${gradeId}`)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading grade&hellip;
        </div>
      </Card>
    )
  }

  if (error) {
    return error instanceof BackendNotConnectedError ? (
      <Card>
        <div className="table-state">
          <h3 className="table-state__title">Grade data is unavailable</h3>
          <p className="table-state__text">
            Grade data will be available when the backend API is connected.
          </p>
        </div>
      </Card>
    ) : (
      <Card>
        <div className="table-state">
          <h3 className="table-state__title">Failed to load grade</h3>
          <p className="table-state__text">{error.message}</p>
          <button type="button" className="btn btn--primary" onClick={refetch}>
            Retry
          </button>
        </div>
      </Card>
    )
  }

  if (!grade) {
    return null
  }

  return (
    <div className="edit-grade-page">
      <p className="page-description">
        Update the grade record below and save your changes.
      </p>
      <Card title="Edit Grade">
        <GradeForm
          initialValues={toGradeFormValues(grade)}
          submitLabel="Save Changes"
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

function EditGradePage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <EditGradeContent key={id} gradeId={id} />
}

export default EditGradePage