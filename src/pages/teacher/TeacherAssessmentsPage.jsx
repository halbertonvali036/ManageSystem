import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AssessmentsToolbar from '@/components/teacher/assessments/TeacherAssessmentsToolbar'
import AssessmentsTable from '@/components/teacher/assessments/TeacherAssessmentsTable'
import useMyAssessments from '@/hooks/teacher/useMyAssessments'

function TeacherAssessmentsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filters = {
    ...(search ? { search } : {}),
    ...(typeFilter !== 'all' ? { type: typeFilter } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  }

  const { assessments, isLoading, error, refetch } = useMyAssessments(filters)

  const clearFilters = () => {
    setSearch('')
    setTypeFilter('all')
    setStatusFilter('all')
  }

  const handleView = (assessment) => {
    if (assessment?.id) {
      navigate(`/teacher/assessments/${assessment.id}`)
    }
  }

  return (
    <div className="assessments-page">
      <p className="page-description">
        Review the assessments assigned to your classes. Select an assessment to
        view its details or enter grades for its class.
      </p>

      <AssessmentsToolbar
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClearFilters={clearFilters}
      />

      <AssessmentsTable
        assessments={assessments}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onView={handleView}
      />
    </div>
  )
}

export default TeacherAssessmentsPage