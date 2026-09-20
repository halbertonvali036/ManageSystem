import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { School } from 'lucide-react'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import ClassProfile from '@/components/classes/ClassProfile'
import ClassRosterCard from '@/components/enrollments/ClassRosterCard'
import useClass from '@/hooks/useClass'
import useDeleteClass from '@/hooks/useDeleteClass'
import { formatClassCourseName, formatClassName } from '@/models/class'
import { BackendNotConnectedError } from '@/services/httpClient'

function UnavailableState() {
  return (
    <Card>
      <div className="table-state">
        <School className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">Class data is unavailable</h3>
        <p className="table-state__text">
          Class data will be available when the backend API is connected.
        </p>
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state">
        <h3 className="table-state__title">Failed to load class</h3>
        <p className="table-state__text">{message}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      </div>
    </Card>
  )
}

function ClassDetails({ classId }) {
  const navigate = useNavigate()
  const { classRecord, isLoading, error, refetch } = useClass(classId)
  const { isDeleting, deleteError, deleteClass } = useDeleteClass(classId)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDeleteConfirm = async () => {
    const result = await deleteClass()
    if (result.ok) {
      navigate('/classes', { replace: true })
    }
  }

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
      <UnavailableState />
    ) : (
      <ErrorState message={error.message} onRetry={refetch} />
    )
  }

  if (!classRecord) {
    return null
  }

  return (
    <>
      <ClassProfile
        classRecord={classRecord}
        onBack={() => navigate('/classes')}
        onEdit={() => navigate(`/classes/${classId}/edit`)}
        onDelete={() => setShowDeleteDialog(true)}
      />
      <ClassRosterCard classId={classId} classRecord={classRecord} />
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete class"
        message="This action is permanent and cannot be undone."
        confirmLabel="Delete Class"
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      >
        <div className="modal__target">
          <p className="modal__target-row">
            Class: <strong>{formatClassName(classRecord)}</strong>
          </p>
          <p className="modal__target-row">
            Class Code: <strong>{classRecord.classCode || '—'}</strong>
          </p>
          <p className="modal__target-row">
            Course: <strong>{formatClassCourseName(classRecord)}</strong>
          </p>
        </div>
      </ConfirmDialog>
    </>
  )
}

function ClassDetailsPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <ClassDetails key={id} classId={id} />
}

export default ClassDetailsPage