import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TeacherStudentsTable from '@/components/teacher/students/TeacherStudentsTable'
import TeacherStudentsToolbar from '@/components/teacher/students/TeacherStudentsToolbar'
import useMyClasses from '@/hooks/teacher/useMyClasses'
import useMyStudents from '@/hooks/teacher/useMyStudents'

function TeacherStudentsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [classNameFilter, setClassNameFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const { classes } = useMyClasses()

  const filters = {
    ...(search ? { search } : {}),
    ...(classNameFilter !== 'all' ? { classId: classNameFilter } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  }

  const { students, isLoading, error, refetch } = useMyStudents(filters)

  const clearFilters = () => {
    setSearch('')
    setClassNameFilter('all')
    setStatusFilter('all')
  }

  const handleViewStudent = (student) => {
    navigate(`/teacher/students/${student.id}`)
  }

  return (
    <div className="students-page">
      <p className="page-description">
        View the students enrolled in your classes. Search the register and apply
        filters to find the students you need.
      </p>

      <TeacherStudentsToolbar
        search={search}
        onSearchChange={setSearch}
        classes={classes}
        classNameFilter={classNameFilter}
        onClassNameChange={setClassNameFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClearFilters={clearFilters}
      />

      <TeacherStudentsTable
        students={students}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onView={handleViewStudent}
      />
    </div>
  )
}

export default TeacherStudentsPage