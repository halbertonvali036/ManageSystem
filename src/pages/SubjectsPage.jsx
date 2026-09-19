import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import SubjectsTable from '@/components/subjects/SubjectsTable'
import SubjectsToolbar from '@/components/subjects/SubjectsToolbar'
import useDeleteSubject from '@/hooks/useDeleteSubject'
import useDepartments from '@/hooks/useDepartments'
import useSubjects from '@/hooks/useSubjects'
import {
  formatSubjectCode,
  formatSubjectDepartmentName,
  formatSubjectName,
} from '@/models/subject'

function SubjectsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const { departments } = useDepartments()

  const filters = {
    ...(search ? { search } : {}),
    ...(departmentFilter !== 'all' ? { departmentId: departmentFilter } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  }

  const { subjects, isLoading, error, refetch } = useSubjects(filters)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const { isDeleting, deleteError, deleteSubject } = useDeleteSubject(
    deleteTarget?.id,
  )

  const handleClearFilters = () => {
    setSearch('')
    setDepartmentFilter('all')
    setStatusFilter('all')
  }

  const handleAddSubject = () => {
    navigate('/subjects/new')
  }

  const handleViewSubject = (subject) => {
    navigate(`/subjects/${subject.id}`)
  }

  const handleEditSubject = (subject) => {
    navigate(`/subjects/${subject.id}/edit`)
  }

  const handleDeleteRequest = (subject) => {
    setDeleteTarget(subject)
  }

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteTarget(null)
    }
  }

  const handleDeleteConfirm = async () => {
    const result = await deleteSubject()
    if (result.ok) {
      setDeleteTarget(null)
      refetch()
    }
  }

  return (
    <section className="page" aria-label="Subjects">
      <SubjectsToolbar
        search={search}
        onSearchChange={setSearch}
        departments={departments}
        departmentFilter={departmentFilter}
        onDepartmentChange={setDepartmentFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClearFilters={handleClearFilters}
        onAdd={handleAddSubject}
      />
      <SubjectsTable
        subjects={subjects}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onView={handleViewSubject}
        onEdit={handleEditSubject}
        onDelete={handleDeleteRequest}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete subject"
        message="This action is permanent and cannot be undone."
        confirmLabel="Delete Subject"
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      >
        {deleteTarget ? (
          <div className="modal__target">
            <p className="modal__target-row">
              Code: <strong>{formatSubjectCode(deleteTarget)}</strong>
            </p>
            <p className="modal__target-row">
              Subject: <strong>{formatSubjectName(deleteTarget)}</strong>
            </p>
            <p className="modal__target-row">
              Department:{' '}
              <strong>{formatSubjectDepartmentName(deleteTarget)}</strong>
            </p>
          </div>
        ) : null}
      </ConfirmDialog>
    </section>
  )
}

export default SubjectsPage