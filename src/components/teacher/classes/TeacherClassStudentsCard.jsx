import { Users } from 'lucide-react'
import Card from '@/components/common/Card'
import { formatStudentName } from '@/models/student'
import { BackendNotConnectedError } from '@/services/httpClient'

function LoadingState() {
  return (
    <Card title="Students">
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        Loading students&hellip;
      </div>
    </Card>
  )
}

function UnavailableState() {
  return (
    <Card title="Students">
      <div className="table-state">
        <Users className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">Roster is unavailable</h3>
        <p className="table-state__text">
          Enrolled students will appear here when the backend API is connected.
        </p>
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card title="Students">
      <div className="table-state table-state--error">
        <h3 className="table-state__title">Failed to load students</h3>
        <p className="table-state__text">{message}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      </div>
    </Card>
  )
}

function EmptyState() {
  return (
    <Card title="Students">
      <div className="table-state">
        <Users className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">No students enrolled yet</h3>
        <p className="table-state__text">
          Students enrolled in this class will appear here.
        </p>
      </div>
    </Card>
  )
}

function TeacherClassStudentsCard({ students, isLoading, error, onRetry }) {
  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return error instanceof BackendNotConnectedError ? (
      <UnavailableState />
    ) : (
      <ErrorState message={error.message} onRetry={onRetry} />
    )
  }

  if (students.length === 0) {
    return <EmptyState />
  }

  return (
    <Card title="Students" action={`${students.length} enrolled`}>
      <ul className="activity-list">
        {students.map((student) => (
          <li className="activity-item" key={student.id}>
            <span className="activity-item__marker" aria-hidden="true" />
            <div className="activity-item__body">
              <span className="activity-item__text">{formatStudentName(student)}</span>
              <span className="activity-item__time">
                {student.studentId || student.email || '—'}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default TeacherClassStudentsCard