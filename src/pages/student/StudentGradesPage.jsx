import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import config from '@/config'
import StudentGradesTable from '@/components/student/grades/StudentGradesTable'
import StudentGradesToolbar from '@/components/student/grades/StudentGradesToolbar'
import StudentGradeSummary from '@/components/student/grades/StudentGradeSummary'
import useMyClasses from '@/hooks/student/useMyClasses'
import useMyCourses from '@/hooks/student/useMyCourses'
import useMyGrades from '@/hooks/student/useMyGrades'

const backendConnected = Boolean(config.api.baseUrl)

function StudentGradesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')
  const [classFilter, setClassFilter] = useState('all')
  const [assessmentFilter, setAssessmentFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { classes } = useMyClasses()
  const { courses } = useMyCourses()

  const filters = {
    ...(search ? { search } : {}),
    ...(courseFilter !== 'all' ? { courseId: courseFilter } : {}),
    ...(classFilter !== 'all' ? { classId: classFilter } : {}),
    ...(assessmentFilter !== 'all' ? { assessmentType: assessmentFilter } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
  }

  const { grades, isLoading, error, refetch } = useMyGrades(filters)

  const hasActiveFilters =
    search !== '' ||
    courseFilter !== 'all' ||
    classFilter !== 'all' ||
    assessmentFilter !== 'all' ||
    dateFrom !== '' ||
    dateTo !== ''

  const clearFilters = () => {
    setSearch('')
    setCourseFilter('all')
    setClassFilter('all')
    setAssessmentFilter('all')
    setDateFrom('')
    setDateTo('')
  }

  const handleViewGrade = (grade) => {
    navigate(`/student/grades/${grade.id}`)
  }

  return (
    <div className="grades-page">
      <p className="page-description">
        Review the grades published for your courses. Use the course, class,
        assessment type and date filters to narrow your list, and check your
        grade summary above.
      </p>

      <StudentGradeSummary grades={grades} />

      <StudentGradesToolbar
        search={search}
        onSearchChange={setSearch}
        courses={courses}
        courseFilter={courseFilter}
        onCourseChange={setCourseFilter}
        classes={classes}
        classFilter={classFilter}
        onClassChange={setClassFilter}
        assessmentFilter={assessmentFilter}
        onAssessmentChange={setAssessmentFilter}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        onClearFilters={clearFilters}
      />

      <StudentGradesTable
        grades={grades}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onView={handleViewGrade}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        backendConnected={backendConnected}
      />
    </div>
  )
}

export default StudentGradesPage