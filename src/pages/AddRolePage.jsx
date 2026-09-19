import { useNavigate } from 'react-router-dom'
import Card from '@/components/common/Card'
import RoleForm from '@/components/roles/RoleForm'
import useCreateRole from '@/hooks/useCreateRole'

function AddRolePage() {
  const navigate = useNavigate()
  const { isSubmitting, submitError, fieldErrors, submit } = useCreateRole()

  const handleCancel = () => {
    navigate('/roles')
  }

  const handleSubmit = async (payload) => {
    const result = await submit(payload)
    if (result.ok) {
      navigate('/roles')
    }
  }

  return (
    <div className="add-role-page">
      <p className="page-description">
        Create a new role that can later be assigned permission levels for each
        module.
      </p>
      <Card title="Add Role">
        <RoleForm
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

export default AddRolePage