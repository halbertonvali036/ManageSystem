import { useNavigate, useParams } from 'react-router-dom'
import Card from '@/components/common/Card'
import StudentForm from '@/components/students/StudentForm'
import useStudent from '@/hooks/useStudent'
import useUpdateStudent from '@/hooks/useUpdateStudent'
import { BackendNotConnectedError } from '@/services/httpClient'

function EditStudentContent({ studentId }) {
  const navigate = useNavigate()
  const { student, isLoading, error, refetch } = useStudent(studentId)
  const { isSubmitting, submitError, fieldErrors, submit } =
    useUpdateStudent(studentId)

  const handleCancel = () => {
    navigate(`/students/${studentId}`)
  }

  const handleSubmit = async (values) => {
    const result = await submit(values)
    if (result.ok) {
      navigate(`/students/${studentId}`)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading student&hellip;
        </div>
      </Card>
    )
  }

  if (error) {
    return error instanceof BackendNotConnectedError ? (
      <Card>
        <div className="table-state">
          <h3 className="table-state__title">Student data is unavailable</h3>
          <p className="table-state__text">
            Student data will be available when the backend API is connected.
          </p>
        </div>
      </Card>
    ) : (
      <Card>
        <div className="table-state">
          <h3 className="table-state__title">Failed to load student</h3>
          <p className="table-state__text">{error.message}</p>
          <button type="button" className="btn btn--primary" onClick={refetch}>
            Retry
          </button>
        </div>
      </Card>
    )
  }

  if (!student) {
    return null
  }

  return (
    <div className="edit-student-page">
      <p className="page-description">
        Update the student record below and save your changes.
      </p>
      <Card title="Edit Student">
        <StudentForm
          initialValues={student}
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

function EditStudentPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <EditStudentContent key={id} studentId={id} />
}

export default EditStudentPage