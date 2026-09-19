import { BellRing } from 'lucide-react'
import {
  SETTINGS_DATE_FORMATS,
  SETTINGS_PAGE_SIZES,
  SETTINGS_THEMES,
  SETTINGS_TIME_FORMATS,
} from '@/models/settings'
import { SettingsSelect } from '@/components/settings/SettingsInputs'
import SettingsPlaceholder from '@/components/settings/SettingsPlaceholder'

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
      <div className="settings-placeholder-stack settings-placeholder-stack--spaced">
        <SettingsPlaceholder
          title="Notification preferences"
          text="Email and alert preferences will be configurable when the backend API is connected."
          actionLabel="Configure Notifications"
          icon={<BellRing size={16} aria-hidden="true" />}
        />
      </div>
    </>
  )
}

export default PreferencesSettingsSection