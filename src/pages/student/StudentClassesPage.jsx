import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentClassesTable from '@/components/student/classes/StudentClassesTable'
import StudentClassesToolbar from '@/components/student/classes/StudentClassesToolbar'
import useMyClasses from '@/hooks/student/useMyClasses'
import useMyCourses from '@/hooks/student/useMyCourses'

const toCourseOptions = (courses) =>
  courses
    .map((course) => ({
      id: course.id ?? course.courseId ?? course.courseCode ?? '',
      name: course.name ?? course.courseCode ?? course.id ?? '',
    }))
    .filter((course) => course.id)

function StudentClassesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')
  const [academicYearFilter, setAcademicYearFilter] = useState('all')
  const [semesterFilter, setSemesterFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filters = {
    ...(search ? { search } : {}),
    ...(courseFilter !== 'all' ? { course: courseFilter } : {}),
    ...(academicYearFilter !== 'all'
      ? { academicYear: academicYearFilter }
      : {}),
    ...(semesterFilter !== 'all' ? { semester: semesterFilter } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  }

  const { classes, isLoading, error, refetch } = useMyClasses(filters)
  const { courses } = useMyCourses()

  const courseOptions = useMemo(() => toCourseOptions(courses ?? []), [courses])

  const academicYears = useMemo(
    () => [...new Set(classes.map((c) => c.academicYear).filter(Boolean))],
    [classes],
  )
  const semesters = useMemo(
    () => [...new Set(classes.map((c) => c.semester).filter(Boolean))],
    [classes],
  )

  const hasActiveFilters =
    search !== '' ||
    courseFilter !== 'all' ||
    academicYearFilter !== 'all' ||
    semesterFilter !== 'all' ||
    statusFilter !== 'all'

  const clearFilters = () => {
    setSearch('')
    setCourseFilter('all')
    setAcademicYearFilter('all')
    setSemesterFilter('all')
    setStatusFilter('all')
  }

  const handleViewClass = (classRecord) => {
    navigate(`/student/classes/${classRecord.id}`)
  }

  return (
    <div className="classes-page">
      <p className="page-description">
        Browse the classes you are enrolled in. Search by code, name, course or
        room, and use the filters to narrow your list.
      </p>

      <StudentClassesToolbar
        search={search}
        onSearchChange={setSearch}
        courses={courseOptions}
        courseFilter={courseFilter}
        onCourseChange={setCourseFilter}
        academicYears={academicYears}
        academicYearFilter={academicYearFilter}
        onAcademicYearChange={setAcademicYearFilter}
        semesters={semesters}
        semesterFilter={semesterFilter}
        onSemesterChange={setSemesterFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClearFilters={clearFilters}
      />

      <StudentClassesTable
        classes={classes}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onView={handleViewClass}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />
    </div>
  )
}

export default StudentClassesPage