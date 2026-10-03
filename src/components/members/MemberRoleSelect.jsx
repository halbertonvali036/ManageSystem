import useTranslation from '@/hooks/useTranslation'
import {
  ASSIGNABLE_MEMBER_ROLES,
  MEMBER_ROLE,
  MEMBER_ROLE_LABEL_KEYS,
  MEMBER_ROLE_VARIANTS,
} from '@/models/member'

/**
 * The role control for one member.
 *
 * `owner` is never an option. A workspace has exactly one owner — the account that
 * created it — so ownership is not something a role select can hand out or take away;
 * that is a transfer, which is a different action. When the row already holds the
 * owner role the control is not rendered as a select at all, but as a static chip, so
 * the page never shows an editable field that could not do anything.
 *
 * The current role is filtered out of the list, so choosing a value always means a
 * change. This component holds no state: the displayed role is the one the backend
 * reported, so a refused write leaves the control exactly where it was.
 */
function MemberRoleSelect({ member, isBusy, onRoleChange }) {
  const { t } = useTranslation()

  if (member.role === MEMBER_ROLE.OWNER) {
    return (
      <span className={`mem-chip mem-chip--${MEMBER_ROLE_VARIANTS.OWNER}`}>
        {t(MEMBER_ROLE_LABEL_KEYS[MEMBER_ROLE.OWNER])}
      </span>
    )
  }

  const options = ASSIGNABLE_MEMBER_ROLES.filter((role) => role !== member.role)

  return (
    <label className="mem-role">
      <span className="visually-hidden">{t('workspaceMembers.row.roleLabel')}</span>
      <select
        className="form__select mem-role__select"
        value={member.role}
        disabled={isBusy || options.length === 0}
        onChange={(event) => onRoleChange(member, event.target.value)}
      >
        <option value={member.role}>{t(MEMBER_ROLE_LABEL_KEYS[member.role])}</option>
        {options.map((role) => (
          <option key={role} value={role}>
            {t(MEMBER_ROLE_LABEL_KEYS[role])}
          </option>
        ))}
      </select>
    </label>
  )
}

export default MemberRoleSelect
