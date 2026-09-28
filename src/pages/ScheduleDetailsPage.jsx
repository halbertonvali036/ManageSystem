import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarClock, Pencil, Trash2 } from 'lucide-react'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import InfoItem from '@/components/common/InfoItem'
import ScheduleEntryStatusBadge from '@/components/schedules/ScheduleEntryStatusBadge'
import useDeleteSchedule from '@/hooks/useDeleteSchedule'
import useSchedule from '@/hooks/useSchedule'
import {
  formatScheduleAcademicYearName,
  formatScheduleClassName,
  formatScheduleCourseName,
  formatScheduleDayLabel,
  formatScheduleRoom,
  formatScheduleSemesterName,
  formatScheduleTimeRange,
} from '@/models/schedule'
import { BackendNotConnectedError } from '@/services/httpClient'

function UnavailableState() {
  return (
    <Card>
      <div className="table-state">
        <CalendarClock className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">Schedule data is unavailable</h3>
        <p className="table-state__text">
          Schedule data will be available when the backend API is connected.
        </p>
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state">
        <h3 className="table-state__title">Failed to load schedule entry</h3>
        <p className="table-state__text">{message}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      </div>
    </Card>
  )
}

function ScheduleDetailContent({ scheduleId }) {
  const navigate = useNavigate()
  const { scheduleEntry, isLoading, error, refetch } = useSchedule(scheduleId)
  const { isDeleting, deleteError, deleteSchedule } = useDeleteSchedule(
    scheduleId,
  )
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDeleteConfirm = async () => {
    const result = await deleteSchedule()
    if (result.ok) {
      navigate('/schedules', { replace: true })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading schedule entry&hellip;
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

  if (!scheduleEntry) {
    return null
  }

  return (
    <div className="schedule-details details-page">
      <div className="details-toolbar">
        <button
          type="button"
          className="btn btn--icon-left"
          onClick={() => navigate('/schedules')}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Schedules
        </button>
        <div className="details-toolbar__actions">
          <button
            type="button"
            className="btn btn--icon-left"
            onClick={() => navigate(`/schedules/${scheduleId}/edit`)}
          >
            <Pencil size={16} aria-hidden="true" />
            Edit Schedule Entry
          </button>
          <button
            type="button"
            className="btn btn--danger btn--icon-left"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 size={16} aria-hidden="true" />
            Delete Schedule Entry
          </button>
        </div>
      </div>

      <Card>
        <div className="schedule-details__summary">
          <span className="schedule-details__avatar" aria-hidden="true">
            <CalendarClock size={26} />
          </span>
          <div className="schedule-details__identity">
            <h2 className="schedule-details__name">
              {formatScheduleClassName(scheduleEntry)}
            </h2>
            <p className="schedule-details__meta">
              {formatScheduleDayLabel(scheduleEntry.dayOfWeek)} &middot;{' '}
              {formatScheduleTimeRange(scheduleEntry)} &middot; Room{' '}
              {formatScheduleRoom(scheduleEntry)}
            </p>
          </div>
          <div className="schedule-details__status">
            <ScheduleEntryStatusBadge status={scheduleEntry.status} />
          </div>
        </div>
      </Card>

      <Card title="Details">
        <dl className="info-grid">
          <InfoItem label="Academic Year">
            {formatScheduleAcademicYearName(scheduleEntry)}
          </InfoItem>
          <InfoItem label="Semester">
            {formatScheduleSemesterName(scheduleEntry)}
          </InfoItem>
          <InfoItem label="Class">
            {formatScheduleClassName(scheduleEntry)}
          </InfoItem>
          <InfoItem label="Course">
            {formatScheduleCourseName(scheduleEntry)}
          </InfoItem>
          <InfoItem label="Day">
            {formatScheduleDayLabel(scheduleEntry.dayOfWeek)}
          </InfoItem>
          <InfoItem label="Time">
            {formatScheduleTimeRange(scheduleEntry)}
          </InfoItem>
          <InfoItem label="Room">
            {formatScheduleRoom(scheduleEntry)}
          </InfoItem>
          <InfoItem label="Status">
            <ScheduleEntryStatusBadge status={scheduleEntry.status} />
          </InfoItem>
        </dl>
      </Card>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete schedule entry"
        message="This action is permanent and cannot be undone. Only this timetable entry is removed; no class, course or other records are affected."
        confirmLabel="Delete Entry"
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      >
        <div className="modal__target">
          <p className="modal__target-row">
            Day: <strong>{formatScheduleDayLabel(scheduleEntry.dayOfWeek)}</strong>
          </p>
          <p className="modal__target-row">
            Class: <strong>{formatScheduleClassName(scheduleEntry)}</strong>
          </p>
          <p className="modal__target-row">
            Time: <strong>{formatScheduleTimeRange(scheduleEntry)}</strong>
          </p>
        </div>
      </ConfirmDialog>
    </div>
  )
}

function ScheduleDetailsPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <ScheduleDetailContent key={id} scheduleId={id} />
}

export default ScheduleDetailsPage