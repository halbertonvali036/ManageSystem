import { useState } from 'react'
import StudentAssessmentsTable from '@/components/student/assessments/StudentAssessmentsTable'
import StudentAssessmentsToolbar from '@/components/student/assessments/StudentAssessmentsToolbar'
import useMyAssessments from '@/hooks/student/useMyAssessments'

function StudentAssessmentsPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const filters = {
    ...(search ? { search } : {}),
    ...(typeFilter !== 'all' ? { type: typeFilter } : {}),
  }

  const { assessments, isLoading, error, refetch } = useMyAssessments(filters)

  const clearFilters = () => {
    setSearch('')
    setTypeFilter('all')
  }

  return (
    <div className="assessments-page">
      <p className="page-description">
        Review the assessments schedule published for your classes. Your recorded
        scores are available under Grades.
      </p>

      <StudentAssessmentsToolbar
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        onClearFilters={clearFilters}
      />

      <StudentAssessmentsTable
        assessments={assessments}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
      />
    </div>
  )
}

export default StudentAssessmentsPage