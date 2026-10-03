import { Check, Minus } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import { MEMBER_ROLES, MEMBER_ROLE_LABEL_KEYS } from '@/models/member'
import {
  WORKSPACE_ACTIONS,
  countRolePermissions,
  getWorkspacePermissionMatrix,
} from '@/models/workspacePermission'

/**
 * What each role can do inside this workspace.
 *
 * This is a *read-only* declaration. It shows the frontend's permission vocabulary so
 * the roles on the list above can be understood, and it is deliberately not editable:
 * changing what a role can do is a product decision with consequences for everyone
 * holding that role, so it belongs with the backend contract, not with a control on a
 * page that could save nothing.
 *
 * Each cell comes straight from the grant table in `models/workspacePermission.js`, so
 * a check can never appear here for a permission the table does not hold. The viewer
 * column is empty by design — it is read access, and this list only names actions that
 * change something, which is what the note underneath says.
 *
 * Advisory only: hiding a control is a presentation decision. The backend enforces the
 * same rules again, and nothing here is a substitute for it.
 */
function WorkspacePermissionsMatrix() {
  const { t } = useTranslation()

  const rows = getWorkspacePermissionMatrix()

  return (
    <section className="mem-matrix" aria-labelledby="mem-matrix-title">
      <div className="mem-matrix__head">
        <h2 className="card__title" id="mem-matrix-title">
          {t('workspaceMembers.permissions.title')}
        </h2>
        <p className="mem-matrix__description">{t('workspaceMembers.permissions.description')}</p>
      </div>

      <div className="mem-matrix__summary">
        {MEMBER_ROLES.map((role) => (
          <span key={role} className={`mem-matrix__chip mem-matrix__chip--${role}`}>
            {t(MEMBER_ROLE_LABEL_KEYS[role])}
            <span className="mem-matrix__chip-count">
              {t('workspaceMembers.permissions.grantedCount', {
                count: countRolePermissions(role),
                total: WORKSPACE_ACTIONS.length,
              })}
            </span>
          </span>
        ))}
      </div>

      <div className="mem-matrix__scroll">
        <table className="mem-matrix__table">
          <caption className="visually-hidden">
            {t('workspaceMembers.permissions.tableCaption')}
          </caption>
          <thead>
            <tr>
              <th scope="col">{t('workspaceMembers.permissions.actionColumn')}</th>
              {MEMBER_ROLES.map((role) => (
                <th key={role} scope="col">
                  {t(MEMBER_ROLE_LABEL_KEYS[role])}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.action}>
                <th scope="row">
                  <span className="mem-matrix__action">{t(row.labelKey)}</span>
                  <span className="mem-matrix__action-hint">{t(row.descriptionKey)}</span>
                </th>
                {MEMBER_ROLES.map((role) => (
                  <td key={role} className="mem-matrix__cell">
                    {row.roles[role] ? (
                      <>
                        <Check
                          className="mem-matrix__mark mem-matrix__mark--on"
                          size={16}
                          aria-hidden="true"
                        />
                        <span className="visually-hidden">
                          {t('workspaceMembers.permissions.granted')}
                        </span>
                      </>
                    ) : (
                      <>
                        <Minus
                          className="mem-matrix__mark mem-matrix__mark--off"
                          size={16}
                          aria-hidden="true"
                        />
                        <span className="visually-hidden">
                          {t('workspaceMembers.permissions.notGranted')}
                        </span>
                      </>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mem-matrix__note">{t('workspaceMembers.permissions.note')}</p>
    </section>
  )
}

export default WorkspacePermissionsMatrix
