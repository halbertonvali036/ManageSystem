import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import useTranslation from '@/hooks/useTranslation'
import {
  WORKSPACES_PATH,
  WORKSPACE_PATH,
  WORKSPACE_ACTIVITY_PATH,
  WORKSPACE_AI_PATH,
  WORKSPACE_CAPABILITIES_PATH,
  WORKSPACE_DATABASE_PATH,
  WORKSPACE_DEPLOYMENTS_PATH,
  WORKSPACE_DOMAINS_PATH,
  WORKSPACE_INTEGRATIONS_PATH,
  WORKSPACE_MEMBERS_PATH,
  WORKSPACE_SETTINGS_PATH,
  WORKSPACE_SITES_PATH,
} from '@/utils/constants'

/**
 * Route for each workspace section, so a section in the trail can be a real
 * link back to its own page instead of dead text.
 */
const SECTION_PATHS = Object.freeze({
  sites: WORKSPACE_SITES_PATH,
  database: WORKSPACE_DATABASE_PATH,
  capabilities: WORKSPACE_CAPABILITIES_PATH,
  integrations: WORKSPACE_INTEGRATIONS_PATH,
  domains: WORKSPACE_DOMAINS_PATH,
  deployments: WORKSPACE_DEPLOYMENTS_PATH,
  members: WORKSPACE_MEMBERS_PATH,
  activity: WORKSPACE_ACTIVITY_PATH,
  ai: WORKSPACE_AI_PATH,
  settings: WORKSPACE_SETTINGS_PATH,
})

/**
 * Breadcrumb strip for workspace-scoped pages.
 *
 * Renders: Workspaces → [Workspace name] → [optional section] → [optional leaf]
 *
 * @param {Object}  props
 * @param {Object}  props.workspace   Workspace object (or null while loading).
 * @param {string|null} props.section Active sub-page key, e.g. 'sites'.
 * @param {Object|null} props.current  Optional leaf: `{ label }` for a
 *                                      non-link leaf or `{ label, to }` where
 *                                      `to` is a ready-made path.
 */
function WorkspaceBreadcrumb({ workspace, section = null, current = null }) {
  const { t } = useTranslation()

  const workspaceName = workspace?.name ?? '…'
  const workspaceId = workspace?.id

  return (
    <nav className="workspace-breadcrumb" aria-label={t('workspaces.breadcrumb.nav')}>
      <ol className="workspace-breadcrumb__list">
        <li className="workspace-breadcrumb__item">
          <Link to={WORKSPACES_PATH} className="workspace-breadcrumb__link">
            {t('workspaces.breadcrumb.workspaces')}
          </Link>
        </li>

        <Separator />

        <li className="workspace-breadcrumb__item">
          {section || current ? <Link to={workspaceId ? WORKSPACE_PATH(workspaceId) : WORKSPACES_PATH} className="workspace-breadcrumb__link">{workspaceName}</Link> : <span aria-current="page">{workspaceName}</span>}
        </li>
        {section ? (
          <>
            <Separator />
            <li className="workspace-breadcrumb__item">
              {current ? (
                <Link
                  to={workspaceId && SECTION_PATHS[section] ? SECTION_PATHS[section](workspaceId) : WORKSPACES_PATH}
                  className="workspace-breadcrumb__link"
                >
                  {t(`workspaces.breadcrumb.${section}`)}
                </Link>
              ) : (
                <span
                  className="workspace-breadcrumb__item workspace-breadcrumb__item--current"
                  aria-current="page"
                >
                  {t(`workspaces.breadcrumb.${section}`)}
                </span>
              )}
            </li>
          </>
        ) : null}

        {current ? (
          <>
          <Separator />
          <li className="workspace-breadcrumb__item">
            {current.to ? (
              <Link to={current.to} className="workspace-breadcrumb__link">
                {current.label}
              </Link>
            ) : (
              <span
                className="workspace-breadcrumb__item workspace-breadcrumb__item--current"
                aria-current="page"
              >
                {current.label}
              </span>
            )}
          </li>
          </>
        ) : null}
      </ol>
    </nav>
  )
}

function Separator() {
  return (
    <li className="workspace-breadcrumb__sep" aria-hidden="true">
      <ChevronRight size={14} />
    </li>
  )
}

export default WorkspaceBreadcrumb
