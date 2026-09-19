import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AttendanceTable from '@/components/attendance/AttendanceTable'
import AttendanceToolbar from '@/components/attendance/AttendanceToolbar'
import useAttendance from '@/hooks/useAttendance'
import useClasses from '@/hooks/useClasses'

function AttendancePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const { classes } = useClasses()

  const filters = {
    ...(search ? { search } : {}),
    ...(dateFilter ? { date: dateFilter } : {}),
    ...(classFilter !== 'all' ? { classId: classFilter } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  }

  const { records, isLoading, error, refetch } = useAttendance(filters)

  const clearFilters = () => {
    setSearch('')
    setDateFilter('')
    setClassFilter('all')
    setStatusFilter('all')
  }

  const handleMarkAttendance = () => {
    navigate('/attendance/mark')
  }

  return (
    <div className="attendance-page">
      <p className="page-description">
        Browse daily attendance records. Search by student, ID, class or course,
        and apply filters to find the records you need.
      </p>

      <AttendanceToolbar
        search={search}
        onSearchChange={setSearch}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
        classes={classes}
        classFilter={classFilter}
        onClassChange={setClassFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClearFilters={clearFilters}
        onMarkAttendance={handleMarkAttendance}
      />

      <AttendanceTable
        records={records}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
      />
    </div>
  )
}

export default AttendancePage