import LoginPage from '@/pages/LoginPage'
import { DEMO_ACCOUNTS } from '@/services/authService'
import { ROLES } from '@/utils/roles'

const adminDemoAccount = DEMO_ACCOUNTS.find((account) => account.role === ROLES.ADMIN)

/**
 * Dedicated administration entry point, served at /admin/login.
 *
 * It is intentionally unlinked: the landing page, the public sign-in and
 * registration never point here, and public registration cannot create an
 * admin account. The development demo admin is prefilled on this screen only,
 * so the admin workspace stays reachable for testing without publishing its
 * credentials anywhere public. The role still comes back from the session, so
 * routing stays backend-driven.
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
