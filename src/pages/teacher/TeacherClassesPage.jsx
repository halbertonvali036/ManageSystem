import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TeacherClassesTable from '@/components/teacher/classes/TeacherClassesTable'
import TeacherClassesToolbar from '@/components/teacher/classes/TeacherClassesToolbar'
import useMyClasses from '@/hooks/teacher/useMyClasses'

function TeacherClassesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [academicYearFilter, setAcademicYearFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filters = {
    ...(search ? { search } : {}),
    ...(academicYearFilter !== 'all'
      ? { academicYear: academicYearFilter }
      : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  }

  const { classes, isLoading, error, refetch } = useMyClasses(filters)

  const academicYears = [...new Set(classes.map((c) => c.academicYear).filter(Boolean))]

  const clearFilters = () => {
    setSearch('')
    setAcademicYearFilter('all')
    setStatusFilter('all')
  }

  const handleViewClass = (classRecord) => {
    navigate(`/teacher/classes/${classRecord.id}`)
  }

  return (
    <div className="classes-page">
      <p className="page-description">
        Browse the classes assigned to you. Search by code, name, course or room,
        and apply filters to find the classes you need.
      </p>

      <TeacherClassesToolbar
        search={search}
        onSearchChange={setSearch}
        academicYears={academicYears}
        academicYearFilter={academicYearFilter}
        onAcademicYearChange={setAcademicYearFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClearFilters={clearFilters}
      />

      <TeacherClassesTable
        classes={classes}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onView={handleViewClass}
      />
    </div>
  )
}

export default TeacherClassesPage