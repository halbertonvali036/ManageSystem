import { Info, PlugZap } from 'lucide-react'

const TONES = {
  pending: {
    className: 'billing-notice--pending',
    icon: PlugZap,
  },
  info: {
    className: 'billing-notice--info',
    icon: Info,
  },
}

/**
 * Compact, honest state note used wherever billing data or actions are not
 * available yet. Never implies a subscription, charge or provider exists.
 */
function BillingNotice({ tone = 'pending', title, children, className }) {
  const config = TONES[tone] ?? TONES.pending
  const Icon = config.icon

  return (
    <div
      className={`billing-notice ${config.className}${className ? ` ${className}` : ''}`}
      role="note"
    >
      <span className="billing-notice__icon" aria-hidden="true">
        <Icon size={16} />
      </span>
      <p className="billing-notice__text">
        {title ? <strong className="billing-notice__title">{title}</strong> : null}
        {title ? ' ' : null}
        {children}
      </p>
    </div>
  )
}

export default BillingNotice
