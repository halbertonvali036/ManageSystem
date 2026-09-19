import { ArrowLeft, Pencil, ShieldCheck, Trash2 } from 'lucide-react'
import Card from '@/components/common/Card'
import InfoItem from '@/components/common/InfoItem'
import PermissionsEditor from '@/components/roles/PermissionsEditor'
import RoleStatusBadge from '@/components/roles/RoleStatusBadge'
import {
  formatRoleDescription,
  formatRoleName,
  formatRoleUserCount,
} from '@/models/role'

function RoleProfile({ role, onBack, onEdit, onDelete }) {
  return (
    <div className="role-details details-page">
      <div className="details-toolbar">
        <button type="button" className="btn btn--icon-left" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Roles
        </button>
        <div className="details-toolbar__actions">
          <button type="button" className="btn btn--icon-left" onClick={onEdit}>
            <Pencil size={16} aria-hidden="true" />
            Edit Role
          </button>
          <button
            type="button"
            className="btn btn--danger btn--icon-left"
            onClick={onDelete}
          >
            <Trash2 size={16} aria-hidden="true" />
            Delete Role
          </button>
        </div>
      </div>

      <Card className="role-profile__header">
        <div className="role-profile__avatar" aria-hidden="true">
          <ShieldCheck size={26} />
        </div>
        <div className="role-profile__identity">
          <h2 className="role-profile__name">{formatRoleName(role)}</h2>
          <p className="role-profile__meta">
            <span className="role-profile__meta-value">
              {formatRoleUserCount(role)} user(s)
            </span>
          </p>
        </div>
        <div className="role-profile__status">
          <RoleStatusBadge status={role.status} />
        </div>
      </Card>

      <div className="role-details__grid">
        <Card title="Details">
          <dl className="info-grid">
            <InfoItem label="Role Name">{formatRoleName(role)}</InfoItem>
            <InfoItem label="Status">
              <RoleStatusBadge status={role.status} />
            </InfoItem>
          </dl>
        </Card>

        <Card title="Description">
          <p
            className={`role-profile__description${
              role.description ? '' : ' role-profile__description--empty'
            }`}
          >
            {formatRoleDescription(role)}
          </p>
        </Card>
</div>

      <div className="role-details__permissions">
        <Card title="Permissions">
          <PermissionsEditor permissions={role.permissions ?? null} readOnly />
        </Card>
      </div>
    </div>
  )
}

export default RoleProfile