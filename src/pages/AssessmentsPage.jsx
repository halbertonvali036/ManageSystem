import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import AssessmentsTable from '@/components/assessments/AssessmentsTable'
import AssessmentsToolbar from '@/components/assessments/AssessmentsToolbar'
import useAssessments from '@/hooks/useAssessments'
import useClasses from '@/hooks/useClasses'
import useCourses from '@/hooks/useCourses'
import useDeleteAssessment from '@/hooks/useDeleteAssessment'
import {
  formatAssessmentClassName,
  formatAssessmentCourseName,
  formatAssessmentTitle,
  formatAssessmentType,
} from '@/models/assessment'

function AssessmentsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')
  const [classFilter, setClassFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const { courses, isLoading: coursesLoading } = useCourses()
  const { classes, isLoading: classesLoading } = useClasses()

  const filters = {
    ...(search ? { search } : {}),
    ...(courseFilter !== 'all' ? { courseId: courseFilter } : {}),
    ...(classFilter !== 'all' ? { classId: classFilter } : {}),
    ...(typeFilter !== 'all' ? { type: typeFilter } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  }

  const { assessments, isLoading, error, refetch } = useAssessments(filters)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const { isDeleting, deleteError, deleteAssessment } = useDeleteAssessment(
    deleteTarget?.id,
  )

  const handleClearFilters = () => {
    setSearch('')
    setCourseFilter('all')
    setClassFilter('all')
    setTypeFilter('all')
    setStatusFilter('all')
  }

  const handleAddAssessment = () => {
    navigate('/assessments/new')
  }

  const handleViewAssessment = (assessment) => {
    navigate(`/assessments/${assessment.id}`)
  }

  const handleEditAssessment = (assessment) => {
    navigate(`/assessments/${assessment.id}/edit`)
  }

  const handleDeleteRequest = (assessment) => {
    setDeleteTarget(assessment)
  }

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteTarget(null)
    }
  }

  const handleDeleteConfirm = async () => {
    const result = await deleteAssessment()
    if (result.ok) {
      setDeleteTarget(null)
      refetch()
    }
  }

  return (
    <section className="page" aria-label="Assessments">
      <AssessmentsToolbar
        search={search}
        onSearchChange={setSearch}
        courses={courses}
        coursesLoading={coursesLoading}
        courseFilter={courseFilter}
        onCourseChange={setCourseFilter}
        classes={classes}
        classesLoading={classesLoading}
        classFilter={classFilter}
        onClassChange={setClassFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClearFilters={handleClearFilters}
        onAdd={handleAddAssessment}
      />
      <AssessmentsTable
        assessments={assessments}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onView={handleViewAssessment}
        onEdit={handleEditAssessment}
        onDelete={handleDeleteRequest}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete assessment"
        message="This action is permanent and cannot be undone."
        confirmLabel="Delete Assessment"
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      >
        {deleteTarget ? (
          <div className="modal__target">
            <p className="modal__target-row">
              Assessment: <strong>{formatAssessmentTitle(deleteTarget)}</strong>
            </p>
            <p className="modal__target-row">
              Type: <strong>{formatAssessmentType(deleteTarget)}</strong>
            </p>
            <p className="modal__target-row">
              Course:{' '}
              <strong>{formatAssessmentCourseName(deleteTarget)}</strong>
            </p>
            <p className="modal__target-row">
              Class: <strong>{formatAssessmentClassName(deleteTarget)}</strong>
            </p>
          </div>
        ) : null}
      </ConfirmDialog>
    </section>
  )
}

export default AssessmentsPage