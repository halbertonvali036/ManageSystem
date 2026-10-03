import {
  ACCOUNT_PATH,
  ADMIN_NAV_ITEMS,
  NEW_SITE_PATH,
  PROFILE_PATH,
  SIDEBAR_ITEMS,
  SITES_PATH,
  TEMPLATES_PATH,
  WORKSPACE_PATH,
  WORKSPACES_PATH,
} from '@/utils/constants'

/**
 * Route → title resolution for the application shell.
 *
 * The topbar and the in-page heading both need to name the current route, and
 * they must never disagree. This module is the single place that decides what a
 * path is called, so a route added to the sidebar gets a name everywhere at
 * once and a route that has no menu entry still gets a real title instead of
 * falling back to its URL.
 */

/**
 * Titles for routes that have no navigation item of their own.
 *
 * The platform-wide Support and Notifications views are not admin rail items —
 * a second "Support" and a second "Notifications" beside the account ones would
 * be two links with one name pointing at different places — so they are named
 * here instead. They are linked from the console overview, through
 * `ADMIN_PLATFORM_VIEWS`.
 */
const EXTRA_TITLE_KEYS = [
  { paths: [PROFILE_PATH], key: 'accountProfile.pageTitle' },
  { paths: [ACCOUNT_PATH], key: 'account.pageTitle' },
  { paths: ['/admin/notifications'], key: 'admin.nav.notifications' },
  { paths: ['/admin/support'], key: 'admin.nav.support' },
]

/**
 * Workspace sections named by the segment that follows the workspace id.
 *
 * The sidebar's workspace-scoped links change with whichever workspace is open,
 * so they cannot be a static path list. Matching on the segment instead keeps the
 * topbar saying "Saytlar" while you are on Sites, and reuses the very same label
 * keys the sidebar and the in-workspace breadcrumb use, so the three cannot drift.
 */
const WORKSPACE_SECTION_KEYS = [
  { segment: 'sites', key: 'workspaces.nav.sites' },
  { segment: 'database', key: 'workspaces.nav.database' },
  { segment: 'capabilities', key: 'workspaces.nav.capabilities' },
  { segment: 'integrations', key: 'workspaces.nav.integrations' },
  { segment: 'domains', key: 'workspaces.nav.domains' },
  { segment: 'deployments', key: 'workspaces.nav.deployments' },
  { segment: 'members', key: 'workspaces.nav.members' },
  { segment: 'activity', key: 'workspaces.nav.activity' },
  { segment: 'ai', key: 'workspaces.nav.ai' },
  { segment: 'settings', key: 'workspaces.nav.settings' },
]

/**
 * Titles for routes whose path only resolves at runtime. Checked before the
 * static lists because a parameterized route would otherwise be swallowed by its
 * shorter prefix ("/sites/:siteId" matching the "My Websites" item).
 */
const PATTERN_TITLE_KEYS = [
  {
    // /sites/new is not a project: it keeps its own "Create Website" title.
    matches: (pathname) =>
      pathname.startsWith(`${SITES_PATH}/`) && pathname !== NEW_SITE_PATH,
    key: 'siteDetails.overviewTitle',
  },
  {
    // /workspaces/new is the create form, not a workspace.
    matches: (pathname) =>
      pathname === `${WORKSPACES_PATH}/new` ||
      pathname.startsWith(`${WORKSPACES_PATH}/`),
    key: null,
  },
]

const FALLBACK_TITLE_KEYS = {
  '/403': 'workspace.nav.dashboard',
}

const ALL_TITLE_ITEMS = [...SIDEBAR_ITEMS, ...ADMIN_NAV_ITEMS]

const matchesPath = (item, pathname) =>
  pathname === item.path || pathname.startsWith(`${item.path}/`)

/**
 * The workspace section a path belongs to, if any.
 *
 * Returns the id and the segment list of `/workspaces/:id/<section>/…` so the
 * caller can tell "a workspace we have a name for" apart from "a workspace" whose
 * own overview page should own the title.
 */
const readWorkspaceSection = (pathname) => {
  const segments = pathname.split('/').filter(Boolean)
  // ["workspaces", "<id>", "<section>", ...]
  if (segments[0] !== 'workspaces' || !segments[1] || segments[1] === 'new') {
    return null
  }
  return { workspaceId: segments[1], section: segments[2] ?? null }
}

/**
 * Resolves the translation key naming `pathname`.
 *
 * Matching prefers the most specific route, so `/sites/new` resolves to
 * "Create Website" rather than to the "Websites" item that also prefixes it.
 * Returns null when nothing names the route, which lets the caller decide
 * whether to show the path or nothing at all.
 */
export const findPageTitleKey = (pathname) => {
  const pattern = PATTERN_TITLE_KEYS.find((entry) => entry.matches(pathname))
  if (pattern) {
    if (pattern.key) {
      return pattern.key
    }

    // A workspace path: name the section the person is actually in, so the
    // topbar keeps saying where they are rather than repeating "Workspaces" for
    // every page inside it.
    const { section } = readWorkspaceSection(pathname) ?? {}
    const workspaceSection = WORKSPACE_SECTION_KEYS.find((entry) => entry.segment === section)
    return workspaceSection?.key ?? 'workspaces.nav.workspaces'
  }

  const extra = EXTRA_TITLE_KEYS.find((entry) =>
    entry.paths.some((path) => pathname === path || pathname.startsWith(`${path}/`)),
  )
  if (extra) {
    return extra.key
  }

  const matches = ALL_TITLE_ITEMS.filter((item) => matchesPath(item, pathname))
  const mostSpecific = matches.reduce(
    (best, item) => (!best || item.path.length > best.path.length ? item : best),
    null,
  )

  return mostSpecific?.labelKey ?? FALLBACK_TITLE_KEYS[pathname] ?? null
}

/** True when the route renders its own visible heading. */
export const routeOwnsHeading = (pathname) =>
  pathname === SITES_PATH ||
  pathname === NEW_SITE_PATH ||
  pathname === TEMPLATES_PATH ||
  pathname === WORKSPACES_PATH

/**
 * Where a "back" action should return to.
 *
 * Account and secondary pages are leaves of the navigation, so a person who
 * arrived there by clicking a sidebar item is already one move from where they
 * started. Returning them to the portal they belong to — their workspace list
 * for a user, the admin console for an admin — is the destination that is
 * always correct regardless of how they got here.
 *
 * Inside a workspace, the workspace itself is the correct parent: backing out
 * of Billing while editing a site should not also throw away the site.
 */
export const findBackPath = (pathname, { role, workspaceId } = {}) => {
  if (pathname.startsWith('/admin')) {
    return '/admin'
  }
  if (workspaceId && pathname.startsWith(`/workspaces/${workspaceId}`)) {
    return WORKSPACE_PATH(workspaceId)
  }
  return role === 'admin' ? '/admin' : '/workspaces'
}
