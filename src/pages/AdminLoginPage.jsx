import LoginPage from '@/pages/LoginPage'
import { ROLES } from '@/utils/roles'

/**
 * Dedicated administration entry point, served at /admin/login.
 *
 * It is intentionally unlinked: the landing page, the public sign-in and
 * registration never point here, and public registration cannot create an
 * admin account. Authentication decides the role, so this screen only asks the
 * backend for an administrator session. Administrator access is granted
 * server-side; the frontend never infers it from an email address.
 */
function AdminLoginPage() {
  return <LoginPage restrictedRole={ROLES.ADMIN} />
}

export default AdminLoginPage
