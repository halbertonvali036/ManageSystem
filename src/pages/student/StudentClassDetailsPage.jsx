import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, School } from 'lucide-react'
import Card from '@/components/common/Card'
import StudentClassProfile from '@/components/student/classes/StudentClassProfile'
import useMyClass from '@/hooks/student/useMyClass'
import { BackendNotConnectedError } from '@/services/httpClient'

function UnavailableState({ onBack }) {
  return (
    <>
      <div className="details-toolbar">
        <button type="button" className="btn btn--icon-left" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to My Classes
        </button>
      </div>
      <Card>
        <div className="table-state">
          <School className="table-state__icon" size={40} aria-hidden="true" />
          <h3 className="table-state__title">Class data is unavailable</h3>
          <p className="table-state__text">
            Class data will be available when the backend API is connected.
          </p>
        </div>
      </Card>
    </>
  )
}

function ErrorState({ message, onRetry, onBack }) {
  return (
    <>
      <div className="details-toolbar">
        <button type="button" className="btn btn--icon-left" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to My Classes
        </button>
      </div>
      <Card>
        <div className="table-state">
          <h3 className="table-state__title">Failed to load class</h3>
          <p className="table-state__text">{message}</p>
          <button type="button" className="btn btn--primary" onClick={onRetry}>
            Retry
          </button>
        </div>
      </Card>
    </>
  )
}

function ClassDetails({ classId }) {
  const navigate = useNavigate()
  const { classRecord, isLoading, error, refetch } = useMyClass(classId)

  const handleBack = () => navigate('/student/classes')

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading class details&hellip;
        </div>
      </Card>
    )
  }

  if (error) {
    return error instanceof BackendNotConnectedError ? (
      <UnavailableState onBack={handleBack} />
    ) : (
      <ErrorState message={error.message} onRetry={refetch} onBack={handleBack} />
    )
  }

  if (!classRecord) {
    return null
  }

  return <StudentClassProfile classRecord={classRecord} onBack={handleBack} />
}

function StudentClassDetailsPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <ClassDetails key={id} classId={id} />
}

export default StudentClassDetailsPage