import { Mail, RotateCw, Trash2 } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import {
  formatMemberDate,
  getMemberActions,
  getMemberInitials,
  isPendingMember,
} from '@/models/member'
import MemberRoleSelect from '@/components/members/MemberRoleSelect'
import MemberStatusBadge from '@/components/members/MemberStatusBadge'

/**
 * One member row.
 *
 * A member is a person, so nothing here is filled in when the backend has not sent it:
 * an accepted member shows the name the account carries, an outstanding invitation
 * shows that no name exists yet, and only an accepted membership draws a join date. A
 * row is never rendered from initials alone — if there is no member, there is no row.
 *
 * Actions are requests, not local toggles. The role shown, the status chip and the
 * timestamps are re-read from the backend after every write, so a refused write leaves
 * the row exactly as it was.
 */
function MemberRow({ member, isBusy, onRoleChange, onResendInvite, onRemove }) {
  const { t, locale } = useTranslation()

  const actions = getMemberActions(member)
  const isPending = isPendingMember(member)
  // A timestamp the backend sent is formatted; one it did not, or one that is not a
  // date, leaves the line out entirely rather than printing a raw string.
  const invitedOn = formatMemberDate(member.invitedAt, locale)
  const joinedOn = formatMemberDate(member.joinedAt, locale)

  return (
    <li className="mem-row">
      <span className="mem-row__avatar" aria-hidden="true">
        {getMemberInitials(member)}
      </span>

      <div className="mem-row__identity">
        <p className="mem-row__name">
          {member.name ?? (
            <span className="mem-row__name-missing">
              {t('workspaceMembers.row.invitedNoName')}
            </span>
          )}
        </p>
        <p className="mem-row__email">{member.email}</p>
      </div>

      <div className="mem-row__meta">
        <MemberStatusBadge status={member.status} />
        <MemberRoleSelect member={member} isBusy={isBusy} onRoleChange={onRoleChange} />
      </div>

      <dl className="mem-row__dates">
        {invitedOn ? (
          <div className="mem-row__date">
            <dt>{t('workspaceMembers.row.invitedAtLabel')}</dt>
            <dd>
              <time dateTime={member.invitedAt}>{invitedOn}</time>
            </dd>
          </div>
        ) : null}

        {/* Only an accepted membership has a join date; an invitation must not imply one. */}
        {joinedOn && !isPending ? (
          <div className="mem-row__date">
            <dt>{t('workspaceMembers.row.joinedAtLabel')}</dt>
            <dd>
              <time dateTime={member.joinedAt}>{joinedOn}</time>
            </dd>
          </div>
        ) : null}

        {isPending ? (
          <p className="mem-row__hint">
            <Mail size={13} aria-hidden="true" />
            {t('workspaceMembers.row.invitedHint')}
          </p>
        ) : null}
      </dl>

      <div className="mem-row__actions">
        {actions.canResendInvite ? (
          <button
            type="button"
            className="btn btn--ghost mem-row__action"
            onClick={() => onResendInvite(member)}
            disabled={isBusy}
          >
            <RotateCw size={15} aria-hidden="true" />
            {t('workspaceMembers.row.resendInviteCta')}
          </button>
        ) : null}

        {actions.canRemove ? (
          <button
            type="button"
            className="btn btn--ghost mem-row__action mem-row__action--danger"
            onClick={() => onRemove(member)}
            disabled={isBusy}
          >
            <Trash2 size={15} aria-hidden="true" />
            {t('workspaceMembers.row.removeCta')}
          </button>
        ) : (
          <span className="mem-row__locked">{t('workspaceMembers.row.ownerLocked')}</span>
        )}
      </div>
    </li>
  )
}

export default MemberRow
