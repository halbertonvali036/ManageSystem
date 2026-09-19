import { useNavigate, useParams } from 'react-router-dom'
import Card from '@/components/common/Card'
import SubjectForm from '@/components/subjects/SubjectForm'
import useSubject from '@/hooks/useSubject'
import useUpdateSubject from '@/hooks/useUpdateSubject'
import { BackendNotConnectedError } from '@/services/httpClient'
import { toSubjectFormValues } from '@/utils/subjectForm'

function EditSubjectContent({ subjectId }) {
  const navigate = useNavigate()
  const { subject, isLoading, error, refetch } = useSubject(subjectId)
  const { isSubmitting, submitError, fieldErrors, submit } =
    useUpdateSubject(subjectId)

  const handleCancel = () => {
    navigate(`/subjects/${subjectId}`)
  }

  const handleSubmit = async (payload) => {
    const result = await submit(payload)
    if (result.ok) {
      navigate(`/subjects/${subjectId}`)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading subject&hellip;
        </div>
      </Card>
    )
  }

  if (error) {
    return error instanceof BackendNotConnectedError ? (
      <Card>
        <div className="table-state">
          <h3 className="table-state__title">Subject data is unavailable</h3>
          <p className="table-state__text">
            Subject data will be available when the backend API is connected.
          </p>
        </div>
      </Card>
    ) : (
      <Card>
        <div className="table-state">
          <h3 className="table-state__title">Failed to load subject</h3>
          <p className="table-state__text">{error.message}</p>
          <button type="button" className="btn btn--primary" onClick={refetch}>
            Retry
          </button>
        </div>
      </Card>
    )
  }

  if (!subject) {
    return null
  }

  return (
    <div className="edit-subject-page">
      <p className="page-description">
        Update the subject details below and save your changes.
      </p>
      <Card title="Edit Subject">
        <SubjectForm
          initialValues={toSubjectFormValues(subject)}
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

function EditSubjectPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <EditSubjectContent key={id} subjectId={id} />
}

export default EditSubjectPage