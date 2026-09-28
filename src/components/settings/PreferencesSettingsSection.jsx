import { ArrowRight, BellRing } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  SETTINGS_DATE_FORMATS,
  SETTINGS_PAGE_SIZES,
  SETTINGS_THEMES,
  SETTINGS_TIME_FORMATS,
} from '@/models/settings'
import { SettingsSelect } from '@/components/settings/SettingsInputs'
import { NOTIFICATION_PREFERENCES_ANCHOR } from '@/utils/constants'

function PreferencesSettingsSection({ values, onChange }) {
  return (
    <>
      <div className="settings-grid">
        <SettingsSelect
          field="theme"
          label="Theme"
          value={values.theme}
          onChange={onChange}
          options={SETTINGS_THEMES}
          disabled
          hint="Theme switching is not supported yet."
        />
        <SettingsSelect
          field="dateFormat"
          label="Date format"
          value={values.dateFormat}
          onChange={onChange}
          options={SETTINGS_DATE_FORMATS}
        />
        <SettingsSelect
          field="timeFormat"
          label="Time format"
          value={values.timeFormat}
          onChange={onChange}
          options={SETTINGS_TIME_FORMATS}
        />
        <SettingsSelect
          field="pageSize"
          label="Rows per page"
          value={values.pageSize}
          onChange={onChange}
          options={SETTINGS_PAGE_SIZES}
        />
      </div>

      <div className="settings-placeholder">
        <span className="settings-placeholder__icon" aria-hidden="true">
          <BellRing size={16} />
        </span>
        <div className="settings-placeholder__info">
          <div className="settings-placeholder__heading">
            <p className="settings-placeholder__title">Notification preferences</p>
            <span className="settings-placeholder__badge">Account page</span>
          </div>
          <p className="settings-placeholder__text">
            In-app, email, security, academic and billing notification preferences for your own
            account are managed on the Account &amp; Security page, so they are not duplicated
            here.
          </p>
        </div>
        <Link
          to={NOTIFICATION_PREFERENCES_ANCHOR}
          className="btn btn--primary"
          aria-label="Open notification preferences"
        >
          Open
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </>
  )
}

export default PreferencesSettingsSection