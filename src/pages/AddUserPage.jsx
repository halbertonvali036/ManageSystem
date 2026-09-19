import { useNavigate } from 'react-router-dom'
import Card from '@/components/common/Card'
import UserForm from '@/components/users/UserForm'
import useCreateUser from '@/hooks/useCreateUser'

function AddUserPage() {
  const navigate = useNavigate()
  const { isSubmitting, submitError, fieldErrors, submit } = useCreateUser()

  const handleCancel = () => {
    navigate('/users')
  }

  const handleSubmit = async (payload) => {
    const result = await submit(payload)
    if (result.ok) {
      navigate('/users')
    }
  }

  return (
    <div className="add-user-page">
      <p className="page-description">
        Create a user account and assign a role. Account passwords are managed
        server-side once the backend is connected.
      </p>
      <Card title="Add User">
        <UserForm
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

export default AddUserPage