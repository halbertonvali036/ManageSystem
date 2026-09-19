import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import TeachersTable from '@/components/teachers/TeachersTable'
import TeachersToolbar from '@/components/teachers/TeachersToolbar'
import useDeleteTeacher from '@/hooks/useDeleteTeacher'
import useDepartments from '@/hooks/useDepartments'
import useTeachers from '@/hooks/useTeachers'
import { formatDepartmentName } from '@/models/department'
import { formatTeacherName } from '@/models/teacher'

function TeachersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const { departments } = useDepartments()

  const filters = {
    ...(search ? { search } : {}),
    ...(departmentFilter !== 'all' ? { department: departmentFilter } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  }

  const { teachers, isLoading, error, refetch } = useTeachers(filters)

  const departmentOptions = departments.map((department) =>
    formatDepartmentName(department),
  )

  const [deleteTarget, setDeleteTarget] = useState(null)
  const { isDeleting, deleteError, deleteTeacher } = useDeleteTeacher(
    deleteTarget?.id,
  )

  const clearFilters = () => {
    setSearch('')
    setDepartmentFilter('all')
    setStatusFilter('all')
  }

  const handleAddTeacher = () => {
    navigate('/teachers/new')
  }

  const handleViewTeacher = (teacher) => {
    navigate(`/teachers/${teacher.id}`)
  }

  const handleEditTeacher = (teacher) => {
    navigate(`/teachers/${teacher.id}/edit`)
  }

  const handleDeleteRequest = (teacher) => {
    setDeleteTarget(teacher)
  }

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteTarget(null)
    }
  }

  const handleDeleteConfirm = async () => {
    const result = await deleteTeacher()
    if (result.ok) {
      setDeleteTarget(null)
      refetch()
    }
  }

  return (
    <div className="teachers-page">
      <p className="page-description">
        View and manage teacher records. Search the register and apply filters to
        find the teachers you need.
      </p>

      <TeachersToolbar
        search={search}
        onSearchChange={setSearch}
        departments={departmentOptions}
        departmentFilter={departmentFilter}
        onDepartmentChange={setDepartmentFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClearFilters={clearFilters}
        onAdd={handleAddTeacher}
      />

      <TeachersTable
        teachers={teachers}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onView={handleViewTeacher}
        onEdit={handleEditTeacher}
        onDelete={handleDeleteRequest}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete teacher"
        message="This action is permanent and cannot be undone."
        confirmLabel="Delete Teacher"
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      >
        {deleteTarget ? (
          <div className="modal__target">
            <p className="modal__target-row">
              Teacher: <strong>{formatTeacherName(deleteTarget)}</strong>
            </p>
            <p className="modal__target-row">
              Teacher ID: <strong>{deleteTarget.teacherId || '—'}</strong>
            </p>
          </div>
        ) : null}
      </ConfirmDialog>
    </div>
  )
}

export default TeachersPage