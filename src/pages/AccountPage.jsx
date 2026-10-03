import { Link } from 'react-router-dom'
import { ArrowRight, Bell, CreditCard, LifeBuoy, ShieldCheck, User } from 'lucide-react'
import useAuth from '@/hooks/useAuth'
import useTranslation from '@/hooks/useTranslation'
import {
  BILLING_PATH,
  NOTIFICATIONS_PATH,
  PROFILE_PATH,
  SECURITY_PATH,
  SUPPORT_PATH,
} from '@/utils/constants'

/**
 * Account hub.
 *
 * A thin index over the account destinations that already exist, in the same
 * order as the sidebar's account group. It adds no behaviour and no section of
 * its own — Support sits here beside the others rather than inside Account &
 * Security, because reaching the account team is not a security step.
 */
const ACCOUNT_SECTIONS = [
  { key: 'profile', labelKey: 'account.sections.profile', textKey: 'account.sections.profileText', to: PROFILE_PATH, icon: User },
  { key: 'security', labelKey: 'account.sections.security', textKey: 'account.sections.securityText', to: SECURITY_PATH, icon: ShieldCheck },
  { key: 'billing', labelKey: 'account.sections.billing', textKey: 'account.sections.billingText', to: BILLING_PATH, icon: CreditCard },
  { key: 'support', labelKey: 'account.sections.support', textKey: 'account.sections.supportText', to: SUPPORT_PATH, icon: LifeBuoy },
  { key: 'notifications', labelKey: 'account.sections.notifications', textKey: 'account.sections.notificationsText', to: NOTIFICATIONS_PATH, icon: Bell },
]

function AccountPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <div className="account-page">
      <p className="page-description">{t('account.pageDescription')}</p>

      {user?.email ? (
        <p className="account-page__identity">{user.email}</p>
      ) : null}

      <ul className="account-sections">
        {ACCOUNT_SECTIONS.map(({ key, labelKey, textKey, to, icon: Icon }) => (
          <li className="account-section" key={key}>
            <Link to={to} className="account-section__link">
              <span className="account-section__icon" aria-hidden="true">
                <Icon size={18} />
              </span>
              <span className="account-section__copy">
                <span className="account-section__title">{t(labelKey)}</span>
                <span className="account-section__text">{t(textKey)}</span>
              </span>
              <ArrowRight className="account-section__arrow" size={16} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AccountPage
