import useAccountCopy from '@/hooks/useAccountCopy'
import StatusBadge from '@/components/common/StatusBadge'
import {
  BILLING_STATUS_LABELS,
  BILLING_STATUS_UNAVAILABLE_LABEL,
  getBillingStatusVariant,
} from '@/models/billing'

/**
 * Renders a real billing status from the backend.
 * When no status has been reported, a neutral "Status unavailable" chip is
 * shown instead of guessing a subscription state.
 */
function BillingStatusBadge({ status, className }) {
  const copy = useAccountCopy()
  const variant = getBillingStatusVariant(status)
  const label = status ? BILLING_STATUS_LABELS[status] : BILLING_STATUS_UNAVAILABLE_LABEL

  return (
    <StatusBadge
      status={variant}
      labels={{ [variant]: copy(label) }}
      className={`billing-status${className ? ` ${className}` : ''}`}
    />
  )
}

export default BillingStatusBadge
