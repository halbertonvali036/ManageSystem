import { useNavigate } from 'react-router-dom'
import Card from '@/components/common/Card'
import DepartmentForm from '@/components/departments/DepartmentForm'
import useCreateDepartment from '@/hooks/useCreateDepartment'

function AddDepartmentPage() {
  const navigate = useNavigate()
  const { isSubmitting, submitError, fieldErrors, submit } =
    useCreateDepartment()

  const handleCancel = () => {
    navigate('/departments')
  }

  const handleSubmit = async (payload) => {
    const result = await submit(payload)
    if (result.ok) {
      navigate('/departments')
    }
  }

  return (
    <div className="add-department-page">
      <p className="page-description">
        Create a new academic department. Department records are reusable
        across courses and subjects.
      </p>
      <Card title="Add Department">
        <DepartmentForm
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

export default AddDepartmentPage