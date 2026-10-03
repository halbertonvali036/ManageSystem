import {
  Activity,
  BarChart3,
  Bell,
  Boxes,
  Cable,
  ClipboardList,
  Database,
  FolderOpen,
  Folders,
  Globe,
  LayoutTemplate,
  LifeBuoy,
  Link2,
  Plus,
  Rocket,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  Wallet,
} from 'lucide-react'


/**
 * Product identity.
 *
 * Temporary, neutral working name. Replace it once a real brand is decided —
 * every visible surface reads it from here.
 */
export const APP_NAME = 'SiteBuilder'

/**
 * Account-level routes shared by every authenticated role.
 * Plan & Billing and Account & Security are not part of the
 * website-builder navigation.
 */
export const NOTIFICATIONS_PATH = '/notifications'
export const BILLING_PATH = '/billing'
export const SECURITY_PATH = '/security'
export const SUPPORT_PATH = '/support'
export const ACCOUNT_PATH = '/account'
export const PROFILE_PATH = `${ACCOUNT_PATH}/profile`

// ── Workspace routes ─────────────────────────────────────────────────────────

/** Root workspaces list — the new post-login home. */
export const WORKSPACES_PATH = '/workspaces'

/** Create a new workspace. */
export const NEW_WORKSPACE_PATH = '/workspaces/new'

/** Overview page for a single workspace. */
export const WORKSPACE_PATH = (workspaceId) => `/workspaces/${workspaceId}`

/** Settings page for a single workspace. */
export const WORKSPACE_SETTINGS_PATH = (workspaceId) =>
  `/workspaces/${workspaceId}/settings`

/** Site list inside a workspace. */
export const WORKSPACE_SITES_PATH = (workspaceId) =>
  `/workspaces/${workspaceId}/sites`

/** Workspace-scoped site creation. */
export const WORKSPACE_NEW_SITE_PATH = (workspaceId) =>
  `/workspaces/${workspaceId}/sites/new`

/** Site detail inside a workspace. */
export const WORKSPACE_SITE_DETAILS_PATH = (workspaceId, siteId) =>
  `/workspaces/${workspaceId}/sites/${siteId}`

/** Site editor inside a workspace. */
export const WORKSPACE_SITE_EDITOR_PATH = (workspaceId, siteId) =>
  `/workspaces/${workspaceId}/sites/${siteId}/editor`

/** Site settings inside a workspace. */
export const WORKSPACE_SITE_SETTINGS_PATH = (workspaceId, siteId) =>
  `/workspaces/${workspaceId}/sites/${siteId}/settings`

/** The workspace data / schema builder. */
export const WORKSPACE_DATABASE_PATH = (workspaceId) =>
  `/workspaces/${workspaceId}/database`
/** The workspace capability catalog. */
export const WORKSPACE_CAPABILITIES_PATH = (workspaceId) =>
  `/workspaces/${workspaceId}/capabilities`
/** Settings for one capability inside a workspace. */
export const WORKSPACE_CAPABILITY_PATH = (workspaceId, capabilityId) =>
  `${WORKSPACE_CAPABILITIES_PATH(workspaceId)}/${capabilityId}`
/** The workspace integration catalog. */
export const WORKSPACE_INTEGRATIONS_PATH = (workspaceId) =>
  `/workspaces/${workspaceId}/integrations`
/** Connect / configure one integration inside a workspace. */
export const WORKSPACE_INTEGRATION_PATH = (workspaceId, integrationId) =>
  `${WORKSPACE_INTEGRATIONS_PATH(workspaceId)}/${integrationId}`
/** Domains this workspace answers on. */
export const WORKSPACE_DOMAINS_PATH = (workspaceId) =>
  `/workspaces/${workspaceId}/domains`
/** One domain inside a workspace: state, DNS records and SSL. */
export const WORKSPACE_DOMAIN_PATH = (workspaceId, domainId) =>
  `${WORKSPACE_DOMAINS_PATH(workspaceId)}/${domainId}`
/**
 * The workspace team: the people in it and the roles they hold there.
 *
 * Workspace roles are separate from the platform roles in `utils/roles.js` — being an
 * application `admin` says nothing about what you may do inside somebody's workspace.
 */
