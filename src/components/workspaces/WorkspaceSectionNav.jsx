import { NavLink } from 'react-router-dom'
import {
  Activity,
  Boxes,
  Cable,
  Database,
  FolderOpen,
  Globe,
  LayoutDashboard,
  Rocket,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import {
  WORKSPACE_ACTIVITY_PATH,
  WORKSPACE_AI_PATH,
  WORKSPACE_CAPABILITIES_PATH,
  WORKSPACE_DATABASE_PATH,
  WORKSPACE_DEPLOYMENTS_PATH,
  WORKSPACE_DOMAINS_PATH,
  WORKSPACE_INTEGRATIONS_PATH,
  WORKSPACE_MEMBERS_PATH,
  WORKSPACE_PATH,
  WORKSPACE_SETTINGS_PATH,
  WORKSPACE_SITES_PATH,
} from '@/utils/constants'

/**
 * Section switcher inside one workspace.
 *
 * Built from NavLink so the active section is announced through aria-current
 * instead of a class the stylesheet has to guess at. Every entry is a real
 * route: a section that does not exist yet is simply not listed.
 */
function WorkspaceSectionNav({ workspaceId }) {
  const { t } = useTranslation()

  if (!workspaceId) {
    return null
  }

  const items = [
    {
      key: 'overview',
      labelKey: 'workspaces.sections.overview',
      path: WORKSPACE_PATH(workspaceId),
      icon: LayoutDashboard,
      end: true,
    },
    {
      key: 'sites',
      labelKey: 'workspaces.nav.sites',
      path: WORKSPACE_SITES_PATH(workspaceId),
      icon: FolderOpen,
    },
    {
      key: 'database',
      labelKey: 'workspaces.nav.database',
      path: WORKSPACE_DATABASE_PATH(workspaceId),
      icon: Database,
    },
    {
      key: 'capabilities',
      labelKey: 'workspaces.nav.capabilities',
      path: WORKSPACE_CAPABILITIES_PATH(workspaceId),
      icon: Boxes,
    },
    {
      key: 'integrations',
      labelKey: 'workspaces.nav.integrations',
      path: WORKSPACE_INTEGRATIONS_PATH(workspaceId),
      icon: Cable,
    },
    {
      key: 'domains',
      labelKey: 'workspaces.nav.domains',
      path: WORKSPACE_DOMAINS_PATH(workspaceId),
      icon: Globe,
    },
    {
      key: 'deployments',
      labelKey: 'workspaces.nav.deployments',
      path: WORKSPACE_DEPLOYMENTS_PATH(workspaceId),
      icon: Rocket,
    },
    {
      key: 'members',
      labelKey: 'workspaces.nav.members',
      path: WORKSPACE_MEMBERS_PATH(workspaceId),
      icon: Users,
    },
    {
      key: 'activity',
      labelKey: 'workspaces.nav.activity',
      path: WORKSPACE_ACTIVITY_PATH(workspaceId),
      icon: Activity,
    },
    {
      key: 'ai',
      labelKey: 'workspaces.nav.ai',
      path: WORKSPACE_AI_PATH(workspaceId),
      icon: Sparkles,
    },
    {
      key: 'settings',
      labelKey: 'workspaces.nav.settings',
      path: WORKSPACE_SETTINGS_PATH(workspaceId),
      icon: Settings,
    },
  ]

  return (
    <nav className="workspace-sections" aria-label={t('workspaces.sections.nav')}>
      <ul className="workspace-sections__list">
        {items.map(({ key, labelKey, path, icon: Icon, end }) => (
          <li key={key} className="workspace-sections__item">
            <NavLink
              to={path}
              end={end}
              className={({ isActive }) =>
                `workspace-sections__link${isActive ? ' workspace-sections__link--active' : ''}`
              }
            >
              <Icon size={15} aria-hidden="true" />
              {t(labelKey)}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default WorkspaceSectionNav
