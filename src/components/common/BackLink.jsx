import { ArrowLeft } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import useTranslation from '@/hooks/useTranslation'
import { findBackPath } from '@/models/navigation'

/**
 * A "return to where you were" action for genuinely nested pages.
 *
 * Only for a page with no other way out: Workspace settings, which hangs off a
 * workspace, and platform settings, which the rail does not list. It is
 * deliberately absent from Profile, Account & Security and Plan & Billing — those
 * are reached straight from the sidebar and the rail stays on screen beside them,
 * so a back link there would only repeat the way out.
 *
 * The destination is derived, never hard-coded per page, so "back" means the
 * same thing everywhere: the portal you belong to, or the workspace you were
 * working in.
 */
function BackLink({ className = '', label }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { pathname } = useLocation()
  const { workspaceId } = useParams()

  const to = findBackPath(pathname, { role: user?.role, workspaceId })
  const text = label ?? t('common.back')

  return (
    <Link to={to} className={`back-link${className ? ` ${className}` : ''}`}>
      <ArrowLeft size={16} aria-hidden="true" />
      <span>{text}</span>
    </Link>
  )
}

export default BackLink
