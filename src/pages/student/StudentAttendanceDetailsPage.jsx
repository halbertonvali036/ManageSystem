import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ClipboardCheck } from 'lucide-react'
import Card from '@/components/common/Card'
import InfoItem from '@/components/common/InfoItem'
import AttendanceStatusBadge from '@/components/attendance/AttendanceStatusBadge'
import useMyAttendanceRecord from '@/hooks/student/useMyAttendanceRecord'
import {
  formatAttendanceClassRef,
  formatAttendanceCourseName,
  formatAttendanceDate,
} from '@/models/attendance'
import { BackendNotConnectedError } from '@/services/httpClient'

function UnavailableState({ onBack }) {
  return (
    <>
      <div className="details-toolbar">
        <button type="button" className="btn btn--icon-left" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Attendance
        </button>
      </div>
      <Card>
        <div className="table-state">
          <ClipboardCheck
            className="table-state__icon"
            size={40}
            aria-hidden="true"
          />
          <h3 className="table-state__title">Attendance record is unavailable</h3>
          <p className="table-state__text">
            Attendance data will be available when the backend API is connected.
          </p>
        </div>
      </Card>
    </>
  )
}

function ErrorState({ message, onRetry, onBack }) {
  return (
    <>
      <div className="details-toolbar">
        <button type="button" className="btn btn--icon-left" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Attendance
        </button>
      </div>
      <Card>
        <div className="table-state">
          <h3 className="table-state__title">Failed to load attendance record</h3>
          <p className="table-state__text">{message}</p>
          <button type="button" className="btn btn--primary" onClick={onRetry}>
            Retry
          </button>
        </div>
      </Card>
    </>
  )
}

function AttendanceRecordDetails({ recordId }) {
  const navigate = useNavigate()
  const { record, isLoading, error, refetch } = useMyAttendanceRecord(recordId)

  const handleBack = () => navigate('/student/attendance')

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading attendance record&hellip;
        </div>
      </Card>
    )
  }

  if (error) {
    return error instanceof BackendNotConnectedError ? (
      <UnavailableState onBack={handleBack} />
    ) : (
      <ErrorState message={error.message} onRetry={refetch} onBack={handleBack} />
    )
  }

  if (!record) {
    return null
  }

  return (
    <div className="attendance-details details-page">
      <div className="details-toolbar">
        <button type="button" className="btn btn--icon-left" onClick={handleBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Attendance
        </button>
      </div>

      <Card className="class-profile__header">
        <span className="class-profile__avatar" aria-hidden="true">
          <ClipboardCheck size={26} />
        </span>
        <div className="class-profile__identity">
          <h2 className="class-profile__name">
            {formatAttendanceClassRef(record)}
          </h2>
          <p className="class-profile__meta">
            {formatAttendanceDate(record.date)}
          </p>
        </div>
        <div className="class-profile__status">
          <AttendanceStatusBadge status={record.status} />
        </div>
      </Card>

      <div className="class-details__grid">
        <Card title="Attendance Record">
          <dl className="info-grid">
            <InfoItem label="Date">
              {formatAttendanceDate(record.date)}
            </InfoItem>
            <InfoItem label="Class">
              {formatAttendanceClassRef(record)}
            </InfoItem>
          </dl>
        </Card>

        <Card title="Status">
          <dl className="info-grid">
            <InfoItem label="Attendance Status">
              <AttendanceStatusBadge status={record.status} />
            </InfoItem>
            <InfoItem label="Check-in Time">
              {record.checkInTime || '—'}
            </InfoItem>
          </dl>
        </Card>

        <Card title="Course">
          <dl className="info-grid">
            <InfoItem label="Course">
              {formatAttendanceCourseName(record)}
            </InfoItem>
          </dl>
        </Card>

        <Card title="Notes">
          <dl className="info-grid">
            <InfoItem label="Notes">{record.notes || '—'}</InfoItem>
          </dl>
        </Card>
      </div>
    </div>
  )
}

function StudentAttendanceDetailsPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <AttendanceRecordDetails key={id} recordId={id} />
}

export default StudentAttendanceDetailsPage