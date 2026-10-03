import { useState } from 'react'
import useTranslation from '@/hooks/useTranslation'
import useAdminResource from '@/hooks/useAdminResource'
import AdminDataTable from '@/components/admin/AdminDataTable'
import { ADMIN_COLLECTIONS } from '@/models/adminPlatform'
import { USER_STATUS } from '@/models/user'
import { ROLES } from '@/utils/roles'
import '@/styles/admin-platform.css'

export default function UsersPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const { data, state, retry } = useAdminResource('users', { search, role, status })
  return <section className="admin-platform" aria-label={t('admin.nav.users')}>
    <p className="admin-intro">{t('admin.description.users')}</p>
    <div className="admin-filters">
      <label htmlFor="admin-user-search">{t('admin.searchUsers')}<input id="admin-user-search" className="editor-input" type="search" value={search} onChange={event => setSearch(event.target.value)} /></label>
      <label htmlFor="admin-user-role">{t('admin.fields.role')}<select id="admin-user-role" className="editor-input" value={role} onChange={event => setRole(event.target.value)}>
        <option value="">{t('admin.allRoles')}</option>{Object.values(ROLES).map(value => <option key={value} value={value}>{t(`admin.roles.${value}`)}</option>)}
      </select></label>
      <label htmlFor="admin-user-status">{t('admin.fields.status')}<select id="admin-user-status" className="editor-input" value={status} onChange={event => setStatus(event.target.value)}>
        <option value="">{t('admin.allStatuses')}</option>{Object.values(USER_STATUS).map(value => <option key={value} value={value}>{t(`admin.status.${value}`)}</option>)}
      </select></label>
    </div>
    <AdminDataTable section="users" columns={ADMIN_COLLECTIONS.users} rows={data ?? []} state={state} onRetry={retry} />
    <div className="admin-foundation"><h2>{t('admin.accountAccess')}</h2><p id="admin-user-actions-note">{t('admin.userActionsHint')}</p>
      <div className="admin-pending-actions" aria-describedby="admin-user-actions-note">{['manageRole', 'manageStatus', 'manageAccess'].map(action => <button className="btn btn--outline" type="button" disabled key={action}>{t(`admin.${action}`)}</button>)}</div>
    </div>
  </section>
}
