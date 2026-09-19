import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Award } from 'lucide-react'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import GradeProfile from '@/components/grades/GradeProfile'
import useDeleteGrade from '@/hooks/useDeleteGrade'
import useGrade from '@/hooks/useGrade'
import {
  formatGradeAssessmentType,
  formatGradeCourseName,
  formatGradeStudentName,
} from '@/models/grade'
import { BackendNotConnectedError } from '@/services/httpClient'

const getAssessmentLabel = (grade) => {
  const name = grade.assessmentName
  const type = formatGradeAssessmentType(grade)
  if (name) {
    return type !== '—' ? `${name} · ${type}` : name
  }
  return type
}

function UnavailableState() {
  return (
    <Card>
      <div className="table-state">
        <Award className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">Grade data is unavailable</h3>
        <p className="table-state__text">
          Grade data will be available when the backend API is connected.
        </p>
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state">
        <h3 className="table-state__title">Failed to load grade</h3>
        <p className="table-state__text">{message}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      </div>
    </Card>
  )
}

function GradeDetails({ gradeId }) {
  const navigate = useNavigate()
  const { grade, isLoading, error, refetch } = useGrade(gradeId)
  const { isDeleting, deleteError, deleteGrade } = useDeleteGrade(gradeId)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDeleteConfirm = async () => {
    const result = await deleteGrade()
    if (result.ok) {
      navigate('/grades', { replace: true })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading grade details&hellip;
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

  if (!grade) {
    return null
  }

  return (
    <>
      <GradeProfile
        grade={grade}
        onBack={() => navigate('/grades')}
        onEdit={() => navigate(`/grades/${gradeId}/edit`)}
        onDelete={() => setShowDeleteDialog(true)}
      />
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete grade"
        message="This action is permanent and cannot be undone."
        confirmLabel="Delete Grade"
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      >
        <div className="modal__target">
          <p className="modal__target-row">
            Student: <strong>{formatGradeStudentName(grade)}</strong>
          </p>
          <p className="modal__target-row">
            Course: <strong>{formatGradeCourseName(grade)}</strong>
          </p>
          <p className="modal__target-row">
            Assessment: <strong>{getAssessmentLabel(grade)}</strong>
          </p>
        </div>
      </ConfirmDialog>
    </>
  )
}

function GradeDetailsPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <GradeDetails key={id} gradeId={id} />
}

export default GradeDetailsPage