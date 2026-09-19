import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import StudentsTable from '@/components/students/StudentsTable'
import StudentsToolbar from '@/components/students/StudentsToolbar'
import useClasses from '@/hooks/useClasses'
import useDeleteStudent from '@/hooks/useDeleteStudent'
import useStudents from '@/hooks/useStudents'
import { formatStudentName } from '@/models/student'

function StudentsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [classNameFilter, setClassNameFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const { classes } = useClasses()

  const filters = {
    ...(search ? { search } : {}),
    ...(classNameFilter !== 'all' ? { classId: classNameFilter } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  }

  const { students, isLoading, error, refetch } = useStudents(filters)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const { isDeleting, deleteError, deleteStudent } = useDeleteStudent(
    deleteTarget?.id,
  )

  const clearFilters = () => {
    setSearch('')
    setClassNameFilter('all')
    setStatusFilter('all')
  }

  const handleAddStudent = () => {
    navigate('/students/new')
  }

  const handleViewStudent = (student) => {
    navigate(`/students/${student.id}`)
  }

  const handleEditStudent = (student) => {
    navigate(`/students/${student.id}/edit`)
  }

  const handleDeleteRequest = (student) => {
    setDeleteTarget(student)
  }

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteTarget(null)
    }
  }

  const handleDeleteConfirm = async () => {
    const result = await deleteStudent()
    if (result.ok) {
      setDeleteTarget(null)
      refetch()
    }
  }

  return (
    <div className="students-page">
      <p className="page-description">
        View and manage student records. Search the register and apply filters to
        find the students you need.
      </p>

      <StudentsToolbar
        search={search}
        onSearchChange={setSearch}
        classes={classes}
        classNameFilter={classNameFilter}
        onClassNameChange={setClassNameFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClearFilters={clearFilters}
        onAdd={handleAddStudent}
      />

      <StudentsTable
        students={students}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onView={handleViewStudent}
        onEdit={handleEditStudent}
        onDelete={handleDeleteRequest}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete student"
        message="This action is permanent and cannot be undone."
        confirmLabel="Delete Student"
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      >
        {deleteTarget ? (
          <div className="modal__target">
            <p className="modal__target-row">
              Student: <strong>{formatStudentName(deleteTarget)}</strong>
            </p>
            <p className="modal__target-row">
              Student ID: <strong>{deleteTarget.studentId || '—'}</strong>
            </p>
          </div>
        ) : null}
      </ConfirmDialog>
    </div>
  )
}

export default StudentsPage