export const WORKSPACE_MEMBERS_PATH = (workspaceId) =>
  `/workspaces/${workspaceId}/members`
/**
 * Workspace activity: the recorded event trail, usage and plan limits.
 *
 * Read-only by nature. There is no route here for recording an event, because the
 * backend writes the trail — a browser that could append to it would turn an audit
 * log into a scratchpad.
 */
export const WORKSPACE_ACTIVITY_PATH = (workspaceId) =>
  `/workspaces/${workspaceId}/activity`

/**
 * AI assistant.
 *
 * Read-and-review surface for `AI köməkçi`. Every write on this page goes through
 * `aiService` and refuses to run until a backend is connected, so the route being
 * reachable means nothing is claimed to be working that is not.
 */
export const WORKSPACE_AI_PATH = (workspaceId) => `/workspaces/${workspaceId}/ai`
/** Runtime / deployment history for a workspace. */
export const WORKSPACE_DEPLOYMENTS_PATH = (workspaceId) =>
  `/workspaces/${workspaceId}/deployments`
/** One deployment inside a workspace. */
export const WORKSPACE_DEPLOYMENT_PATH = (workspaceId, deploymentId) =>
  `${WORKSPACE_DEPLOYMENTS_PATH(workspaceId)}/${deploymentId}`
/**
 * Existing product modules a capability can hand off to.
 *
 * A capability never re-implements one of these — it links to the route that
 * already works, which is how Forms, Database, Media and the rest stay single
 * sources of truth. Integrations name the same modules: an integration feeds an
 * existing feature rather than becoming a second copy of it.
 */
export const WORKSPACE_MODULE_PATHS = Object.freeze({
  sites: WORKSPACE_SITES_PATH,
  database: WORKSPACE_DATABASE_PATH,
  settings: WORKSPACE_SETTINGS_PATH,
  security: SECURITY_PATH,
  notifications: NOTIFICATIONS_PATH,
  billing: BILLING_PATH,
})

/** One schema model inside a workspace. */
export const WORKSPACE_MODEL_PATH = (workspaceId, modelId) =>
  `${WORKSPACE_DATABASE_PATH(workspaceId)}/models/${modelId}`
/** Records of one schema model inside a workspace. */
export const WORKSPACE_MODEL_RECORDS_PATH = (workspaceId, modelId) =>
  `${WORKSPACE_MODEL_PATH(workspaceId, modelId)}/records`
/** One record of a schema model inside a workspace. */
export const WORKSPACE_RECORD_PATH = (workspaceId, modelId, recordId) =>
  `${WORKSPACE_MODEL_RECORDS_PATH(workspaceId, modelId)}/${recordId}`

// ── Legacy site routes (kept for backward compatibility / redirects) ──────────

/** @deprecated Redirect to WORKSPACES_PATH instead. */
export const SITES_PATH = '/sites'
export const NEW_SITE_PATH = '/sites/new'
export const TEMPLATES_PATH = '/templates'

/**
 * The workspace home. `/workspaces` is now the canonical home.
 * `/dashboard` is kept only as a compatibility redirect.
 */
export const WORKSPACE_HOME_PATH = WORKSPACES_PATH
export const LEGACY_DASHBOARD_PATH = '/dashboard'

/** @param {string} siteId */
export const SITE_DETAILS_PATH = (siteId) => `${SITES_PATH}/${siteId}`

/** The visual editor. Nested under the site so authorisation is unchanged. */
/** @param {string} siteId */
export const SITE_EDITOR_PATH = (siteId) => `${SITE_DETAILS_PATH(siteId)}/editor`

/**
 * Site settings.
 * @param {string} siteId
 */
export const SITE_SETTINGS_PATH = (siteId) => `${SITE_DETAILS_PATH(siteId)}/settings`

/** Deep links to the sections of the account pages this app now owns. */
export const NOTIFICATION_PREFERENCES_ANCHOR = `${SECURITY_PATH}#notification-preferences`
export const PASSWORD_CHANGE_ANCHOR = `${SECURITY_PATH}#password`

