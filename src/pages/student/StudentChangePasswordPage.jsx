import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/common/Card'
import StudentChangePasswordForm from '@/components/student/profile/StudentChangePasswordForm'
import studentService from '@/services/studentService'
import { BackendNotConnectedError } from '@/services/httpClient'

function StudentChangePasswordPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleBack = () => {
    navigate('/student/profile')
  }

  const handleSubmit = async (data) => {
    setIsSubmitting(true)
    setSubmitError('')
    try {
      await studentService.changeMyPassword(data)
      navigate('/student/profile')
    } catch (requestError) {
      if (requestError instanceof BackendNotConnectedError) {
        setSubmitError('Backend API is not connected yet.')
      } else {
        setSubmitError(
          requestError.message || 'Unable to change your password. Please try again.',
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <p className="page-description">
        Keep your account secure by updating your password regularly.
      </p>

      <Card title="Change Password">
        <StudentChangePasswordForm
          onSubmit={handleSubmit}
          submitError={submitError}
          isSubmitting={isSubmitting}
          onCancel={handleBack}
        />
      </Card>
    </div>
  )
}

export default StudentChangePasswordPage