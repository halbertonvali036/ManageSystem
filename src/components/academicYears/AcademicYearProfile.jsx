import { ArrowLeft, CalendarRange, Pencil, Trash2 } from 'lucide-react'
import Card from '@/components/common/Card'
import InfoItem from '@/components/common/InfoItem'
import AcademicPeriodStatusBadge from '@/components/academicYears/AcademicPeriodStatusBadge'
import {
  formatAcademicPeriodDate,
  formatAcademicYearName,
} from '@/models/academicYear'

function AcademicYearProfile({ academicYear, onBack, onEdit, onDelete }) {
  return (
    <div className="academic-year-details details-page">
      <div className="details-toolbar">
        <button type="button" className="btn btn--icon-left" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Academic Years
        </button>
        <div className="details-toolbar__actions">
          <button
            type="button"
            className="btn btn--icon-left"
            onClick={onEdit}
          >
            <Pencil size={16} aria-hidden="true" />
            Edit Academic Year
          </button>
          <button
            type="button"
            className="btn btn--danger btn--icon-left"
            onClick={onDelete}
          >
            <Trash2 size={16} aria-hidden="true" />
            Delete Academic Year
          </button>
        </div>
      </div>

      <Card className="academic-year-profile__header">
        <span className="academic-year-profile__avatar" aria-hidden="true">
          <CalendarRange size={26} />
        </span>
        <div className="academic-year-profile__identity">
          <h2 className="academic-year-profile__name">
            {formatAcademicYearName(academicYear)}
          </h2>
          <p className="academic-year-profile__meta">
            {formatAcademicPeriodDate(academicYear.startDate)} &ndash;{' '}
            {formatAcademicPeriodDate(academicYear.endDate)}
          </p>
        </div>
        <div className="academic-year-profile__status">
          <AcademicPeriodStatusBadge status={academicYear.status} />
        </div>
      </Card>

      <div className="academic-year-details__grid">
        <Card title="Details">
          <dl className="info-grid">
            <InfoItem label="Academic Year">
              {formatAcademicYearName(academicYear)}
            </InfoItem>
            <InfoItem label="Start Date">
              {formatAcademicPeriodDate(academicYear.startDate)}
            </InfoItem>
            <InfoItem label="End Date">
              {formatAcademicPeriodDate(academicYear.endDate)}
            </InfoItem>
            <InfoItem label="Status">
              <AcademicPeriodStatusBadge status={academicYear.status} />
            </InfoItem>
          </dl>
        </Card>
      </div>
    </div>
  )
}

export default AcademicYearProfile