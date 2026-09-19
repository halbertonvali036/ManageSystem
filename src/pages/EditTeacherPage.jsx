import { useNavigate, useParams } from 'react-router-dom'
import Card from '@/components/common/Card'
import TeacherForm from '@/components/teachers/TeacherForm'
import useTeacher from '@/hooks/useTeacher'
import useUpdateTeacher from '@/hooks/useUpdateTeacher'
import { BackendNotConnectedError } from '@/services/httpClient'

function EditTeacherContent({ teacherId }) {
  const navigate = useNavigate()
  const { teacher, isLoading, error, refetch } = useTeacher(teacherId)
  const { isSubmitting, submitError, fieldErrors, submit } =
    useUpdateTeacher(teacherId)

  const handleCancel = () => {
    navigate(`/teachers/${teacherId}`)
  }

  const handleSubmit = async (values) => {
    const result = await submit(values)
    if (result.ok) {
      navigate(`/teachers/${teacherId}`)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading teacher&hellip;
        </div>
      </Card>
    )
  }

  if (error) {
    return error instanceof BackendNotConnectedError ? (
      <Card>
        <div className="table-state">
          <h3 className="table-state__title">Teacher data is unavailable</h3>
          <p className="table-state__text">
            Teacher data will be available when the backend API is connected.
          </p>
        </div>
      </Card>
    ) : (
      <Card>
        <div className="table-state">
          <h3 className="table-state__title">Failed to load teacher</h3>
          <p className="table-state__text">{error.message}</p>
          <button type="button" className="btn btn--primary" onClick={refetch}>
            Retry
          </button>
        </div>
      </Card>
    )
  }

  if (!teacher) {
    return null
  }

  return (
    <div className="edit-teacher-page">
      <p className="page-description">
        Update the teacher record below and save your changes.
      </p>
      <Card title="Edit Teacher">
        <TeacherForm
          initialValues={teacher}
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

function EditTeacherPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <EditTeacherContent key={id} teacherId={id} />
}

export default EditTeacherPage