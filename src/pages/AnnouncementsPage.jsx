import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Megaphone } from 'lucide-react'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import AnnouncementsTable from '@/components/announcements/AnnouncementsTable'
import AnnouncementsToolbar from '@/components/announcements/AnnouncementsToolbar'
import useAcademicYears from '@/hooks/useAcademicYears'
import useAnnouncements from '@/hooks/useAnnouncements'
import useDeleteAnnouncement from '@/hooks/useDeleteAnnouncement'
import {
  formatAnnouncementAudienceLabel,
  formatAnnouncementDate,
  formatAnnouncementTitle,
} from '@/models/announcement'

function LoadingState() {
  return (
    <Card>
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        Loading announcements&hellip;
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state table-state--error">
        <h3 className="table-state__title">Failed to load announcements</h3>
        <p className="table-state__text">{message}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      </div>
    </Card>
  )
}

function EmptyState() {
  return (
    <Card>
      <div className="table-state">
        <Megaphone className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">No announcements are available.</h3>
      </div>
    </Card>
  )
}

function AnnouncementsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [audienceFilter, setAudienceFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [academicYearFilter, setAcademicYearFilter] = useState('')

  const { academicYears, isLoading: academicYearsLoading } = useAcademicYears()

  const filters = {
    ...(search ? { search } : {}),
    ...(audienceFilter !== 'all' ? { audience: audienceFilter } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
    ...(academicYearFilter ? { academicYearId: academicYearFilter } : {}),
  }

  const { announcements, isLoading, error, refetch } = useAnnouncements(filters)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const { isDeleting, deleteError, deleteAnnouncement } = useDeleteAnnouncement(
    deleteTarget?.id,
  )

  const clearFilters = () => {
    setSearch('')
    setAudienceFilter('all')
    setStatusFilter('all')
    setAcademicYearFilter('')
  }

  const handleAdd = () => {
    navigate('/announcements/new')
  }

  const handleView = (announcement) => {
    navigate(`/announcements/${announcement.id}`)
  }

  const handleEdit = (announcement) => {
    navigate(`/announcements/${announcement.id}/edit`)
  }

  const handleDeleteRequest = (announcement) => {
    setDeleteTarget(announcement)
  }

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteTarget(null)
    }
  }

  const handleDeleteConfirm = async () => {
    const result = await deleteAnnouncement()
    if (result.ok) {
      setDeleteTarget(null)
      refetch()
    }
  }

  return (
    <div className="announcements-page">
      <p className="page-description">
        Create and manage announcements for students and teachers. Choose a
        targeted audience, set publish and expiry dates, and track the status
        of every notice.
      </p>

      <AnnouncementsToolbar
        search={search}
        onSearchChange={setSearch}
        audienceFilter={audienceFilter}
        onAudienceChange={setAudienceFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        academicYears={academicYears}
        academicYearsLoading={academicYearsLoading}
        academicYearId={academicYearFilter}
        onAcademicYearChange={setAcademicYearFilter}
        onClearFilters={clearFilters}
        onAdd={handleAdd}
      />

      {isLoading ? <LoadingState /> : null}
      {!isLoading && error ? (
        <ErrorState message={error.message} onRetry={refetch} />
      ) : null}
      {!isLoading && !error && announcements.length === 0 ? <EmptyState /> : null}

      {!isLoading && !error && announcements.length > 0 ? (
        <AnnouncementsTable
          announcements={announcements}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete announcement"
        message="This action is permanent and cannot be undone."
        confirmLabel="Delete Announcement"
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      >
        {deleteTarget ? (
          <div className="modal__target">
            <p className="modal__target-row">
              Title: <strong>{formatAnnouncementTitle(deleteTarget)}</strong>
            </p>
            <p className="modal__target-row">
              Audience:{' '}
              <strong>
                {formatAnnouncementAudienceLabel(deleteTarget.audience)}
              </strong>
            </p>
            <p className="modal__target-row">
              Publish Date:{' '}
              <strong>{formatAnnouncementDate(deleteTarget.publishDate)}</strong>
            </p>
          </div>
        ) : null}
      </ConfirmDialog>
    </div>
  )
}

export default AnnouncementsPage