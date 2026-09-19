import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import CoursesTable from '@/components/courses/CoursesTable'
import CoursesToolbar from '@/components/courses/CoursesToolbar'
import useCourses from '@/hooks/useCourses'
import useDeleteCourse from '@/hooks/useDeleteCourse'
import useDepartments from '@/hooks/useDepartments'
import { formatDepartmentName } from '@/models/department'

function CoursesPage() {
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

  const { courses, isLoading, error, refetch } = useCourses(filters)

  const departmentOptions = departments.map((department) =>
    formatDepartmentName(department),
  )

  const [deleteTarget, setDeleteTarget] = useState(null)
  const { isDeleting, deleteError, deleteCourse } = useDeleteCourse(
    deleteTarget?.id,
  )

  const clearFilters = () => {
    setSearch('')
    setDepartmentFilter('all')
    setStatusFilter('all')
  }

  const handleAddCourse = () => {
    navigate('/courses/new')
  }

  const handleViewCourse = (course) => {
    navigate(`/courses/${course.id}`)
  }

  const handleEditCourse = (course) => {
    navigate(`/courses/${course.id}/edit`)
  }

  const handleDeleteRequest = (course) => {
    setDeleteTarget(course)
  }

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteTarget(null)
    }
  }

  const handleDeleteConfirm = async () => {
    const result = await deleteCourse()
    if (result.ok) {
      setDeleteTarget(null)
      refetch()
    }
  }

  return (
    <div className="courses-page">
      <p className="page-description">
        Browse the course catalog. Search by code, name or department, and apply
        filters to find the courses you need.
      </p>

      <CoursesToolbar
        search={search}
        onSearchChange={setSearch}
        departments={departmentOptions}
        departmentFilter={departmentFilter}
        onDepartmentChange={setDepartmentFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClearFilters={clearFilters}
        onAdd={handleAddCourse}
      />

      <CoursesTable
        courses={courses}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onView={handleViewCourse}
        onEdit={handleEditCourse}
        onDelete={handleDeleteRequest}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete course"
        message="This action is permanent and cannot be undone."
        confirmLabel="Delete Course"
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      >
        {deleteTarget ? (
          <div className="modal__target">
            <p className="modal__target-row">
              Course: <strong>{deleteTarget.name || '—'}</strong>
            </p>
            <p className="modal__target-row">
              Course Code: <strong>{deleteTarget.courseCode || '—'}</strong>
            </p>
          </div>
        ) : null}
      </ConfirmDialog>
    </div>
  )
}

export default CoursesPage