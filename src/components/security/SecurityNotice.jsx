import { Info, PlugZap } from 'lucide-react'

const TONES = {
  pending: {
    className: 'account-security-notice--pending',
    icon: PlugZap,
  },
  info: {
    className: 'account-security-notice--info',
    icon: Info,
  },
}

/**
 * Compact, honest state note used wherever account security data or actions
 * are not available yet. Never claims a verification, revocation, two-factor
 * change or successful sign-in that has not been confirmed by the backend.
 */
function SecurityNotice({ tone = 'pending', title, children, className }) {
  const config = TONES[tone] ?? TONES.pending
  const Icon = config.icon

  return (
    <div
      className={`account-security-notice ${config.className}${className ? ` ${className}` : ''}`}
      role="note"
    >
      <span className="account-security-notice__icon" aria-hidden="true">
        <Icon size={16} />
      </span>
      <p className="account-security-notice__text">
        {title ? <strong className="account-security-notice__title">{title}</strong> : null}
        {title ? ' ' : null}
        {children}
      </p>
    </div>
  )
}

export default SecurityNotice
