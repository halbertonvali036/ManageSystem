import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/common/Card'
import StudentProfileForm from '@/components/student/profile/StudentProfileForm'
import useAuth from '@/hooks/useAuth'
import useMyProfile from '@/hooks/student/useMyProfile'
import studentService from '@/services/studentService'
import { BackendNotConnectedError } from '@/services/httpClient'

function LoadingState() {
  return (
    <Card>
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        Loading profile&hellip;
      </div>
    </Card>
  )
}

function UnavailableState({ message, onBack }) {
  return (
    <Card>
      <div className="table-state table-state--error">
        <h3 className="table-state__title">Profile not available</h3>
        <p className="table-state__text">{message}</p>
        <button type="button" className="btn btn--primary" onClick={onBack}>
          Back to Profile
        </button>
      </div>
    </Card>
  )
}

function StudentEditProfilePage() {
  const navigate = useNavigate()
  const { user: sessionUser } = useAuth()
  const { profile, isLoading, error } = useMyProfile()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const email = profile?.email || sessionUser?.email || ''

  const handleBack = () => {
    navigate('/student/profile')
  }

  const handleSubmit = async (data) => {
    setIsSubmitting(true)
    setSubmitError('')
    try {
      await studentService.updateMyProfile(data)
      navigate('/student/profile')
    } catch (requestError) {
      if (requestError instanceof BackendNotConnectedError) {
        setSubmitError('Backend API is not connected yet.')
      } else {
        setSubmitError(
          requestError.message || 'Unable to save your profile. Please try again.',
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <LoadingState />
  }

  if (error || !profile) {
    return (
      <UnavailableState
        message={
          error?.message ||
          'Profile data is unavailable right now, so it cannot be edited.'
        }
        onBack={handleBack}
      />
    )
  }

  return (
    <div>
      <p className="page-description">
        Update the personal and contact information shown on your profile.
      </p>

      <Card title="Edit Profile">
        <StudentProfileForm
          profile={profile}
          email={email}
          onSubmit={handleSubmit}
          submitError={submitError}
          isSubmitting={isSubmitting}
          onCancel={handleBack}
        />
      </Card>
    </div>
  )
}

export default StudentEditProfilePage