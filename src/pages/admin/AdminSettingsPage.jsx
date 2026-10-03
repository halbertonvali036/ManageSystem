import useTranslation from '@/hooks/useTranslation'
import useAdminResource from '@/hooks/useAdminResource'
import BackLink from '@/components/common/BackLink'
import { AdminDataState } from '@/components/admin/AdminDataTable'
import { ADMIN_SETTINGS_FIELDS, readAdminText } from '@/models/adminPlatform'
import { APP_NAME } from '@/utils/constants'
import config from '@/config'
import '@/styles/admin-platform.css'

export default function AdminSettingsPage() {
  const { t } = useTranslation()
  const { data, state, retry } = useAdminResource('settings')
  const frontend = { productName: APP_NAME, defaultLanguage: 'az', apiBaseUrl: config.api.baseUrl, baseDomain: config.publishing.baseDomain }
  return <section className="admin-platform premium-admin" aria-label={t('admin.nav.settings')}>
    <BackLink />
    <p className="admin-intro">{t('admin.description.settings')}</p>
    <AdminDataState state={state} onRetry={retry} />
    <div className="admin-foundation"><p id="platform-settings-note">{t('admin.settingsHint')}</p>
      <div className="admin-settings-grid">{ADMIN_SETTINGS_FIELDS.map(field => <div className="form__field" key={field}>
        <label htmlFor={`platform-${field}`}>{t(`admin.settingsFields.${field}`)}</label>
        <input id={`platform-${field}`} className="editor-input" value={readAdminText(data?.[field] ?? frontend[field])} placeholder={t('admin.notSet')} readOnly aria-describedby="platform-settings-note" />
      </div>)}</div>
      <p>{t('admin.mutationsPending')}</p><button type="button" className="btn btn--outline" disabled aria-describedby="platform-settings-note">{t('admin.saveSettings')}</button>
    </div>
  </section>
}
