import { ArrowLeft, Building2, Pencil, Trash2 } from 'lucide-react'
import Card from '@/components/common/Card'
import InfoItem from '@/components/common/InfoItem'
import DepartmentStatusBadge from '@/components/departments/DepartmentStatusBadge'
import {
  formatDepartmentCode,
  formatDepartmentHead,
  formatDepartmentName,
} from '@/models/department'

function DepartmentProfile({ department, onBack, onEdit, onDelete }) {
  return (
    <div className="department-details details-page">
      <div className="details-toolbar">
        <button type="button" className="btn btn--icon-left" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Departments
        </button>
        <div className="details-toolbar__actions">
          <button
            type="button"
            className="btn btn--icon-left"
            onClick={onEdit}
          >
            <Pencil size={16} aria-hidden="true" />
            Edit Department
          </button>
          <button
            type="button"
            className="btn btn--danger btn--icon-left"
            onClick={onDelete}
          >
            <Trash2 size={16} aria-hidden="true" />
            Delete Department
          </button>
        </div>
      </div>

      <Card className="department-profile__header">
        <div className="department-profile__avatar" aria-hidden="true">
          <Building2 size={26} />
        </div>
        <div className="department-profile__identity">
          <h2 className="department-profile__name">
            {formatDepartmentName(department)}
          </h2>
          <p className="department-profile__meta">
            <span className="department-profile__meta-value">
              {formatDepartmentCode(department)}
            </span>
          </p>
        </div>
        <div className="department-profile__status">
          <DepartmentStatusBadge status={department.status} />
        </div>
      </Card>

      <div className="department-details__grid">
        <Card title="Details">
          <dl className="info-grid">
            <InfoItem label="Department Code">
              {formatDepartmentCode(department)}
            </InfoItem>
            <InfoItem label="Department Name">
              {formatDepartmentName(department)}
            </InfoItem>
            <InfoItem label="Head of Department">
              {formatDepartmentHead(department)}
            </InfoItem>
            <InfoItem label="Status">
              <DepartmentStatusBadge status={department.status} />
            </InfoItem>
          </dl>
        </Card>

        <Card title="Description">
          <p
            className={`department-profile__description${
              department.description ? '' : ' department-profile__description--empty'
            }`}
          >
            {department.description || 'No description provided.'}
          </p>
        </Card>
      </div>
    </div>
  )
}

export default DepartmentProfile