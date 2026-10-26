import {
  ACCOUNT_PATH,
  ADMIN_NAV_ITEMS,
  ACTIVITY_PATH,
  DEPLOYMENTS_PATH,
  NEW_SITE_PATH,
  PROFILE_PATH,
  SIDEBAR_ITEMS,
  SITES_PATH,
  TEMPLATES_PATH,
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
]

const FALLBACK_TITLE_KEYS = {
  '/403': 'workspace.nav.dashboard',
}

const ALL_TITLE_ITEMS = [...SIDEBAR_ITEMS, ...ADMIN_NAV_ITEMS]

const matchesPath = (item, pathname) =>
  pathname === item.path || pathname.startsWith(`${item.path}/`)

/**
 * Resolves the translation key naming `pathname`.
 *
 * Matching prefers the most specific route, so `/sites/new` resolves to
 * "Create Website" rather than to the "My Websites" item that also prefixes it.
 * Returns null when nothing names the route, which lets the caller decide
 * whether to show the path or nothing at all.
 */
export const findPageTitleKey = (pathname) => {
  const pattern = PATTERN_TITLE_KEYS.find((entry) => entry.matches(pathname))
  if (pattern) {
    return pattern.key
  }

  const extra = EXTRA_TITLE_KEYS.find((entry) =>
    entry.paths.some((path) => pathname === path || pathname.startsWith(`${path}/`)),
  )
  if (extra) {
    return extra.key
  }

  if (pathname === NEW_SITE_PATH) {
    return 'createSite.title'
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
  pathname === ACTIVITY_PATH ||
  pathname === DEPLOYMENTS_PATH

/**
 * Where a "back" action should return to.
 *
 * Account and secondary pages are leaves of the navigation, so a person who
 * arrived there by clicking a sidebar item is already one move from where they
 * started. Returning them to the portal they belong to — their site list for a
 * user, the admin console for an admin — is the destination that is always
 * correct regardless of how they got here.
 */
export const findBackPath = (pathname, { role } = {}) => {
  if (pathname.startsWith('/admin')) {
    return '/admin'
  }
  return role === 'admin' ? '/admin' : SITES_PATH
}
