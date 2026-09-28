import { Link } from 'react-router-dom'
import BrandLogo from '@/components/common/BrandLogo'
import useTranslation from '@/hooks/useTranslation'
import { APP_NAME } from '@/utils/constants'

/**
 * Public footer.
 *
 * Every entry points at a page that exists in this product. No company details,
 * certifications or legal claims are stated, because none are defined.
 */
const COLUMNS = [
  {
    key: 'product',
    links: [
      { key: 'features', to: '#capabilities' },
      { key: 'howItWorks', to: '#workspaces' },
      { key: 'pricing', to: '#pricing' },
    ],
  },
  {
    key: 'account',
    links: [
      { key: 'signIn', to: '/login' },
      { key: 'createAccount', to: '/register' },
      { key: 'qrSignIn', to: '/login/qr' },
    ],
  },
  {
    key: 'support',
    links: [
      { key: 'passwordRecovery', to: '/forgot-password' },
      { key: 'accountSecurity', to: '/security' },
    ],
  },
]

const COLUMN_TITLE_KEYS = {
  product: 'footer.productColumn',
  account: 'footer.accountColumn',
  support: 'footer.supportColumn',
}

const LINK_LABEL_KEYS = {
  features: 'nav.features',
  howItWorks: 'nav.howItWorks',
  pricing: 'nav.pricing',
  signIn: 'nav.signIn',
  createAccount: 'nav.createAccount',
  qrSignIn: 'footer.qrSignIn',
  passwordRecovery: 'footer.passwordRecovery',
  accountSecurity: 'footer.accountSecurity',
}

function PublicFooter() {
  const { t } = useTranslation()

  return (
    <footer className="public-footer">
      <div className="public-footer__inner">
        <div className="public-footer__brand">
          <a className="public-brand public-brand--footer" href="#top" aria-label={`${APP_NAME} home`}>
            <BrandLogo size={30} />
            <span>{APP_NAME}</span>
          </a>
          <p className="public-footer__caption">{t('footer.caption')}</p>
        </div>

        <div className="public-footer__columns">
          {COLUMNS.map((column) => (
            <nav className="public-footer__column" key={column.key} aria-label={t(COLUMN_TITLE_KEYS[column.key])}>
              <h2 className="public-footer__column-title">
                {t(COLUMN_TITLE_KEYS[column.key])}
              </h2>
              <ul>
                {column.links.map((link) => (
                  <li key={link.key}>
                    {link.to.startsWith('#') ? (
                      <a className="public-footer__link" href={link.to} key={link.key}>
                        {t(LINK_LABEL_KEYS[link.key])}
                      </a>
                    ) : (
                      <Link className="public-footer__link" to={link.to} key={link.key}>
                        {t(LINK_LABEL_KEYS[link.key])}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="public-footer__base">
        <span className="public-footer__note">{t('footer.previewNotice')}</span>
        <a className="public-footer__link" href="#top">
          {t('footer.backToTop')}
        </a>
      </div>
    </footer>
  )
}

export default PublicFooter
