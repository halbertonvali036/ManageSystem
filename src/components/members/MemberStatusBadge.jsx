import useTranslation from '@/hooks/useTranslation'
import {
  MEMBER_STATUS,
  MEMBER_STATUS_LABEL_KEYS,
  MEMBER_STATUS_VARIANTS,
} from '@/models/member'

/**
 * One member's invitation state.
 *
 * Rendered as text plus a chip, never as a colour alone: `active`, `invited` and
 * `suspended` are three different facts about a person, and each needs its own word.
 */
function MemberStatusBadge({ status }) {
  const { t } = useTranslation()

  if (!Object.values(MEMBER_STATUS).includes(status)) {
    return null
  }

  return (
    <span className={`mem-chip mem-chip--${MEMBER_STATUS_VARIANTS[status]}`}>
      {t(MEMBER_STATUS_LABEL_KEYS[status])}
    </span>
  )
}

export default MemberStatusBadge
