import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import ClassesTable from '@/components/classes/ClassesTable'
import ClassesToolbar from '@/components/classes/ClassesToolbar'
import useClasses from '@/hooks/useClasses'
import useDeleteClass from '@/hooks/useDeleteClass'
import { formatClassCourseName, formatClassName } from '@/models/class'

function ClassesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [academicYearFilter, setAcademicYearFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filters = {
    ...(search ? { search } : {}),
    ...(academicYearFilter !== 'all'
      ? { academicYear: academicYearFilter }
      : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  }

  const { classes, isLoading, error, refetch } = useClasses(filters)

  const academicYears = [...new Set(classes.map((c) => c.academicYear).filter(Boolean))]

  const [deleteTarget, setDeleteTarget] = useState(null)
  const { isDeleting, deleteError, deleteClass } = useDeleteClass(
    deleteTarget?.id,
  )

  const clearFilters = () => {
    setSearch('')
    setAcademicYearFilter('all')
    setStatusFilter('all')
  }

  const handleAddClass = () => {
    navigate('/classes/new')
  }

  const handleViewClass = (classRecord) => {
    navigate(`/classes/${classRecord.id}`)
  }

  const handleEditClass = (classRecord) => {
    navigate(`/classes/${classRecord.id}/edit`)
  }

  const handleDeleteRequest = (classRecord) => {
    setDeleteTarget(classRecord)
  }

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteTarget(null)
    }
  }

  const handleDeleteConfirm = async () => {
    const result = await deleteClass()
    if (result.ok) {
      setDeleteTarget(null)
      refetch()
    }
  }

  return (
    <div className="classes-page">
      <p className="page-description">
        Browse class records. Search by code, name, course or room, and apply
        filters to find the classes you need.
      </p>

      <ClassesToolbar
        search={search}
        onSearchChange={setSearch}
        academicYears={academicYears}
        academicYearFilter={academicYearFilter}
        onAcademicYearChange={setAcademicYearFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClearFilters={clearFilters}
        onAdd={handleAddClass}
      />

      <ClassesTable
        classes={classes}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onView={handleViewClass}
        onEdit={handleEditClass}
        onDelete={handleDeleteRequest}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete class"
        message="This action is permanent and cannot be undone."
        confirmLabel="Delete Class"
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      >
        {deleteTarget ? (
          <div className="modal__target">
            <p className="modal__target-row">
              Class: <strong>{formatClassName(deleteTarget)}</strong>
            </p>
            <p className="modal__target-row">
              Class Code: <strong>{deleteTarget.classCode || '—'}</strong>
            </p>
            <p className="modal__target-row">
              Course: <strong>{formatClassCourseName(deleteTarget)}</strong>
            </p>
          </div>
        ) : null}
      </ConfirmDialog>
    </div>
  )
}

export default ClassesPage