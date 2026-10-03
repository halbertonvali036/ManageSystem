import { Link } from 'react-router-dom'
import { ArrowRight, FolderOpen, Settings } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import { WORKSPACE_PATH, WORKSPACE_SETTINGS_PATH, WORKSPACE_SITES_PATH } from '@/utils/constants'
import { formatWorkspaceDate } from '@/models/workspace'

/**
 * Workspace card.
 *
 * One card per workspace. The name is the primary link to the workspace
 * overview. Settings is a secondary link. No action mutates state here —
 * mutations live in the settings page so there is exactly one place where a
 * workspace can be changed.
 */
function WorkspaceCard({ workspace }) {
  const { t, locale } = useTranslation()
  const updatedLabel = formatWorkspaceDate(workspace.updatedAt, locale)

  return (
    <article className="workspace-card">
      <div className="workspace-card__icon" aria-hidden="true">
        <FolderOpen size={24} />
      </div>

      <div className="workspace-card__body">
        <h3 className="workspace-card__name">
          <Link
            to={WORKSPACE_PATH(workspace.id)}
            className="workspace-card__link"
          >
            {workspace.name}
          </Link>
        </h3>

        <p className="workspace-card__slug">/{workspace.slug}</p>

        {updatedLabel && (
          <p className="workspace-card__meta">
            {t('workspaces.card.updated')}{' '}
            <span className="workspace-card__meta-value">{updatedLabel}</span>
          </p>
        )}
      </div>

      <div className="workspace-card__footer">
        <Link
          to={WORKSPACE_SITES_PATH(workspace.id)}
          className="btn btn--ghost workspace-card__cta"
        >
          {t('workspaces.card.open')}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>

        <Link
          to={WORKSPACE_SETTINGS_PATH(workspace.id)}
          className="btn btn--icon workspace-card__settings"
          aria-label={t('workspaces.card.settingsFor', { name: workspace.name })}
        >
          <Settings size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}

export default WorkspaceCard
