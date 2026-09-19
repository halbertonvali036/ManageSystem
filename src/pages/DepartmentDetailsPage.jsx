import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import DepartmentProfile from '@/components/departments/DepartmentProfile'
import useDeleteDepartment from '@/hooks/useDeleteDepartment'
import useDepartment from '@/hooks/useDepartment'
import {
  formatDepartmentCode,
  formatDepartmentName,
} from '@/models/department'
import { BackendNotConnectedError } from '@/services/httpClient'

function UnavailableState() {
  return (
    <Card>
      <div className="table-state">
        <Building2 className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">Department data is unavailable</h3>
        <p className="table-state__text">
          Department data will be available when the backend API is connected.
        </p>
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state">
        <h3 className="table-state__title">Failed to load department</h3>
        <p className="table-state__text">{message}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      </div>
    </Card>
  )
}

function DepartmentDetails({ departmentId }) {
  const navigate = useNavigate()
  const { department, isLoading, error, refetch } = useDepartment(departmentId)
  const { isDeleting, deleteError, deleteDepartment } =
    useDeleteDepartment(departmentId)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDeleteConfirm = async () => {
    const result = await deleteDepartment()
    if (result.ok) {
      navigate('/departments', { replace: true })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading department details&hellip;
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

  if (!department) {
    return null
  }

  return (
    <>
      <DepartmentProfile
        department={department}
        onBack={() => navigate('/departments')}
        onEdit={() => navigate(`/departments/${departmentId}/edit`)}
        onDelete={() => setShowDeleteDialog(true)}
      />
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete department"
        message="This action is permanent and cannot be undone."
        confirmLabel="Delete Department"
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      >
        <div className="modal__target">
          <p className="modal__target-row">
            Code: <strong>{formatDepartmentCode(department)}</strong>
          </p>
          <p className="modal__target-row">
            Department: <strong>{formatDepartmentName(department)}</strong>
          </p>
        </div>
      </ConfirmDialog>
    </>
  )
}

function DepartmentDetailsPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <DepartmentDetails key={id} departmentId={id} />
}

export default DepartmentDetailsPage