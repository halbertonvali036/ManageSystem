import HourglassVortex from '@/components/auth/HourglassVortex'

/**
 * The single shared right-hand visual panel for every authentication route.
 *
 * It is intentionally theme-independent: the premium dark-emerald stage is part
 * of the product identity, so switching the application to the light theme must
 * not turn this panel white. Login, Register, Forgot/Reset password and the
 * admin/callback entries all render this same shell, so their right side can no
 * longer drift apart.
 *
 * The panel is now purely ambient: only the animated vortex backdrop remains.
 * The former headline copy, the workflow ribbon and the decorative connections
 * were removed, so the right side carries no text at all.
 */
function AuthVisualPanel() {
  return (
    <aside className="auth-visual auth-visual--vortex" aria-hidden="true">
      <HourglassVortex />
    </aside>
  )
}

export default AuthVisualPanel
