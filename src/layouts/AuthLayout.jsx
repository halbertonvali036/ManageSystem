import AmbientVisual from '@/components/common/AmbientVisual'
import BuilderVisual from '@/components/common/BuilderVisual'
import { Link, Outlet } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import BrandLogo from '@/components/common/BrandLogo'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'
import ThemeToggle from '@/components/common/ThemeToggle'
import useTranslation from '@/hooks/useTranslation'
import { APP_NAME } from '@/utils/constants'

function AuthLayout() {
  const year = new Date().getFullYear()
  const { t } = useTranslation()

  return (
    <div className="auth-layout">
      <main className="auth-form">
        <div className="auth-form__inner">
          <div className="auth-form__top">
            <Link to="/" className="auth-form__brand" aria-label={`${APP_NAME} home`}>
              <BrandLogo size={36} />
              <span>{APP_NAME}</span>
            </Link>
            <LanguageSwitcher variant="compact" />
            <ThemeToggle />
          </div>

          <Outlet />

          <Link to="/" className="auth-form__helper">
            <ArrowLeft size={14} aria-hidden="true" />
            {t('auth.login.backToSite')}
          </Link>
        </div>
      </main>

      <aside className="auth-visual">
          <AmbientVisual />
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
    </div>
  )
}

export default AuthLayout
