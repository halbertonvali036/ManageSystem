import LoginPage from '@/pages/LoginPage'
import { DEMO_ACCOUNTS } from '@/services/authService'
import { ROLES } from '@/utils/roles'

const adminDemoAccount = DEMO_ACCOUNTS.find((account) => account.role === ROLES.ADMIN)

/**
 * Dedicated administration entry point, served at /admin/login.
 *
 * It is intentionally unlinked: the landing page, the public sign-in and
 * registration never point here, and public registration cannot create an
 * admin account. When `VITE_ENABLE_DEMO_AUTH` is 'true', the temporary demo
 * admin is prefilled on this screen only, so the admin workspace stays
 * reachable for testing without publishing its credentials anywhere public;
 * with the flag off or missing there is nothing to prefill and the screen is
 * an ordinary sign-in. The role still comes back from the session, so routing
 * stays session-driven and the admin guard is unchanged.
 */
function AdminLoginPage() {
  return (
    <LoginPage
      restrictedRole={ROLES.ADMIN}
      initialCredentials={adminDemoAccount}
    />
  )
}

export default AdminLoginPage
