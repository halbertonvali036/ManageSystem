import { ArrowLeft, Pencil, Trash2, UserCheck, UserCog, UserX } from 'lucide-react'
import Card from '@/components/common/Card'
import InfoItem from '@/components/common/InfoItem'
import UserStatusBadge from '@/components/users/UserStatusBadge'
import {
  formatLastLogin,
  formatUserCreatedAt,
  formatUserEmail,
  formatUserName,
  formatUserRole,
} from '@/models/user'

function UserProfile({ user, onBack, onEdit, onDelete, onActivate, onDeactivate }) {
  return (
    <div className="user-details details-page">
      <div className="details-toolbar">
        <button type="button" className="btn btn--icon-left" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Users
        </button>
        <div className="details-toolbar__actions">
          {onActivate ? (
            <button
              type="button"
              className="btn btn--icon-left"
              onClick={onActivate}
            >
              <UserCheck size={16} aria-hidden="true" />
              Activate User
            </button>
          ) : null}
          {onDeactivate ? (
            <button
              type="button"
              className="btn btn--icon-left"
              onClick={onDeactivate}
            >
              <UserX size={16} aria-hidden="true" />
              Deactivate User
            </button>
          ) : null}
          <button type="button" className="btn btn--icon-left" onClick={onEdit}>
            <Pencil size={16} aria-hidden="true" />
            Edit User
          </button>
          <button
            type="button"
            className="btn btn--danger btn--icon-left"
            onClick={onDelete}
          >
            <Trash2 size={16} aria-hidden="true" />
            Delete User
          </button>
        </div>
      </div>

      <Card className="user-profile__header">
        <div className="user-profile__avatar" aria-hidden="true">
          <UserCog size={26} />
        </div>
        <div className="user-profile__identity">
          <h2 className="user-profile__name">{formatUserName(user)}</h2>
          <p className="user-profile__meta">
            <span className="user-profile__meta-value">
              {formatUserEmail(user)}
            </span>
            {user.username ? ` · @${user.username}` : ''}
          </p>
        </div>
        <div className="user-profile__status">
          <UserStatusBadge status={user.status} />
        </div>
      </Card>

      <div className="user-details__grid">
        <Card title="Details">
          <dl className="info-grid">
            <InfoItem label="Full Name">{formatUserName(user)}</InfoItem>
            <InfoItem label="Email">{formatUserEmail(user)}</InfoItem>
            <InfoItem label="Username">
              {user.username ? `@${user.username}` : '—'}
            </InfoItem>
            <InfoItem label="Role">{formatUserRole(user)}</InfoItem>
          </dl>
        </Card>

        <Card title="Account">
          <dl className="info-grid">
            <InfoItem label="Status">
              <UserStatusBadge status={user.status} />
            </InfoItem>
            <InfoItem label="Last Login">{formatLastLogin(user)}</InfoItem>
            <InfoItem label="Created">{formatUserCreatedAt(user)}</InfoItem>
          </dl>
        </Card>
      </div>
    </div>
  )
}

export default UserProfile