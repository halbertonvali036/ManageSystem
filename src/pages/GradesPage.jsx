import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import GradesTable from '@/components/grades/GradesTable'
import GradesToolbar from '@/components/grades/GradesToolbar'
import useClasses from '@/hooks/useClasses'
import useCourses from '@/hooks/useCourses'
import useDeleteGrade from '@/hooks/useDeleteGrade'
import useGrades from '@/hooks/useGrades'
import useStudents from '@/hooks/useStudents'
import {
  formatGradeAssessmentType,
  formatGradeCourseName,
  formatGradeStudentName,
} from '@/models/grade'

const getAssessmentLabel = (grade) => {
  const name = grade.assessmentName
  const type = formatGradeAssessmentType(grade)
  if (name) {
    return type !== '—' ? `${name} · ${type}` : name
  }
  return type
}

function GradesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [studentFilter, setStudentFilter] = useState('all')
  const [classFilter, setClassFilter] = useState('all')
  const [courseFilter, setCourseFilter] = useState('all')
  const [assessmentFilter, setAssessmentFilter] = useState('all')

  const { students } = useStudents()
  const { classes } = useClasses()
  const { courses } = useCourses()

  const filters = {
    ...(search ? { search } : {}),
    ...(studentFilter !== 'all' ? { studentId: studentFilter } : {}),
    ...(classFilter !== 'all' ? { classId: classFilter } : {}),
    ...(courseFilter !== 'all' ? { courseId: courseFilter } : {}),
    ...(assessmentFilter !== 'all' ? { assessmentType: assessmentFilter } : {}),
  }

  const { grades, isLoading, error, refetch } = useGrades(filters)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const { isDeleting, deleteError, deleteGrade } = useDeleteGrade(
    deleteTarget?.id,
  )

  const clearFilters = () => {
    setSearch('')
    setStudentFilter('all')
    setClassFilter('all')
    setCourseFilter('all')
    setAssessmentFilter('all')
  }

  const handleAddGrade = () => {
    navigate('/grades/new')
  }

  const handleBulkGradeEntry = () => {
    navigate('/grades/bulk')
  }

  const handleViewGrade = (grade) => {
    navigate(`/grades/${grade.id}`)
  }

  const handleEditGrade = (grade) => {
    navigate(`/grades/${grade.id}/edit`)
  }

  const handleDeleteRequest = (grade) => {
    setDeleteTarget(grade)
  }

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteTarget(null)
    }
  }

  const handleDeleteConfirm = async () => {
    const result = await deleteGrade()
    if (result.ok) {
      setDeleteTarget(null)
      refetch()
    }
  }

  return (
    <div className="grades-page">
      <p className="page-description">
        Review student grades across assessments. Search by student, ID or
        course, and filter by student, class, course or assessment type.
      </p>

      <GradesToolbar
        search={search}
        onSearchChange={setSearch}
        students={students}
        studentFilter={studentFilter}
        onStudentChange={setStudentFilter}
        classes={classes}
        classFilter={classFilter}
        onClassChange={setClassFilter}
        courses={courses}
        courseFilter={courseFilter}
        onCourseChange={setCourseFilter}
        assessmentFilter={assessmentFilter}
        onAssessmentChange={setAssessmentFilter}
        onClearFilters={clearFilters}
        onAddGrade={handleAddGrade}
        onBulkGradeEntry={handleBulkGradeEntry}
      />

      <GradesTable
        grades={grades}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onView={handleViewGrade}
        onEdit={handleEditGrade}
        onDelete={handleDeleteRequest}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete grade"
        message="This action is permanent and cannot be undone."
        confirmLabel="Delete Grade"
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      >
        {deleteTarget ? (
          <div className="modal__target">
            <p className="modal__target-row">
              Student: <strong>{formatGradeStudentName(deleteTarget)}</strong>
            </p>
            <p className="modal__target-row">
              Course: <strong>{formatGradeCourseName(deleteTarget)}</strong>
            </p>
            <p className="modal__target-row">
              Assessment: <strong>{getAssessmentLabel(deleteTarget)}</strong>
            </p>
          </div>
        ) : null}
      </ConfirmDialog>
    </div>
  )
}

export default GradesPage