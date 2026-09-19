import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Users } from 'lucide-react'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import TeacherProfile from '@/components/teachers/TeacherProfile'
import useDeleteTeacher from '@/hooks/useDeleteTeacher'
import useTeacher from '@/hooks/useTeacher'
import { formatTeacherName } from '@/models/teacher'
import { BackendNotConnectedError } from '@/services/httpClient'

function UnavailableState() {
  return (
    <Card>
      <div className="table-state">
        <Users className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">Teacher data is unavailable</h3>
        <p className="table-state__text">
          Teacher data will be available when the backend API is connected.
        </p>
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state">
        <h3 className="table-state__title">Failed to load teacher</h3>
        <p className="table-state__text">{message}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      </div>
    </Card>
  )
}

function TeacherDetails({ teacherId }) {
  const navigate = useNavigate()
  const { teacher, isLoading, error, refetch } = useTeacher(teacherId)
  const { isDeleting, deleteError, deleteTeacher } = useDeleteTeacher(teacherId)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDeleteConfirm = async () => {
    const result = await deleteTeacher()
    if (result.ok) {
      navigate('/teachers', { replace: true })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading teacher details&hellip;
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

  if (!teacher) {
    return null
  }

  return (
    <>
      <TeacherProfile
        teacher={teacher}
        onBack={() => navigate('/teachers')}
        onEdit={() => navigate(`/teachers/${teacherId}/edit`)}
        onDelete={() => setShowDeleteDialog(true)}
      />
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete teacher"
        message="This action is permanent and cannot be undone."
        confirmLabel="Delete Teacher"
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      >
        <div className="modal__target">
          <p className="modal__target-row">
            Teacher: <strong>{formatTeacherName(teacher)}</strong>
          </p>
          <p className="modal__target-row">
            Teacher ID: <strong>{teacher.teacherId || '—'}</strong>
          </p>
        </div>
      </ConfirmDialog>
    </>
  )
}

function TeacherDetailsPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <TeacherDetails key={id} teacherId={id} />
}

export default TeacherDetailsPage