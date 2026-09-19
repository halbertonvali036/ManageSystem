import { KeyRound } from 'lucide-react'
import { SettingsInput } from '@/components/settings/SettingsInputs'
import SettingsPlaceholder from '@/components/settings/SettingsPlaceholder'

function ProfileSettingsSection({ values, onChange }) {
  return (
    <>
      <div className="settings-grid">
        <SettingsInput
          field="adminName"
          label="Name"
          value={values.adminName}
          onChange={onChange}
          placeholder="e.g. Alex Doe"
        />
        <SettingsInput
          field="adminEmail"
          label="Email"
          type="email"
          value={values.adminEmail}
          onChange={onChange}
          placeholder="alex@school.edu"
        />
      </div>
      <div className="settings-placeholder-stack settings-placeholder-stack--spaced">
        <SettingsPlaceholder
          title="Change password"
          text="Password changes are not available until the backend API is connected."
          actionLabel="Change Password"
          icon={<KeyRound size={16} aria-hidden="true" />}
        />
      </div>
    </>
  )
}

export default ProfileSettingsSection