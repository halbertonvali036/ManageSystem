import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentCoursesTable from '@/components/student/courses/StudentCoursesTable'
import StudentCoursesToolbar from '@/components/student/courses/StudentCoursesToolbar'
import useMyCourses from '@/hooks/student/useMyCourses'

function StudentCoursesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filters = {
    ...(search ? { search } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  }

  const { courses, isLoading, error, refetch } = useMyCourses(filters)
  const hasActiveFilters = search !== '' || statusFilter !== 'all'

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
  }

  const handleViewCourse = (course) => {
    navigate(`/student/courses/${course.id}`)
  }

  return (
    <div className="courses-page">
      <p className="page-description">
        Courses you are enrolled in, all in one place. Search by code or name,
        and use the status filter to narrow your list.
      </p>

      <StudentCoursesToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClearFilters={clearFilters}
      />

      <StudentCoursesTable
        courses={courses}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onView={handleViewCourse}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />
    </div>
  )
}

export default StudentCoursesPage