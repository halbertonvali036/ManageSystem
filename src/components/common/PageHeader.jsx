import { Link, useLocation } from 'react-router-dom'
import useTranslation from '@/hooks/useTranslation'
import {
  NEW_SITE_PATH,
  LEGACY_ACADEMIC_NAV_ITEMS,
  PROFILE_PATH,
  SIDEBAR_ITEMS,
  SITES_PATH,
  WORKSPACE_PATH,
} from '@/utils/constants'

/**
 * Titles for routes that have no navigation item of their own.
 * A path may be a single value or a list of prefixes.
 */
const EXTRA_TITLE_KEYS = [
  { paths: [PROFILE_PATH], key: 'accountProfile.pageTitle' },
]

/**
 * Titles for routes whose path only resolves at runtime. Checked before the
 * static lists because a parameterized route would otherwise be swallowed by
 * its shorter prefix ("/sites/:siteId" matching the "My Websites" item).
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

/**
 * Page title for the shared shell.
 *
 * Titles come from the same navigation list the sidebar renders, so a route
 * never shows a name that is missing from the menu. Matching prefers the most
 * specific route: /sites/new must resolve to "Create Website" rather than the
 * "My Websites" item that also prefixes it.
 */
const matchesPath = (item, pathname) =>
  pathname === item.path || pathname.startsWith(`${item.path}/`)

const findPageTitleKey = (pathname) => {
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

  const matches = SIDEBAR_ITEMS.filter((item) => matchesPath(item, pathname))
  const mostSpecific = matches.reduce(
    (best, item) => (!best || item.path.length > best.path.length ? item : best),
    null,
  )

  return mostSpecific?.labelKey ?? FALLBACK_TITLE_KEYS[pathname] ?? null
}

function PageHeader() {
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const titleKey = findPageTitleKey(pathname)
  const internalItem = LEGACY_ACADEMIC_NAV_ITEMS.find((item) => matchesPath(item, pathname))
  const title = titleKey ? t(titleKey) : internalItem?.label ?? pathname
  const pageOwnsHeading = [SITES_PATH, NEW_SITE_PATH, '/templates'].includes(pathname)
  const isWorkspaceHome = pathname === WORKSPACE_PATH

  return (
    <div className="page-header">
      <p className="breadcrumb">
        {isWorkspaceHome ? <span className="breadcrumb__current">{title}</span> : <><Link to={WORKSPACE_PATH} className="breadcrumb__link">
          {t('workspace.breadcrumbHome')}
        </Link>
        <span className="breadcrumb__separator" aria-hidden="true">
          /
        </span>
        <span className="breadcrumb__current">{title}</span></>}
      </p>
      {!pageOwnsHeading && <h1 className="page-header__title">{title}</h1>}
    </div>
  )
}

export default PageHeader
