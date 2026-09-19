import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AttendanceToolbar from '@/components/attendance/AttendanceToolbar'
import TeacherAttendanceTable from '@/components/teacher/attendance/TeacherAttendanceTable'
import useMyAttendance from '@/hooks/teacher/useMyAttendance'
import useMyClasses from '@/hooks/teacher/useMyClasses'

function TeacherAttendancePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const { classes } = useMyClasses()

  const filters = {
    ...(search ? { search } : {}),
    ...(dateFilter ? { date: dateFilter } : {}),
    ...(classFilter !== 'all' ? { classId: classFilter } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  }

  const { records, isLoading, error, refetch } = useMyAttendance(filters)

  const clearFilters = () => {
    setSearch('')
    setDateFilter('')
    setClassFilter('all')
    setStatusFilter('all')
  }

  return (
    <div className="attendance-page">
      <p className="page-description">
        Review attendance for your classes. Search, filter by date, class or
        status, and mark attendance from the button above.
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
        onMarkAttendance={() => navigate('/teacher/attendance/mark')}
      />

      <TeacherAttendanceTable
        records={records}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
      />
    </div>
  )
}

export default TeacherAttendancePage