import { Globe, PencilLine } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import { SITE_STATUS, SITE_STATUS_LABEL_KEYS } from '@/models/site'

/**
 * Draft / published / unpublished / archived indicator for a site project.
 *
 * Status is a first-class part of the project model, so the badge is shared by
 * the project card, the project list and the project header. An unknown status
 * falls back to draft rather than rendering an empty badge.
 */
const STATUS_ICONS = {
  [SITE_STATUS.PUBLISHED]: Globe,
  [SITE_STATUS.UNPUBLISHED]: Globe,
  [SITE_STATUS.ARCHIVED]: PencilLine,
}

function SiteStatusBadge({ status, className = '' }) {
  const { t } = useTranslation()
  const safeStatus = SITE_STATUS_LABEL_KEYS[status] ? status : SITE_STATUS.DRAFT
  const labelKey = SITE_STATUS_LABEL_KEYS[safeStatus]
  const Icon = STATUS_ICONS[safeStatus] ?? Globe

  return (
    <span
      className={`site-status site-status--${safeStatus}${className ? ` ${className}` : ''}`}
      data-status={safeStatus}
    >
      <Icon className="site-status__icon" size={12} aria-hidden="true" />
      {t(labelKey)}
    </span>
  )
}

export default SiteStatusBadge
