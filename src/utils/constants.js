import {
  Activity,
  BarChart3,
  Bell,
  ClipboardList,
  FolderOpen,
  LayoutTemplate,
  LifeBuoy,
  Plus,
  Rocket,
  Settings,
  ShieldCheck,
  User,
  Users,
  Wallet,
  Globe,
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

// ── Product routes ───────────────────────────────────────────────────────────

/** The site list — the post-login home. */
export const SITES_PATH = '/sites'

/** Create a new site. */
export const NEW_SITE_PATH = '/sites/new'

/** The template gallery. */
export const TEMPLATES_PATH = '/templates'

/** The account-wide activity trail. */
export const ACTIVITY_PATH = '/activity'

/** The account-wide deployment history. */
export const DEPLOYMENTS_PATH = '/deployments'

/** One deployment in the account-wide history. */
export const DEPLOYMENT_PATH = (deploymentId) => `${DEPLOYMENTS_PATH}/${deploymentId}`

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
 * Every destination here is account-wide: the site list, the template gallery,
 * the activity trail and the deployment history. Nothing is scoped to a
 * workspace any more, so the rail is stable no matter which page is open.
 *
 * Every label is a translation key, so the sidebar follows the active language
 * from the single LocaleProvider and shares its wording with the topbar, the
 * breadcrumb and the command palette.
 */
export const PRODUCT_NAV_ITEMS = [
  {
    key: 'sites',
    labelKey: 'sites.pageTitle',
    path: SITES_PATH,
    icon: FolderOpen,
    end: true,
  },
  {
    key: 'templates',
    labelKey: 'workspace.nav.templates',
    path: TEMPLATES_PATH,
    icon: LayoutTemplate,
  },
  {
    key: 'activity',
    labelKey: 'workspaceActivity.pageTitle',
    path: ACTIVITY_PATH,
    icon: Activity,
  },
  {
    key: 'deployments',
    labelKey: 'workspaceDeployments.pageTitle',
    path: DEPLOYMENTS_PATH,
    icon: Rocket,
  },
]

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
export const getUserSidebarGroups = () =>
  Object.freeze([
    {
      key: 'product',
      labelKey: 'appShell.section.product',
      items: PRODUCT_NAV_ITEMS,
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
 * fixed and therefore resolvable without runtime parameters.
 */
export const SIDEBAR_ITEMS = Object.freeze([
  ...PRODUCT_NAV_ITEMS,
  ...ACCOUNT_NAV_ITEMS,
])
