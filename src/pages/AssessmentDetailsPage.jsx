import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import AssessmentProfile from '@/components/assessments/AssessmentProfile'
import useAssessment from '@/hooks/useAssessment'
import useDeleteAssessment from '@/hooks/useDeleteAssessment'
import {
  formatAssessmentClassName,
  formatAssessmentCourseName,
  formatAssessmentTitle,
  formatAssessmentType,
} from '@/models/assessment'
import { BackendNotConnectedError } from '@/services/httpClient'

function UnavailableState() {
  return (
    <Card>
      <div className="table-state">
        <ClipboardList className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">Assessment data is unavailable</h3>
        <p className="table-state__text">
          Assessment data will be available when the backend API is connected.
        </p>
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state">
        <h3 className="table-state__title">Failed to load assessment</h3>
        <p className="table-state__text">{message}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      </div>
    </Card>
  )
}

function AssessmentDetails({ assessmentId }) {
  const navigate = useNavigate()
  const { assessment, isLoading, error, refetch } = useAssessment(assessmentId)
  const { isDeleting, deleteError, deleteAssessment } =
    useDeleteAssessment(assessmentId)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDeleteConfirm = async () => {
    const result = await deleteAssessment()
    if (result.ok) {
      navigate('/assessments', { replace: true })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading assessment details&hellip;
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

  if (!assessment) {
    return null
  }

  return (
    <>
      <AssessmentProfile
        assessment={assessment}
        onBack={() => navigate('/assessments')}
        onEdit={() => navigate(`/assessments/${assessmentId}/edit`)}
        onDelete={() => setShowDeleteDialog(true)}
      />
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete assessment"
        message="This action is permanent and cannot be undone."
        confirmLabel="Delete Assessment"
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      >
        <div className="modal__target">
          <p className="modal__target-row">
            Assessment: <strong>{formatAssessmentTitle(assessment)}</strong>
          </p>
          <p className="modal__target-row">
            Type: <strong>{formatAssessmentType(assessment)}</strong>
          </p>
          <p className="modal__target-row">
            Course: <strong>{formatAssessmentCourseName(assessment)}</strong>
          </p>
          <p className="modal__target-row">
            Class: <strong>{formatAssessmentClassName(assessment)}</strong>
          </p>
        </div>
      </ConfirmDialog>
    </>
  )
}

function AssessmentDetailsPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <AssessmentDetails key={id} assessmentId={id} />
}

export default AssessmentDetailsPage