import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import ClassesTable from '@/components/classes/ClassesTable'
import ClassesToolbar from '@/components/classes/ClassesToolbar'
import useAcademicYears from '@/hooks/useAcademicYears'
import useClasses from '@/hooks/useClasses'
import useDeleteClass from '@/hooks/useDeleteClass'
import useSemesters from '@/hooks/useSemesters'
import { formatClassCourseName, formatClassName } from '@/models/class'

const toAcademicYearValue = (academicYear) =>
  academicYear?.name ??
  academicYear?.academicYear ??
  (typeof academicYear === 'string' ? academicYear : academicYear?.id) ??
  ''

function ClassesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [academicYearFilter, setAcademicYearFilter] = useState('all')
  const [semesterFilter, setSemesterFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const { academicYears, isLoading: academicYearsLoading } = useAcademicYears()
  const selectedAcademicYear = academicYears.find(
    (academicYear) => toAcademicYearValue(academicYear) === academicYearFilter,
  )
  const { semesters, isLoading: semestersLoading } = useSemesters(
    selectedAcademicYear?.id,
  )

  const filters = {
    ...(search ? { search } : {}),
    ...(academicYearFilter !== 'all'
      ? { academicYear: academicYearFilter }
      : {}),
    ...(semesterFilter !== 'all' ? { semester: semesterFilter } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  }

  const { classes, isLoading, error, refetch } = useClasses(filters)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const { isDeleting, deleteError, deleteClass } = useDeleteClass(
    deleteTarget?.id,
  )

  const clearFilters = () => {
    setSearch('')
    setAcademicYearFilter('all')
    setSemesterFilter('all')
    setStatusFilter('all')
  }

  const handleAcademicYearChange = (value) => {
    setSemesterFilter('all')
    setAcademicYearFilter(value)
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
        academicYearsLoading={academicYearsLoading}
        academicYearFilter={academicYearFilter}
        onAcademicYearChange={handleAcademicYearChange}
        semesters={semesters}
        semestersLoading={semestersLoading}
        semesterFilter={semesterFilter}
        onSemesterChange={setSemesterFilter}
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