import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Megaphone } from 'lucide-react'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import AnnouncementProfile from '@/components/announcements/AnnouncementProfile'
import useAnnouncement from '@/hooks/useAnnouncement'
import useDeleteAnnouncement from '@/hooks/useDeleteAnnouncement'
import {
  formatAnnouncementAudienceLabel,
  formatAnnouncementDate,
  formatAnnouncementTitle,
} from '@/models/announcement'
import { BackendNotConnectedError } from '@/services/httpClient'

function UnavailableState() {
  return (
    <Card>
      <div className="table-state">
        <Megaphone className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">Announcement data is unavailable</h3>
        <p className="table-state__text">
          Announcement data will be available when the backend API is
          connected.
        </p>
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state">
        <h3 className="table-state__title">Failed to load announcement</h3>
        <p className="table-state__text">{message}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      </div>
    </Card>
  )
}

function AnnouncementDetailContent({ announcementId }) {
  const navigate = useNavigate()
  const { announcement, isLoading, error, refetch } = useAnnouncement(
    announcementId,
  )
  const { isDeleting, deleteError, deleteAnnouncement } = useDeleteAnnouncement(
    announcementId,
  )
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDeleteConfirm = async () => {
    const result = await deleteAnnouncement()
    if (result.ok) {
      navigate('/announcements', { replace: true })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading announcement&hellip;
        </div>
      </Card>
    )
  }

  if (error) {
    return error instanceof BackendNotConnectedError ? (
      <UnavailableState />
    ) : (
      <ErrorState message={error.message} onRetry={refetch} />
    )
  }

  if (!announcement) {
    return null
  }

  return (
    <>
      <AnnouncementProfile
        announcement={announcement}
        onBack={() => navigate('/announcements')}
        onEdit={() => navigate(`/announcements/${announcementId}/edit`)}
        onDelete={() => setShowDeleteDialog(true)}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete announcement"
        message="This action is permanent and cannot be undone. The announcement is removed for all audiences."
        confirmLabel="Delete Announcement"
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      >
        <div className="modal__target">
          <p className="modal__target-row">
            Title: <strong>{formatAnnouncementTitle(announcement)}</strong>
          </p>
          <p className="modal__target-row">
            Audience:{' '}
            <strong>
              {formatAnnouncementAudienceLabel(announcement.audience)}
            </strong>
          </p>
          <p className="modal__target-row">
            Publish Date:{' '}
            <strong>{formatAnnouncementDate(announcement.publishDate)}</strong>
          </p>
        </div>
      </ConfirmDialog>
    </>
  )
}

function AnnouncementDetailsPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <AnnouncementDetailContent key={id} announcementId={id} />
}

export default AnnouncementDetailsPage