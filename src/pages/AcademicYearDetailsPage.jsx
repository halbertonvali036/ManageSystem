import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CalendarRange } from 'lucide-react'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import AcademicYearProfile from '@/components/academicYears/AcademicYearProfile'
import SemestersCard from '@/components/academicYears/SemestersCard'
import useAcademicYear from '@/hooks/useAcademicYear'
import useDeleteAcademicYear from '@/hooks/useDeleteAcademicYear'
import { formatAcademicYearName } from '@/models/academicYear'
import { BackendNotConnectedError } from '@/services/httpClient'

function UnavailableState() {
  return (
    <Card>
      <div className="table-state">
        <CalendarRange
          className="table-state__icon"
          size={40}
          aria-hidden="true"
        />
        <h3 className="table-state__title">Academic year data is unavailable</h3>
        <p className="table-state__text">
          Academic year data will be available when the backend API is
          connected.
        </p>
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state">
        <h3 className="table-state__title">Failed to load academic year</h3>
        <p className="table-state__text">{message}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      </div>
    </Card>
  )
}

function AcademicYearDetails({ academicYearId }) {
  const navigate = useNavigate()
  const { academicYear, isLoading, error, refetch } =
    useAcademicYear(academicYearId)
  const { isDeleting, deleteError, deleteAcademicYear } =
    useDeleteAcademicYear(academicYearId)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDeleteConfirm = async () => {
    const result = await deleteAcademicYear()
    if (result.ok) {
      navigate('/academic-years', { replace: true })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading academic year details&hellip;
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

  if (!academicYear) {
    return null
  }

  return (
    <>
      <AcademicYearProfile
        academicYear={academicYear}
        onBack={() => navigate('/academic-years')}
        onEdit={() => navigate(`/academic-years/${academicYearId}/edit`)}
        onDelete={() => setShowDeleteDialog(true)}
      />
      <SemestersCard
        academicYearId={academicYearId}
        academicYearName={formatAcademicYearName(academicYear)}
      />
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete academic year"
        message="This action is permanent and cannot be undone. Classes linked to this academic year will keep their stored year name."
        confirmLabel="Delete Academic Year"
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      >
        <div className="modal__target">
          <p className="modal__target-row">
            Academic Year: <strong>{formatAcademicYearName(academicYear)}</strong>
          </p>
        </div>
      </ConfirmDialog>
    </>
  )
}

function AcademicYearDetailsPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <AcademicYearDetails key={id} academicYearId={id} />
}

export default AcademicYearDetailsPage