/**
 * Product navigation — the "what do I build" half of the sidebar.
 *
 * Reads from "where am I" outward: the workspace list, then the sections that
 * live inside one workspace, with Templates — the one destination that is
 * genuinely account-wide rather than workspace-bound — sitting where a builder
 * expects it, between Sites and the schema tools.
 *
 * Most of these destinations only exist inside a workspace, so their paths need a
 * workspace id. When none has been opened yet the workspace-scoped entries are
 * left out rather than linked to a workspace that may not exist: a link to
 * nowhere is worse than a shorter list. Everything reachable without a workspace
 * — the workspace list and Templates — stays.
 *
 * Every label is a translation key, so the sidebar follows the active language
 * from the single LocaleProvider and shares its wording with the in-workspace
 * section nav and the breadcrumb.
 */
export const getWorkspaceNavItems = (workspaceId) => {
  const items = [
    {
      key: 'workspaces',
      labelKey: 'workspaces.nav.workspaces',
      path: WORKSPACES_PATH,
      icon: Folders,
      end: true,
    },
  ]

  if (workspaceId) {
    items.push({
      key: 'workspaceSites',
      labelKey: 'workspaces.nav.sites',
      path: WORKSPACE_SITES_PATH(workspaceId),
      icon: FolderOpen,
    })
  }

  items.push({
    key: 'templates',
    labelKey: 'workspace.nav.templates',
    path: TEMPLATES_PATH,
    icon: LayoutTemplate,
  })

  if (workspaceId) {
    items.push(
      {
        key: 'workspaceDatabase',
        labelKey: 'workspaces.nav.database',
        path: WORKSPACE_DATABASE_PATH(workspaceId),
        icon: Database,
      },
      {
        key: 'workspaceCapabilities',
        labelKey: 'workspaces.nav.capabilities',
        path: WORKSPACE_CAPABILITIES_PATH(workspaceId),
        icon: Boxes,
      },
      {
        key: 'workspaceIntegrations',
        labelKey: 'workspaces.nav.integrations',
        path: WORKSPACE_INTEGRATIONS_PATH(workspaceId),
        icon: Cable,
      },
      {
        key: 'workspaceDomains',
        labelKey: 'workspaces.nav.domains',
        path: WORKSPACE_DOMAINS_PATH(workspaceId),
        icon: Globe,
      },
      {
        key: 'workspaceDeployments',
        labelKey: 'workspaces.nav.deployments',
        path: WORKSPACE_DEPLOYMENTS_PATH(workspaceId),
        icon: Rocket,
      },
      {
        key: 'workspaceMembers',
        labelKey: 'workspaces.nav.members',
        path: WORKSPACE_MEMBERS_PATH(workspaceId),
        icon: Users,
      },
      {
        key: 'workspaceActivity',
        labelKey: 'workspaces.nav.activity',
        path: WORKSPACE_ACTIVITY_PATH(workspaceId),
        icon: Activity,
      },
      {
        key: 'workspaceAi',
        labelKey: 'workspaces.nav.ai',
        path: WORKSPACE_AI_PATH(workspaceId),
        icon: Sparkles,
      },
    )
  }

  return items
}

/**
 * Account navigation, shared by every authenticated role.
 *
 * Same destinations for users and admins, because these are facts about the
 * person signed in rather than about the product. Support is a page of its own:
 * it is a way to reach the account team, not a step of hardening the account, so
 * it does not belong inside Account & Security where it used to sit.
 */
export const ACCOUNT_NAV_ITEMS = [
  {
    key: 'profile',
    labelKey: 'account.nav.profile',
    path: PROFILE_PATH,
    icon: User,
  },
  {
    key: 'security',
    labelKey: 'account.nav.security',
    path: SECURITY_PATH,
    icon: ShieldCheck,
  },
  {
    key: 'billing',
    labelKey: 'account.nav.billing',
    path: BILLING_PATH,
    icon: Wallet,
  },
  {
    key: 'support',
    labelKey: 'account.nav.support',
    path: SUPPORT_PATH,
    icon: LifeBuoy,
  },
  {
    key: 'notifications',
    labelKey: 'account.nav.notifications',
    path: NOTIFICATIONS_PATH,
    icon: Bell,
  },
]

/**
 * The account group the sidebar actually renders.
 *
 * Profile is missing on purpose. In the rail it is not a list row but the
 * identity block pinned above Logout — the person, not a section — so listing it
 * again would give the same destination two homes. It stays in
 * `ACCOUNT_NAV_ITEMS` so the command palette and the page-title model still know
 * about it.
 */
