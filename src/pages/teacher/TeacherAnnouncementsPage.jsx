import { useState } from 'react'
import AnnouncementsReadonlyTable from '@/components/announcements/AnnouncementsReadonlyTable'
import AnnouncementsReadonlyToolbar from '@/components/announcements/AnnouncementsReadonlyToolbar'
import useTeacherAnnouncements from '@/hooks/teacher/useTeacherAnnouncements'

function TeacherAnnouncementsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filters = {
    ...(search ? { search } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  }

  const { announcements, isLoading, error, refetch } =
    useTeacherAnnouncements(filters)

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
  }

  return (
    <div className="announcements-page">
      <p className="page-description">
        View the announcements shared with you by the administration. Use the
        filters to find a specific notice.
      </p>

      <AnnouncementsReadonlyToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClearFilters={clearFilters}
      />

      <AnnouncementsReadonlyTable
        announcements={announcements}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
      />
    </div>
  )
}

export default TeacherAnnouncementsPage