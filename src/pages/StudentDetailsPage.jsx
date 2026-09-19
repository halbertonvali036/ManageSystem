import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Users } from 'lucide-react'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import StudentProfile from '@/components/students/StudentProfile'
import useDeleteStudent from '@/hooks/useDeleteStudent'
import useStudent from '@/hooks/useStudent'
import { formatStudentName } from '@/models/student'
import { BackendNotConnectedError } from '@/services/httpClient'

function UnavailableState() {
  return (
    <Card>
      <div className="table-state">
        <Users className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">Student data is unavailable</h3>
        <p className="table-state__text">
          Student data will be available when the backend API is connected.
        </p>
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state">
        <h3 className="table-state__title">Failed to load student</h3>
        <p className="table-state__text">{message}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      </div>
    </Card>
  )
}

function StudentDetails({ studentId }) {
  const navigate = useNavigate()
  const { student, isLoading, error, refetch } = useStudent(studentId)
  const { isDeleting, deleteError, deleteStudent } = useDeleteStudent(studentId)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDeleteConfirm = async () => {
    const result = await deleteStudent()
    if (result.ok) {
      navigate('/students', { replace: true })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading student details&hellip;
        </div>
      </Card>
    )
  }

  if (error) {
    return error instanceof BackendNotConnectedError ? (
      <UnavailableState />
    ) : (
      <ErrorState message={error.message} onRetry={refetch} />
    )
  }

  if (!student) {
    return null
  }

  return (
    <>
      <StudentProfile
        student={student}
        onBack={() => navigate('/students')}
        onEdit={() => navigate(`/students/${studentId}/edit`)}
        onDelete={() => setShowDeleteDialog(true)}
      />
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete student"
        message="This action is permanent and cannot be undone."
        confirmLabel="Delete Student"
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      >
        <div className="modal__target">
          <p className="modal__target-row">
            Student: <strong>{formatStudentName(student)}</strong>
          </p>
          <p className="modal__target-row">
            Student ID: <strong>{student.studentId || '—'}</strong>
          </p>
        </div>
      </ConfirmDialog>
    </>
  )
}

function StudentDetailsPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <StudentDetails key={id} studentId={id} />
}

export default StudentDetailsPage