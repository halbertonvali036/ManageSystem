import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import DepartmentsTable from '@/components/departments/DepartmentsTable'
import DepartmentsToolbar from '@/components/departments/DepartmentsToolbar'
import useDeleteDepartment from '@/hooks/useDeleteDepartment'
import useDepartments from '@/hooks/useDepartments'
import {
  formatDepartmentCode,
  formatDepartmentName,
} from '@/models/department'

function DepartmentsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filters = {
    ...(search ? { search } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  }

  const { departments, isLoading, error, refetch } = useDepartments(filters)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const { isDeleting, deleteError, deleteDepartment } = useDeleteDepartment(
    deleteTarget?.id,
  )

  const handleClearFilters = () => {
    setSearch('')
    setStatusFilter('all')
  }

  const handleAddDepartment = () => {
    navigate('/departments/new')
  }

  const handleViewDepartment = (department) => {
    navigate(`/departments/${department.id}`)
  }

  const handleEditDepartment = (department) => {
    navigate(`/departments/${department.id}/edit`)
  }

  const handleDeleteRequest = (department) => {
    setDeleteTarget(department)
  }

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteTarget(null)
    }
  }

  const handleDeleteConfirm = async () => {
    const result = await deleteDepartment()
    if (result.ok) {
      setDeleteTarget(null)
      refetch()
    }
  }

  return (
    <section className="page" aria-label="Departments">
      <p className="page-description">
        Manage departments across the institution. Search by name or code and
        filter by status to find what you need.
      </p>
      <DepartmentsToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClearFilters={handleClearFilters}
        onAdd={handleAddDepartment}
      />
      <DepartmentsTable
        departments={departments}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onView={handleViewDepartment}
        onEdit={handleEditDepartment}
        onDelete={handleDeleteRequest}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete department"
        message="This action is permanent and cannot be undone."
        confirmLabel="Delete Department"
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      >
        {deleteTarget ? (
          <div className="modal__target">
            <p className="modal__target-row">
              Code: <strong>{formatDepartmentCode(deleteTarget)}</strong>
            </p>
            <p className="modal__target-row">
              Department: <strong>{formatDepartmentName(deleteTarget)}</strong>
            </p>
          </div>
        ) : null}
      </ConfirmDialog>
    </section>
  )
}

export default DepartmentsPage