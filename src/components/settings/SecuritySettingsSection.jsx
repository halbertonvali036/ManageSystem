import {
  Fingerprint,
  KeyRound,
  Lock,
  ShieldCheck,
} from 'lucide-react'
import SettingsPlaceholder from '@/components/settings/SettingsPlaceholder'

function SecuritySettingsSection() {
  return (
    <div className="settings-placeholder-stack">
      <SettingsPlaceholder
        title="Change password"
        text="Password changes are not available until the backend API is connected."
        actionLabel="Change Password"
        icon={<KeyRound size={16} aria-hidden="true" />}
      />
      <SettingsPlaceholder
        title="Session / security settings"
        text="Session timeouts and security policies will be configurable when the backend API is connected."
        actionLabel="Manage Sessions"
        icon={<ShieldCheck size={16} aria-hidden="true" />}
      />
      <SettingsPlaceholder
        title="Multi-factor authentication (MFA)"
        text="MFA enrollment will be available when the backend API is connected."
        actionLabel="Enable MFA"
        icon={<Lock size={16} aria-hidden="true" />}
      />
      <SettingsPlaceholder
        title="Login / session management"
        text="Active logins and device management will be available when the backend API is connected."
        actionLabel="Review Logins"
        icon={<Fingerprint size={16} aria-hidden="true" />}
      />
    </div>
  )
}

export default SecuritySettingsSection