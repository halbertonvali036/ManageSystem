import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GradesToolbar from '@/components/grades/GradesToolbar'
import TeacherGradesTable from '@/components/teacher/grades/TeacherGradesTable'
import useMyClasses from '@/hooks/teacher/useMyClasses'
import useMyCourses from '@/hooks/teacher/useMyCourses'
import useMyGrades from '@/hooks/teacher/useMyGrades'
import useMyStudents from '@/hooks/teacher/useMyStudents'

function TeacherGradesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [studentFilter, setStudentFilter] = useState('all')
  const [classFilter, setClassFilter] = useState('all')
  const [courseFilter, setCourseFilter] = useState('all')
  const [assessmentFilter, setAssessmentFilter] = useState('all')

  const { students } = useMyStudents()
  const { classes } = useMyClasses()
  const { courses } = useMyCourses()

  const filters = {
    ...(search ? { search } : {}),
    ...(studentFilter !== 'all' ? { studentId: studentFilter } : {}),
    ...(classFilter !== 'all' ? { classId: classFilter } : {}),
    ...(courseFilter !== 'all' ? { courseId: courseFilter } : {}),
    ...(assessmentFilter !== 'all' ? { assessmentType: assessmentFilter } : {}),
  }

  const { grades, isLoading, error, refetch } = useMyGrades(filters)

  const clearFilters = () => {
    setSearch('')
    setStudentFilter('all')
    setClassFilter('all')
    setCourseFilter('all')
    setAssessmentFilter('all')
  }

  const handleAddGrade = () => {
    navigate('/teacher/grades/new')
  }

  const handleBulkGradeEntry = () => {
    navigate('/teacher/grades/bulk')
  }

  const handleViewStudent = (studentId) => {
    if (studentId) {
      navigate(`/teacher/students/${studentId}`)
    }
  }

  return (
    <div className="grades-page">
      <p className="page-description">
        Review grades for your students across assessments. Search by student, ID
        or course, and filter by student, class, course or assessment type.
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

      <TeacherGradesTable
        grades={grades}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onView={handleViewStudent}
      />
    </div>
  )
}

export default TeacherGradesPage