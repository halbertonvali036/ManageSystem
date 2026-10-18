import AuthVisualPanel from '@/components/auth/AuthVisualPanel'
import { Link, Outlet } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import BrandLogo from '@/components/common/BrandLogo'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'
import ThemeToggle from '@/components/common/ThemeToggle'
import useTranslation from '@/hooks/useTranslation'
import { APP_NAME } from '@/utils/constants'

function AuthLayout() {
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

      <AuthVisualPanel />
    </div>
  )
}

export default AuthLayout
