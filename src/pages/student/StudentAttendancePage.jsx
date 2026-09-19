import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import config from '@/config'
import StudentAttendanceSummary from '@/components/student/attendance/StudentAttendanceSummary'
import StudentAttendanceTable from '@/components/student/attendance/StudentAttendanceTable'
import StudentAttendanceToolbar from '@/components/student/attendance/StudentAttendanceToolbar'
import useMyAttendance from '@/hooks/student/useMyAttendance'
import useMyClasses from '@/hooks/student/useMyClasses'
import useMyCourses from '@/hooks/student/useMyCourses'

const backendConnected = Boolean(config.api.baseUrl)

function StudentAttendancePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [courseFilter, setCourseFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const { classes } = useMyClasses()
  const { courses } = useMyCourses()

  const filters = {
    ...(search ? { search } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
    ...(classFilter !== 'all' ? { classId: classFilter } : {}),
    ...(courseFilter !== 'all' ? { courseId: courseFilter } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  }

  const { records, isLoading, error, refetch } = useMyAttendance(filters)

  const hasActiveFilters =
    search !== '' ||
    dateFrom !== '' ||
    dateTo !== '' ||
    classFilter !== 'all' ||
    courseFilter !== 'all' ||
    statusFilter !== 'all'

  const clearFilters = () => {
    setSearch('')
    setDateFrom('')
    setDateTo('')
    setClassFilter('all')
    setCourseFilter('all')
    setStatusFilter('all')
  }

  const handleViewRecord = (record) => {
    navigate(`/student/attendance/${record.id}`)
  }

  return (
    <div className="attendance-page">
      <p className="page-description">
        Review your attendance history. Use the date range, class, course and
        status filters to find the records you need, and check your overall
        attendance summary above.
      </p>

      <StudentAttendanceSummary records={records} />

      <StudentAttendanceToolbar
        search={search}
        onSearchChange={setSearch}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        classes={classes}
        classFilter={classFilter}
        onClassChange={setClassFilter}
        courses={courses}
        courseFilter={courseFilter}
        onCourseChange={setCourseFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClearFilters={clearFilters}
      />

      <StudentAttendanceTable
        records={records}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onView={handleViewRecord}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        backendConnected={backendConnected}
      />
    </div>
  )
}

export default StudentAttendancePage