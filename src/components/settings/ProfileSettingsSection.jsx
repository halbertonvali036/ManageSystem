import { ArrowRight, KeyRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SettingsInput } from '@/components/settings/SettingsInputs'
import SettingsPlaceholder from '@/components/settings/SettingsPlaceholder'
import { PASSWORD_CHANGE_ANCHOR } from '@/utils/constants'

/**
 * Administrator account details plus a hand-off to the one password surface.
 *
 * The password form itself lives on the Account & Security page for every role,
 * so this section only deep-links to it instead of keeping a second copy of the
 * fields here.
 */
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
          status="Account page"
          text="Your password is changed on the Account & Security page, which verifies the current password and applies the backend policy. The form stays disabled until that service is connected."
          icon={<KeyRound size={16} aria-hidden="true" />}
          action={
            <Link
              to={PASSWORD_CHANGE_ANCHOR}
              className="btn btn--primary"
              aria-label="Open Account &amp; Security to change your password"
            >
              Open
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          }
        />
      </div>
    </>
  )
}

export default ProfileSettingsSection
