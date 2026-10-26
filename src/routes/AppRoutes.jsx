import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AccountLayout from '@/layouts/AccountLayout'
import AuthLayout from '@/layouts/AuthLayout'
import MainLayout from '@/layouts/MainLayout'
import SiteEditorLayout from '@/layouts/SiteEditorLayout'
import ProtectedRoute from '@/routes/ProtectedRoute'
import PublicRoute from '@/routes/PublicRoute'
import useTranslation from '@/hooks/useTranslation'
import {
  BILLING_PATH,
  SECURITY_PATH,
  SITES_PATH,
  SUPPORT_PATH,
} from '@/utils/constants'

const AdminLoginPage = lazy(() => import('@/pages/AdminLoginPage'))
const BillingPage = lazy(() => import('@/pages/BillingPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const LandingPage = lazy(() => import('@/pages/LandingPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const SupportPage = lazy(() => import('@/pages/SupportPage'))

/* Product surface */
const SitesPage = lazy(() => import('@/pages/SitesPage'))
const SiteDetailsPage = lazy(() => import('@/pages/SiteDetailsPage'))
const SiteEditorPage = lazy(() => import('@/pages/SiteEditorPage'))
const SiteSettingsPage = lazy(() => import('@/pages/SiteSettingsPage'))
const CreateWebsitePage = lazy(() => import('@/pages/CreateWebsitePage'))
const TemplatesPage = lazy(() => import('@/pages/TemplatesPage'))
const ActivityPage = lazy(() => import('@/pages/ActivityPage'))
const DeploymentsPage = lazy(() => import('@/pages/DeploymentsPage'))
const DeploymentPage = lazy(() => import('@/pages/DeploymentPage'))

const AccountPage = lazy(() => import('@/pages/AccountPage'))
const AccountProfilePage = lazy(() => import('@/pages/AccountProfilePage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'))
const OAuthCallbackPage = lazy(() => import('@/pages/OAuthCallbackPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const SecurityPage = lazy(() => import('@/pages/SecurityPage'))
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'))
const SessionExpiredPage = lazy(() => import('@/pages/SessionExpiredPage'))
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage'))
const UsersPage = lazy(() => import('@/pages/UsersPage'))

const AdminOverviewPage = lazy(() => import('@/pages/admin/AdminOverviewPage'))
const AdminCollectionPage = lazy(() => import('@/pages/admin/AdminCollectionPage'))
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'))

function RouteFallback() {
  const { t } = useTranslation()
  return (
    <div className="page-status">
      <span className="spinner" aria-hidden="true" />
      {t('common.loading')}
    </div>
  )
}

function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<AuthLayout />}>
            <Route index element={<LoginPage />} />
          </Route>
          {/* Administration entry point. Unlisted on purpose: the landing page,
              the public login and registration never link here. */}
          <Route path="admin/login" element={<AuthLayout />}>
            <Route index element={<AdminLoginPage />} />
          </Route>
          <Route path="register" element={<AuthLayout />}>
            <Route index element={<RegisterPage />} />
          </Route>
          <Route path="forgot-password" element={<AuthLayout />}>
            <Route index element={<ForgotPasswordPage />} />
          </Route>
          <Route path="reset-password" element={<AuthLayout />}>
            <Route index element={<ResetPasswordPage />} />
          </Route>
          {/* Public redirect target for the future backend OAuth flow. It never
              renders a token and never trusts an off-site return path. */}
          <Route path="auth/callback" element={<AuthLayout />}>
            <Route index element={<OAuthCallbackPage />} />
          </Route>
          <Route path="session-expired" element={<SessionExpiredPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          {/* ── Account-level pages ────────────────────────────────────────────
              Profile-independent pages about the signed-in person: what protects
              the account, what the account is billed for, and how to reach the
              account team. Support has its own route rather than a section inside
              Account & Security, so each of them is a destination the sidebar can
              link to directly. */}
          <Route
            element={<AccountLayout titleKey="account.nav.security" path={SECURITY_PATH} />}
          >
            <Route path="security" element={<SecurityPage />} />
          </Route>

          <Route
            element={<AccountLayout titleKey="account.nav.billing" path={BILLING_PATH} />}
          >
            <Route path="billing" element={<BillingPage />} />
          </Route>

          <Route
            element={<AccountLayout titleKey="account.nav.support" path={SUPPORT_PATH} />}
          >
            <Route path="support" element={<SupportPage />} />
          </Route>

          {/* ── Product surface ──────────────────────────────────────────────
              /sites is the canonical home. /dashboard is kept only as a
              compatibility redirect. Templates, Activity and Deployments are
              account-wide sections of the same rail. */}
          <Route element={<MainLayout />}>
            <Route index element={<Navigate to={SITES_PATH} replace />} />
            <Route path="dashboard" element={<Navigate to={SITES_PATH} replace />} />
            <Route path="sites" element={<SitesPage />} />
            <Route path="sites/new" element={<CreateWebsitePage />} />
            <Route path="sites/:siteId" element={<SiteDetailsPage />} />
            <Route path="templates" element={<TemplatesPage />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="deployments" element={<DeploymentsPage />} />
            <Route path="deployments/:deploymentId" element={<DeploymentPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="account/profile" element={<AccountProfilePage />} />
          </Route>

          {/* ── Site editor and site settings ────────────────────────────────
              Full-bleed surfaces with their own chrome, so they sit outside
              MainLayout. Nested under /sites so authorisation is unchanged. */}
          <Route element={<SiteEditorLayout />}>
            <Route path="sites/:siteId/editor" element={<SiteEditorPage />} />
            <Route path="sites/:siteId/settings" element={<SiteSettingsPage />} />
          </Route>

          <Route element={<ProtectedRoute adminOnly />}>
            <Route element={<MainLayout />}>
              <Route path="admin" element={<AdminOverviewPage />} />
              <Route path="admin/users" element={<UsersPage />} />
              <Route path="admin/settings" element={<AdminSettingsPage />} />
              {['websites', 'templates', 'billing', 'notifications', 'support', 'audit'].map((section) => (
                <Route key={section} path={`admin/${section}`} element={<AdminCollectionPage key={section} section={section} />} />
              ))}
            </Route>
          </Route>
          <Route path="403" element={<UnauthorizedPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
