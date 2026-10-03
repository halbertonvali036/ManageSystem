import { Link } from 'react-router-dom'
import { ArrowRight, FolderPlus } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import { NEW_WORKSPACE_PATH } from '@/utils/constants'

/**
 * Workspaces empty state.
 *
 * Shown when the account has no workspaces. Never renders a sample workspace —
 * it explains what workspaces are for and offers the real way forward.
 */
function WorkspacesEmptyState() {
  const { t } = useTranslation()

  return (
    <div className="workspace-empty">
      <div className="workspace-empty__art" aria-hidden="true">
        <span className="workspace-empty__art-glow" />
        <span className="workspace-empty__art-frame">
          <span className="workspace-empty__art-bar" />
          <span className="workspace-empty__art-line" />
          <span className="workspace-empty__art-line workspace-empty__art-line--short" />
        </span>
        <span className="workspace-empty__art-badge">
          <FolderPlus size={20} />
        </span>
      </div>

      <h3 className="workspace-empty__title">{t('workspaces.emptyTitle')}</h3>
      <p className="workspace-empty__text">{t('workspaces.emptyText')}</p>

      <div className="workspace-empty__actions">
        <Link to={NEW_WORKSPACE_PATH} className="btn btn--primary workspace-empty__cta">
          <FolderPlus size={16} aria-hidden="true" />
          {t('workspaces.newCta')}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}

export default WorkspacesEmptyState
