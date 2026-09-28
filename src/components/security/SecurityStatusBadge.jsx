import useAccountCopy from '@/hooks/useAccountCopy'
import StatusBadge from '@/components/common/StatusBadge'
import {
  ACCOUNT_STATUS_UNAVAILABLE_LABEL,
  EMAIL_VERIFICATION_UNAVAILABLE_LABEL,
  TWO_FACTOR_STATUS_UNAVAILABLE_LABEL,
  getAccountStatusLabel,
  getAccountStatusVariant,
  getEmailVerificationLabel,
  getEmailVerificationVariant,
  getTwoFactorStatusLabel,
  getTwoFactorStatusVariant,
} from '@/models/accountSecurity'

const SUBJECTS = {
  account: {
    label: getAccountStatusLabel,
    variant: getAccountStatusVariant,
    unavailable: ACCOUNT_STATUS_UNAVAILABLE_LABEL,
  },
  verification: {
    label: getEmailVerificationLabel,
    variant: getEmailVerificationVariant,
    unavailable: EMAIL_VERIFICATION_UNAVAILABLE_LABEL,
  },
  twoFactor: {
    label: getTwoFactorStatusLabel,
    variant: getTwoFactorStatusVariant,
    unavailable: TWO_FACTOR_STATUS_UNAVAILABLE_LABEL,
  },
}

/**
 * Renders one real account-security status from the backend.
 * When the backend has reported nothing, a neutral "… unavailable" chip is
 * shown instead of guessing a state such as verified or enabled.
 */
function SecurityStatusBadge({ subject, value, className }) {
  const copy = useAccountCopy()
  const config = SUBJECTS[subject] ?? SUBJECTS.account
  const variant = config.variant(value)
  const label = value == null ? config.unavailable : config.label(value)

  return (
    <StatusBadge
      status={variant}
      labels={{ [variant]: copy(label) }}
      className={`security-status${className ? ` ${className}` : ''}`}
    />
  )
}

export default SecurityStatusBadge
