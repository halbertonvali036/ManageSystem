import { useNavigate, useParams } from 'react-router-dom'
import Card from '@/components/common/Card'
import DepartmentForm from '@/components/departments/DepartmentForm'
import useDepartment from '@/hooks/useDepartment'
import useUpdateDepartment from '@/hooks/useUpdateDepartment'
import { BackendNotConnectedError } from '@/services/httpClient'
import { toDepartmentFormValues } from '@/utils/departmentForm'

function EditDepartmentContent({ departmentId }) {
  const navigate = useNavigate()
  const { department, isLoading, error, refetch } = useDepartment(departmentId)
  const { isSubmitting, submitError, fieldErrors, submit } =
    useUpdateDepartment(departmentId)

  const handleCancel = () => {
    navigate(`/departments/${departmentId}`)
  }

  const handleSubmit = async (payload) => {
    const result = await submit(payload)
    if (result.ok) {
      navigate(`/departments/${departmentId}`)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading department&hellip;
        </div>
      </Card>
    )
  }

  if (error) {
    return error instanceof BackendNotConnectedError ? (
      <Card>
        <div className="table-state">
          <h3 className="table-state__title">Department data is unavailable</h3>
          <p className="table-state__text">
            Department data will be available when the backend API is connected.
          </p>
        </div>
      </Card>
    ) : (
      <Card>
        <div className="table-state">
          <h3 className="table-state__title">Failed to load department</h3>
          <p className="table-state__text">{error.message}</p>
          <button type="button" className="btn btn--primary" onClick={refetch}>
            Retry
          </button>
        </div>
      </Card>
    )
  }

  if (!department) {
    return null
  }

  return (
    <div className="edit-department-page">
      <p className="page-description">
        Update the department details below and save your changes.
      </p>
      <Card title="Edit Department">
        <DepartmentForm
          initialValues={toDepartmentFormValues(department)}
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

function EditDepartmentPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <EditDepartmentContent key={id} departmentId={id} />
}

export default EditDepartmentPage