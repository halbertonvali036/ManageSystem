import { ArrowLeft, Megaphone, Pencil, Trash2 } from 'lucide-react'
import Card from '@/components/common/Card'
import InfoItem from '@/components/common/InfoItem'
import AnnouncementStatusBadge from '@/components/announcements/AnnouncementStatusBadge'
import {
  formatAnnouncementAcademicYearName,
  formatAnnouncementAudienceLabel,
  formatAnnouncementClassContext,
  formatAnnouncementCourseContext,
  formatAnnouncementDate,
  formatAnnouncementMessage,
  formatAnnouncementSemesterName,
  formatAnnouncementTitle,
} from '@/models/announcement'
import { ANNOUNCEMENT_AUDIENCE } from '@/models/announcement'

const formatDateTime = (value) => {
  if (!value) {
    return null
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toLocaleString()
}

function AnnouncementProfile({ announcement, onBack, onEdit, onDelete }) {
  const hasRecordDates = Boolean(announcement.createdAt || announcement.updatedAt)
  const audience = String(announcement.audience)
  const message = formatAnnouncementMessage(announcement)
  const isClassAudience = audience === ANNOUNCEMENT_AUDIENCE.CLASS
  const isCourseAudience = audience === ANNOUNCEMENT_AUDIENCE.COURSE

  return (
    <div className="announcement-details details-page">
      <div className="details-toolbar">
        <button type="button" className="btn btn--icon-left" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Announcements
        </button>
        <div className="details-toolbar__actions">
          <button
            type="button"
            className="btn btn--icon-left"
            onClick={onEdit}
          >
            <Pencil size={16} aria-hidden="true" />
            Edit Announcement
          </button>
          <button
            type="button"
            className="btn btn--danger btn--icon-left"
            onClick={onDelete}
          >
            <Trash2 size={16} aria-hidden="true" />
            Delete Announcement
          </button>
        </div>
      </div>

      <Card className="announcement-profile__header">
        <span className="announcement-profile__avatar" aria-hidden="true">
          <Megaphone size={26} />
        </span>
        <div className="announcement-profile__identity">
          <h2 className="announcement-profile__name">
            {formatAnnouncementTitle(announcement)}
          </h2>
          <p className="announcement-profile__meta">
            Announcement ID:{' '}
            <span className="announcement-profile__meta-value">
              {announcement.id || '—'}
            </span>
          </p>
        </div>
        <div className="announcement-profile__status">
          <AnnouncementStatusBadge status={announcement.status} />
        </div>
      </Card>

      <div className="announcement-details__grid">
        <Card title="Message">
          {message ? (
            <p className="announcement-profile__message">{message}</p>
          ) : (
            <p className="announcement-profile__message announcement-profile__message--empty">
              No message provided.
            </p>
          )}
        </Card>

        <Card title="Targeting">
          <dl className="info-grid">
            <InfoItem label="Audience">
              {formatAnnouncementAudienceLabel(announcement.audience)}
            </InfoItem>
            {isClassAudience ? (
              <InfoItem label="Target Class">
                {formatAnnouncementClassContext(announcement)}
              </InfoItem>
            ) : null}
            {isCourseAudience ? (
              <InfoItem label="Target Course">
                {formatAnnouncementCourseContext(announcement)}
              </InfoItem>
            ) : null}
          </dl>
        </Card>

        <Card title="Academic Context">
          <dl className="info-grid">
            <InfoItem label="Academic Year">
              {formatAnnouncementAcademicYearName(announcement)}
            </InfoItem>
            <InfoItem label="Semester">
              {formatAnnouncementSemesterName(announcement)}
            </InfoItem>
          </dl>
        </Card>

        <Card title="Schedule &amp; Status">
          <dl className="info-grid">
            <InfoItem label="Publish Date">
              {formatAnnouncementDate(announcement.publishDate)}
            </InfoItem>
            <InfoItem label="Expiry Date">
              {announcement.expiryDate
                ? formatAnnouncementDate(announcement.expiryDate)
                : '—'}
            </InfoItem>
            <InfoItem label="Status">
              <AnnouncementStatusBadge status={announcement.status} />
            </InfoItem>
          </dl>
        </Card>

        {hasRecordDates ? (
          <Card title="Record Information">
            <dl className="info-grid">
              {announcement.createdAt ? (
                <InfoItem label="Created">
                  {formatDateTime(announcement.createdAt)}
                </InfoItem>
              ) : null}
              {announcement.updatedAt ? (
                <InfoItem label="Last Updated">
                  {formatDateTime(announcement.updatedAt)}
                </InfoItem>
              ) : null}
            </dl>
          </Card>
        ) : null}
      </div>
    </div>
  )
}

export default AnnouncementProfile