import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BookMarked } from 'lucide-react'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import SubjectProfile from '@/components/subjects/SubjectProfile'
import useDeleteSubject from '@/hooks/useDeleteSubject'
import useSubject from '@/hooks/useSubject'
import {
  formatSubjectCode,
  formatSubjectDepartmentName,
  formatSubjectName,
} from '@/models/subject'
import { BackendNotConnectedError } from '@/services/httpClient'

function UnavailableState() {
  return (
    <Card>
      <div className="table-state">
        <BookMarked className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">Subject data is unavailable</h3>
        <p className="table-state__text">
          Subject data will be available when the backend API is connected.
        </p>
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state">
        <h3 className="table-state__title">Failed to load subject</h3>
        <p className="table-state__text">{message}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      </div>
    </Card>
  )
}

function SubjectDetails({ subjectId }) {
  const navigate = useNavigate()
  const { subject, isLoading, error, refetch } = useSubject(subjectId)
  const { isDeleting, deleteError, deleteSubject } = useDeleteSubject(subjectId)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDeleteConfirm = async () => {
    const result = await deleteSubject()
    if (result.ok) {
      navigate('/subjects', { replace: true })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading subject details&hellip;
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

  if (!subject) {
    return null
  }

  return (
    <>
      <SubjectProfile
        subject={subject}
        onBack={() => navigate('/subjects')}
        onEdit={() => navigate(`/subjects/${subjectId}/edit`)}
        onDelete={() => setShowDeleteDialog(true)}
      />
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete subject"
        message="This action is permanent and cannot be undone."
        confirmLabel="Delete Subject"
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      >
        <div className="modal__target">
          <p className="modal__target-row">
            Code: <strong>{formatSubjectCode(subject)}</strong>
          </p>
          <p className="modal__target-row">
            Subject: <strong>{formatSubjectName(subject)}</strong>
          </p>
          <p className="modal__target-row">
            Department: <strong>{formatSubjectDepartmentName(subject)}</strong>
          </p>
        </div>
      </ConfirmDialog>
    </>
  )
}

function SubjectDetailsPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <SubjectDetails key={id} subjectId={id} />
}

export default SubjectDetailsPage