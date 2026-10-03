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
  SUPPORT_PATH,
  WORKSPACES_PATH,
} from '@/utils/constants'

const AdminLoginPage = lazy(() => import('@/pages/AdminLoginPage'))
const BillingPage = lazy(() => import('@/pages/BillingPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const LandingPage = lazy(() => import('@/pages/LandingPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const SupportPage = lazy(() => import('@/pages/SupportPage'))

/* Workspaces & Applications/Sites */
const WorkspacesPage = lazy(() => import('@/pages/workspaces/WorkspacesPage'))
const CreateWorkspacePage = lazy(() => import('@/pages/workspaces/CreateWorkspacePage'))
const WorkspaceOverviewPage = lazy(() => import('@/pages/workspaces/WorkspaceOverviewPage'))
const WorkspaceSettingsPage = lazy(() => import('@/pages/workspaces/WorkspaceSettingsPage'))
const WorkspaceSitesPage = lazy(() => import('@/pages/workspaces/WorkspaceSitesPage'))
const WorkspaceCreateSitePage = lazy(() => import('@/pages/workspaces/WorkspaceCreateSitePage'))
const WorkspaceDatabasePage = lazy(() => import('@/pages/workspaces/WorkspaceDatabasePage'))
const WorkspaceModelRecordsPage = lazy(() =>
  import('@/pages/workspaces/WorkspaceModelRecordsPage')
)
const WorkspaceRecordPage = lazy(() => import('@/pages/workspaces/WorkspaceRecordPage'))
const WorkspaceCapabilitiesPage = lazy(() =>
  import('@/pages/workspaces/WorkspaceCapabilitiesPage')
)
const WorkspaceCapabilityPage = lazy(() =>
  import('@/pages/workspaces/WorkspaceCapabilityPage')
)
const WorkspaceIntegrationsPage = lazy(() =>
  import('@/pages/workspaces/WorkspaceIntegrationsPage')
)
const WorkspaceIntegrationPage = lazy(() =>
  import('@/pages/workspaces/WorkspaceIntegrationPage')
)
const WorkspaceDomainsPage = lazy(() =>
  import('@/pages/workspaces/WorkspaceDomainsPage')
)
const WorkspaceDomainPage = lazy(() =>
  import('@/pages/workspaces/WorkspaceDomainPage')
)
const WorkspaceMembersPage = lazy(() =>
  import('@/pages/workspaces/WorkspaceMembersPage')
)
const WorkspaceActivityPage = lazy(() =>
  import('@/pages/workspaces/WorkspaceActivityPage')
)
const WorkspaceAiPage = lazy(() => import('@/pages/workspaces/WorkspaceAiPage'))
const WorkspaceDeploymentsPage = lazy(() =>
  import('@/pages/workspaces/WorkspaceDeploymentsPage')
)
const WorkspaceDeploymentPage = lazy(() =>
  import('@/pages/workspaces/WorkspaceDeploymentPage')
)
const WorkspaceModelPage = lazy(() => import('@/pages/workspaces/WorkspaceModelPage'))

const SiteDetailsPage = lazy(() => import('@/pages/SiteDetailsPage'))
const SiteEditorPage = lazy(() => import('@/pages/SiteEditorPage'))
const SiteSettingsPage = lazy(() => import('@/pages/SiteSettingsPage'))
const CreateWebsitePage = lazy(() => import('@/pages/CreateWebsitePage'))
const TemplatesPage = lazy(() => import('@/pages/TemplatesPage'))
const AccountPage = lazy(() => import('@/pages/AccountPage'))
const AccountProfilePage = lazy(() => import('@/pages/AccountProfilePage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'))
const OAuthCallbackPage = lazy(() => import('@/pages/OAuthCallbackPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const QrLoginPage = lazy(() => import('@/pages/QrLoginPage'))
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
            {/* Secondary QR sign-in. It reuses the same auth shell and never
                starts a session on its own — the backend decides that. */}
            <Route path="qr" element={<QrLoginPage />} />
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

          {/* ── Workspaces & Applications/Sites ──────────────────────────────
              The default product experience. /workspaces is now the canonical home.
              /sites and /dashboard are kept as compatibility redirects. */}
          <Route element={<MainLayout />}>
            <Route index element={<Navigate to={WORKSPACES_PATH} replace />} />
            <Route
              path="dashboard"
              element={<Navigate to={WORKSPACES_PATH} replace />}
            />
            <Route
              path="sites"
              element={<Navigate to={WORKSPACES_PATH} replace />}
            />
            <Route path="sites/new" element={<CreateWebsitePage />} />
            <Route path="sites/:siteId" element={<SiteDetailsPage />} />

            {/* Workspaces routes */}
            <Route path="workspaces" element={<WorkspacesPage />} />
            <Route path="workspaces/new" element={<CreateWorkspacePage />} />
            <Route path="workspaces/:workspaceId" element={<WorkspaceOverviewPage />} />
            <Route path="workspaces/:workspaceId/settings" element={<WorkspaceSettingsPage />} />
            <Route path="workspaces/:workspaceId/sites" element={<WorkspaceSitesPage />} />
            <Route path="workspaces/:workspaceId/sites/new" element={<WorkspaceCreateSitePage />} />
            <Route path="workspaces/:workspaceId/sites/:siteId" element={<SiteDetailsPage />} />

            {/* Database / schema builder */}
            <Route path="workspaces/:workspaceId/database" element={<WorkspaceDatabasePage />} />
            <Route
              path="workspaces/:workspaceId/database/models/:modelId"
              element={<WorkspaceModelPage />}
            />
            <Route
              path="workspaces/:workspaceId/database/models/:modelId/records"
              element={<WorkspaceModelRecordsPage />}
            />
            <Route
              path="workspaces/:workspaceId/database/models/:modelId/records/:recordId"
              element={<WorkspaceRecordPage />}
            />

            {/* Capabilities / feature modules */}
            <Route
              path="workspaces/:workspaceId/capabilities"
              element={<WorkspaceCapabilitiesPage />}
            />
            <Route
              path="workspaces/:workspaceId/capabilities/:capabilityId"
              element={<WorkspaceCapabilityPage />}
            />

            {/* Integrations / external services */}
            <Route
              path="workspaces/:workspaceId/integrations"
              element={<WorkspaceIntegrationsPage />}
            />
            <Route
              path="workspaces/:workspaceId/integrations/:integrationId"
              element={<WorkspaceIntegrationPage />}
            />

            {/* Domains: platform subdomain + custom domains, DNS and SSL state */}
            <Route
              path="workspaces/:workspaceId/domains"
              element={<WorkspaceDomainsPage />}
            />
            <Route
              path="workspaces/:workspaceId/domains/:domainId"
              element={<WorkspaceDomainPage />}
            />

            {/* Team: workspace members, their roles and what each role may do */}
            <Route
              path="workspaces/:workspaceId/members"
              element={<WorkspaceMembersPage />}
            />

            {/* Activity: the recorded event trail, usage and plan limits */}
            <Route
              path="workspaces/:workspaceId/activity"
              element={<WorkspaceActivityPage />}
            />

            {/* AI: the assistant panel and the review surface for proposed changes */}
            <Route
              path="workspaces/:workspaceId/ai"
              element={<WorkspaceAiPage />}
            />

            {/* Runtime / deployments */}
            <Route
              path="workspaces/:workspaceId/deployments"
              element={<WorkspaceDeploymentsPage />}
            />
            <Route
              path="workspaces/:workspaceId/deployments/:deploymentId"
              element={<WorkspaceDeploymentPage />}
            />

            <Route path="templates" element={<TemplatesPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="account/profile" element={<AccountProfilePage />} />
          </Route>

          {/* ── Site editor and site settings ────────────────────────────────
              Full-bleed workspaces with their own chrome, so they sit outside
              MainLayout. Available both under legacy /sites prefix and workspace prefix. */}
          <Route element={<SiteEditorLayout />}>
            <Route path="sites/:siteId/editor" element={<SiteEditorPage />} />
            <Route path="sites/:siteId/settings" element={<SiteSettingsPage />} />
            <Route path="workspaces/:workspaceId/sites/:siteId/editor" element={<SiteEditorPage />} />
            <Route path="workspaces/:workspaceId/sites/:siteId/settings" element={<SiteSettingsPage />} />
          </Route>

          <Route element={<ProtectedRoute adminOnly />}>
            <Route element={<MainLayout />}>
              <Route path="admin" element={<AdminOverviewPage />} />
              <Route path="admin/users" element={<UsersPage />} />
              <Route path="admin/settings" element={<AdminSettingsPage />} />
              {['websites', 'templates', 'billing', 'domains', 'notifications', 'support', 'audit'].map((section) => (
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
