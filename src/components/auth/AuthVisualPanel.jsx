import HourglassVortex from '@/components/auth/HourglassVortex'
import BuilderVisual from '@/components/common/BuilderVisual'
import useTranslation from '@/hooks/useTranslation'
import { APP_NAME } from '@/utils/constants'

/**
 * The single shared right-hand visual panel for every authentication route.
 *
 * It is intentionally theme-independent: the premium dark-emerald stage is part
 * of the product identity, so switching the application to the light theme must
 * not turn this panel white. Login, Register, Forgot/Reset password and the
 * admin/callback entries all render this same shell, so their right side can no
 * longer drift apart.
 */
function AuthVisualPanel() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <aside className="auth-visual auth-visual--vortex" aria-hidden="true">
      <HourglassVortex />
      <div className="auth-visual__content">
        <div className="auth-visual__copy">
          <p className="auth-visual__eyebrow">{t('landing.eyebrow')}</p>
          <h1 className="auth-visual__title">{t('builderVisual.authTitle')}</h1>
          <p className="auth-visual__subtitle">{t('builderVisual.authDescription')}</p>
        </div>
        <div className="auth-visual__diagram">
          <BuilderVisual variant="auth" />
        </div>
      </div>
      <div className="auth-visual__foot">
        <p>&copy; {year} {APP_NAME}</p>
      </div>
    </aside>
  )
}

export default AuthVisualPanel