export const ACCOUNT_SIDEBAR_ITEMS = Object.freeze(
  ACCOUNT_NAV_ITEMS.filter((item) => item.key !== 'profile'),
)

/**
 * Internal website-builder platform navigation.
 *
 * Only the sections the console itself owns. Platform Settings belongs here
 * because nothing in the account group competes with it; the platform-wide
 * Support and Notifications views are deliberately not — a second "Support" and
 * a second "Notifications" next to the account ones would be two links with one
 * name pointing at different places. They are reached from the overview grid,
 * which is where a platform-wide surface belongs, and named by
 * `models/navigation`.
 */
export const ADMIN_NAV_ITEMS = [
  { key: 'adminOverview', labelKey: 'admin.nav.overview', path: '/admin', icon: BarChart3, end: true },
  { key: 'adminUsers', labelKey: 'admin.nav.users', path: '/admin/users', icon: Users },
  { key: 'adminWebsites', labelKey: 'admin.nav.websites', path: '/admin/websites', icon: Globe },
  { key: 'adminTemplates', labelKey: 'admin.nav.templates', path: '/admin/templates', icon: LayoutTemplate },
  { key: 'adminBilling', labelKey: 'admin.nav.billing', path: '/admin/billing', icon: Wallet },
  { key: 'adminDomains', labelKey: 'admin.nav.domains', path: '/admin/domains', icon: Link2 },
  { key: 'adminAudit', labelKey: 'admin.nav.audit', path: '/admin/audit', icon: ClipboardList },
  { key: 'adminSettings', labelKey: 'admin.nav.settings', path: '/admin/settings', icon: Settings },
]

/**
 * The platform-wide views the console overview links to.
 *
 * Everything the rail lists is a console section; these two are the platform
 * equivalents of the account's own Support and Notifications pages — every
 * request in the platform rather than the ones addressed to you — so they live
 * here instead of giving the rail a second entry under the same name.
 */
export const ADMIN_PLATFORM_VIEWS = Object.freeze([
  { key: 'support', labelKey: 'admin.nav.support', path: '/admin/support', icon: LifeBuoy },
  { key: 'notifications', labelKey: 'admin.nav.notifications', path: '/admin/notifications', icon: Bell },
])

/**
 * The groups the sidebar renders, in order.
 *
 * `product` is the thing the person came here to do; `account` is who they are.
 * Signing out is neither, so the shell pins it to the bottom of the rail rather
 * than to either group — and it pins the identity link directly above it, so
 * signing out always has the person it belongs to one row above it. Keeping the
 * groups as data rather than as JSX order means the sidebar cannot drift from the
 * navigation model it is built on.
 *
 * Admins get the platform group *and* the account group, because "how the
 * platform is doing" and "how my own account is doing" are separate questions
 * that happen to share a person. They do not get a "Create Website" action:
 * creating sites is a user capability, and an admin who wants one should switch
 * to a user account rather than borrow a button that bypasses their own role
 * boundary.
 */
export const getUserSidebarGroups = (workspaceId) =>
  Object.freeze([
    {
      key: 'product',
      labelKey: 'appShell.section.product',
      items: getWorkspaceNavItems(workspaceId),
      // The one create action the product offers, pinned above the product
      // group so it reads as the entry point rather than another destination.
      action: {
        key: 'newSite',
        labelKey: 'appShell.newSiteCta',
        path: NEW_SITE_PATH,
        icon: Plus,
      },
    },
    { key: 'account', labelKey: 'appShell.section.account', items: ACCOUNT_SIDEBAR_ITEMS },
  ])

export const ADMIN_SIDEBAR_GROUPS = Object.freeze([
  { key: 'platform', labelKey: 'appShell.section.platform', items: ADMIN_NAV_ITEMS },
  { key: 'account', labelKey: 'appShell.section.account', items: ACCOUNT_SIDEBAR_ITEMS },
])

/**
 * Flat route → label source for the shared shell, for the routes whose path is
 * fixed and therefore resolvable without a workspace id. Workspace-scoped
 * routes resolve through `models/navigation` instead.
 */
export const SIDEBAR_ITEMS = Object.freeze([
  ...getWorkspaceNavItems(null),
  ...ACCOUNT_NAV_ITEMS,
])
