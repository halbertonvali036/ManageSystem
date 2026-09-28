import { Link } from 'react-router-dom'
import { Home, Layers, Tag } from 'lucide-react'
import BrandLogo from '@/components/common/BrandLogo'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'
import ThemeToggle from '@/components/common/ThemeToggle'
import useTranslation from '@/hooks/useTranslation'
import { APP_NAME } from '@/utils/constants'

/** Public header: in-page navigation, language, theme, sign in and registration only. */
function PublicHeader() {
  const { t } = useTranslation()

  return (
    <header className="public-header">
      <div className="public-header__inner">
        <a className="public-brand" href="#top" aria-label={`${APP_NAME} home`}>
          <BrandLogo size={36} />
          <span>{APP_NAME}</span>
        </a>

        <nav className="public-nav" aria-label="Main navigation">
          <div className="public-nav__links">
            <a className="public-nav__link" href="#top" aria-current="page">
              <Home size={15} aria-hidden="true" />
              <span>{t('nav.home')}</span>
            </a>
            <a className="public-nav__link" href="#workspaces">
              <Layers size={15} aria-hidden="true" />
              <span>{t('nav.howItWorks')}</span>
            </a>
            <a className="public-nav__link" href="#capabilities">
              <Layers size={15} aria-hidden="true" />
              <span>{t('nav.features')}</span>
            </a>
            <a className="public-nav__link" href="#pricing">
              <Tag size={15} aria-hidden="true" />
              <span>{t('nav.pricing')}</span>
            </a>
          </div>

          <LanguageSwitcher variant="on-dark" />
          <ThemeToggle />

          <Link className="public-nav__register" to="/register">
            {t('nav.createAccount')}
          </Link>
          <Link className="public-nav__sign-in" to="/login">
            {t('nav.signIn')}
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default PublicHeader
