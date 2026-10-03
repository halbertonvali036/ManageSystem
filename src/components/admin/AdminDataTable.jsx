import { Database, RefreshCw } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import { ADMIN_STATES, readAdminIdentity, readAdminText } from '@/models/adminPlatform'
import { formatUserName } from '@/models/user'

export function AdminDataState({ state, onRetry }) {
  const { t } = useTranslation()
  if (state === 'ready') return null
  return <div className={`admin-data-state admin-data-state--${state}`} role={state === 'error' ? 'alert' : 'status'}>
    {state === 'loading' ? <span className="spinner" aria-hidden="true" /> : <Database size={24} aria-hidden="true" />}
    <div><strong>{t(`admin.state.${state}`)}</strong><p>{t(`admin.state.${state}Hint`)}</p></div>
    {state === 'error' && <button type="button" className="btn btn--outline" onClick={onRetry}><RefreshCw size={16} aria-hidden="true" />{t('common.retry')}</button>}
  </div>
}

export default function AdminDataTable({ section, columns, rows = [], state, onRetry }) {
  const { t, locale } = useTranslation()
  const valueFor = (record, column) => {
    const value = record[column]
    if (column === 'name' && section === 'users') return record.name || record.fullName || record.firstName ? formatUserName(record) : t('admin.notSet')
    if (['owner', 'actor', 'site', 'plan', 'target'].includes(column)) return readAdminIdentity(value) || t('admin.notSet')
    if (column === 'role') return t(`admin.roles.${['user', 'admin'].includes(value) ? value : 'unknown'}`)
    if (['status', 'verification', 'ssl'].includes(column)) return ADMIN_STATES.includes(value) ? t(`admin.status.${value}`) : t('admin.notSet')
    if (['updatedAt', 'createdAt', 'publishedAt', 'lastLogin'].includes(column)) {
      const date = value ? new Date(value) : null
      return date && Number.isFinite(date.getTime()) ? date.toLocaleString(locale === 'az' ? 'az-AZ' : 'en-GB') : t('admin.notSet')
    }
    return readAdminText(value) || t('admin.notSet')
  }
  return <div className="admin-data-card">
    <div className="admin-table-scroll" tabIndex={0} role="region" aria-label={t(`admin.nav.${section}`)}>
      <table className="admin-platform-table">
        <caption className="sr-only">{t(`admin.nav.${section}`)}</caption>
        <thead><tr>{columns.map(column => <th key={column} scope="col">{t(`admin.fields.${column}`)}</th>)}</tr></thead>
        <tbody>{state === 'ready' && rows.length ? rows.map((record, index) => <tr key={record.id ?? index}>
          {columns.map(column => <td key={column}>{valueFor(record, column)}</td>)}
        </tr>) : <tr><td colSpan={columns.length}><AdminDataState state={state === 'ready' ? 'empty' : state} onRetry={onRetry} /></td></tr>}</tbody>
      </table>
    </div>
  </div>
}
