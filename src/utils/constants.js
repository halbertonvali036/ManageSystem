import {
  BarChart3,
  Bell,
  BookMarked,
  BookOpen,
  Building2,
  CalendarClock,
  CalendarRange,
  ClipboardCheck,
  ClipboardList,
  Globe,
  LayoutTemplate,
  Megaphone,
  Plus,
  School,
  Settings,
  ShieldCheck,
  UserCog,
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
export const ACCOUNT_PATH = '/account'
export const PROFILE_PATH = `${ACCOUNT_PATH}/profile`

/** Website-builder routes. */
export const SITES_PATH = '/sites'
export const NEW_SITE_PATH = '/sites/new'
export const TEMPLATES_PATH = '/templates'

/**
 * The workspace home. `/dashboard` is kept as a compatibility redirect so any
 * existing link or bookmark still lands on the real workspace.
 */
export const WORKSPACE_PATH = SITES_PATH
export const LEGACY_DASHBOARD_PATH = '/dashboard'

/** @param {string} siteId */
export const SITE_DETAILS_PATH = (siteId) => `${SITES_PATH}/${siteId}`

/** The visual editor. Nested under the site so authorisation is unchanged. */
/** @param {string} siteId */
export const SITE_EDITOR_PATH = (siteId) => `${SITE_DETAILS_PATH(siteId)}/editor`

/**
 * Site settings. Nested under the site for the same reason the editor is: the
 * site id is the authorisation subject, so keeping it in the path means the route
 * guard and the resource being guarded stay in one place.
 * @param {string} siteId
 */
export const SITE_SETTINGS_PATH = (siteId) => `${SITE_DETAILS_PATH(siteId)}/settings`

/** Deep links to the sections of the account page this app now owns. */
export const NOTIFICATION_PREFERENCES_ANCHOR = `${SECURITY_PATH}#notification-preferences`
export const PASSWORD_CHANGE_ANCHOR = `${SECURITY_PATH}#password`
export const SUPPORT_ANCHOR = `${SECURITY_PATH}#support`

/**
 * Website-builder navigation — the normal product experience.
 *
 * Labels are translation keys so the sidebar follows the active language from
 * the single LocaleProvider instead of hardcoding labels per component.
 */
export const WORKSPACE_NAV_ITEMS = [
  {
    key: 'myWebsites',
    labelKey: 'workspace.nav.myWebsites',
    path: SITES_PATH,
    icon: Globe,
    section: 'workspace.nav.section.workspace',
    end: true,
  },
  {
    key: 'createWebsite',
    labelKey: 'workspace.nav.createWebsite',
    path: NEW_SITE_PATH,
    icon: Plus,
  },
  {
    key: 'templates',
    labelKey: 'workspace.nav.templates',
    path: TEMPLATES_PATH,
    icon: LayoutTemplate,
    section: 'workspace.nav.section.build',
  },
  {
    key: 'account',
    labelKey: 'workspace.nav.account',
    path: ACCOUNT_PATH,
    icon: UserCog,
    section: 'workspace.nav.section.account',
  },
  {
    key: 'notifications',
    labelKey: 'workspace.nav.notifications',
    path: NOTIFICATIONS_PATH,
    icon: Bell,
  },
  {
    key: 'billing',
    labelKey: 'workspace.nav.billing',
    path: BILLING_PATH,
    icon: Wallet,
  },
  {
    key: 'security',
    labelKey: 'workspace.nav.security',
    path: SECURITY_PATH,
    icon: ShieldCheck,
  },
]

/**
 * Legacy academic administration navigation.
 *
 * Retained only so the existing administration area keeps working while the
 * product pivots. It is not reachable from the public product navigation and
 * nothing new should be added here — see the pivot report for removal order.
 */
export const LEGACY_ACADEMIC_NAV_ITEMS = [
  { key: 'students', label: 'Students', path: '/students', icon: Users, section: 'Academic' },
  { key: 'departments', label: 'Departments', path: '/departments', icon: Building2 },
  { key: 'subjects', label: 'Subjects', path: '/subjects', icon: BookMarked },
  { key: 'academicYears', label: 'Academic Years', path: '/academic-years', icon: CalendarRange },
  { key: 'courses', label: 'Courses', path: '/courses', icon: BookOpen },
  { key: 'classes', label: 'Classes', path: '/classes', icon: School },
  { key: 'schedules', label: 'Schedules', path: '/schedules', icon: CalendarClock },
  { key: 'announcements', label: 'Announcements', path: '/announcements', icon: Megaphone },
  { key: 'attendance', label: 'Attendance', path: '/attendance', icon: ClipboardCheck },
  { key: 'grades', label: 'Grades', path: '/grades', icon: ClipboardCheck },
  { key: 'assessments', label: 'Assessments', path: '/assessments', icon: ClipboardList },
  { key: 'reports', label: 'Reports', path: '/reports', icon: BarChart3, section: 'Insights' },
  { key: 'users', label: 'Users', path: '/users', icon: UserCog, section: 'System' },
  { key: 'roles', label: 'Roles', path: '/roles', icon: ShieldCheck },
  { key: 'settings', label: 'Settings', path: '/settings', icon: Settings },
]

/**
 * Navigation source for the shared shell. Kept as one array so `PageHeader`
 * and `AppSidebar` resolve titles from the same list the shell renders.
 */
export const SIDEBAR_ITEMS = WORKSPACE_NAV_ITEMS
