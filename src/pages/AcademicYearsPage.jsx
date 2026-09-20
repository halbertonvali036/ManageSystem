import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import AcademicYearsTable from '@/components/academicYears/AcademicYearsTable'
import AcademicYearsToolbar from '@/components/academicYears/AcademicYearsToolbar'
import useAcademicYears from '@/hooks/useAcademicYears'
import useDeleteAcademicYear from '@/hooks/useDeleteAcademicYear'
import { formatAcademicYearName } from '@/models/academicYear'

function AcademicYearsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filters = {
    ...(search ? { search } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  }

  const { academicYears, isLoading, error, refetch } = useAcademicYears(filters)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const { isDeleting, deleteError, deleteAcademicYear } = useDeleteAcademicYear(
    deleteTarget?.id,
  )

  const handleClearFilters = () => {
    setSearch('')
    setStatusFilter('all')
  }

  const handleAddAcademicYear = () => {
    navigate('/academic-years/new')
  }

  const handleViewAcademicYear = (academicYear) => {
    navigate(`/academic-years/${academicYear.id}`)
  }

  const handleEditAcademicYear = (academicYear) => {
    navigate(`/academic-years/${academicYear.id}/edit`)
  }

  const handleDeleteRequest = (academicYear) => {
    setDeleteTarget(academicYear)
  }

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteTarget(null)
    }
  }

  const handleDeleteConfirm = async () => {
    const result = await deleteAcademicYear()
    if (result.ok) {
      setDeleteTarget(null)
      refetch()
    }
  }

  return (
    <section className="page" aria-label="Academic Years">
      <p className="page-description">
        Define academic years and their semesters. Class records can then
        reference these periods instead of using free-form text.
      </p>

      <AcademicYearsToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClearFilters={handleClearFilters}
        onAdd={handleAddAcademicYear}
      />

      <AcademicYearsTable
        academicYears={academicYears}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onView={handleViewAcademicYear}
        onEdit={handleEditAcademicYear}
        onDelete={handleDeleteRequest}
        onAdd={handleAddAcademicYear}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete academic year"
        message="This action is permanent and cannot be undone. Classes linked to this academic year will keep their stored year name."
        confirmLabel="Delete Academic Year"
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      >
        {deleteTarget ? (
          <div className="modal__target">
            <p className="modal__target-row">
              Academic Year:{' '}
              <strong>{formatAcademicYearName(deleteTarget)}</strong>
            </p>
          </div>
        ) : null}
      </ConfirmDialog>
    </section>
  )
}

export default AcademicYearsPage