import { ArrowUpRight, Bell, CreditCard, LifeBuoy, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '@/components/common/Card'
import useAuth from '@/hooks/useAuth'
import useTranslation from '@/hooks/useTranslation'
import { ROLES } from '@/utils/roles'
import { LOCALE_LABELS } from '@/models/locale'
import {
  ADMIN_NAV_ITEMS,
  ADMIN_PLATFORM_VIEWS,
  BILLING_PATH,
  NOTIFICATIONS_PATH,
  SECURITY_PATH,
  SUPPORT_PATH,
} from '@/utils/constants'

/** Everything the console exposes to an admin: rail sections plus the
    platform-wide Support and Notifications views the overview links to. */
const ADMIN_CONSOLE_AREAS = [...ADMIN_NAV_ITEMS, ...ADMIN_PLATFORM_VIEWS]

/** Reads a session field as trimmed text, or '' when the backend sent nothing
    usable. Session payloads are not guaranteed to be strings. */
const readText = (value) => (typeof value === 'string' ? value.trim() : '')

/** Initials for the identity block. Falls back to a neutral glyph. */
const getInitials = (name) =>
  readText(name)
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

/**
 * The person's own account.
 *
 * One page for both roles: "who am I and what does this account include" is a
 * fact about the signed-in session, not about the product, so admins reach their
 * account here too rather than through a second copy of it in the platform rail.
 *
 * Everything rendered is read from the session the backend established or from
 * the frontend's own navigation model — there is no invented value on this page.
 * Editing is not offered: profile writes need the account API, and this page does
 * not claim a change it cannot persist. The destinations below are the ones that
 * act on this account — each one already lives in the sidebar, so they are offered
 * here as context, not as a second navigation.
 *
 * There is no back action. The page is reached from the profile entry pinned
 * above Logout, and the sidebar stays on screen beside it.
 */
function AccountProfilePage() {
  const { user } = useAuth()
  const { t, locale } = useTranslation()

  const isAdmin = user?.role === ROLES.ADMIN

  const roleKey =
    user?.role === ROLES.ADMIN
      ? 'accountProfile.roleAdmin'
      : user?.role === ROLES.USER
        ? 'accountProfile.roleUser'
        : 'accountProfile.roleUnknown'
  const statusKey =
    user?.status === 'active'
      ? 'accountProfile.statusActive'
      : user?.status === 'inactive'
        ? 'accountProfile.statusInactive'
        : null

  const formatDate = (value, options) => {
    if (!value) {
      return t('accountProfile.notSet')
    }
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return t('accountProfile.notSet')
    }
    return date.toLocaleString(locale, options)
  }

  const dayOptions = { year: 'numeric', month: 'short', day: 'numeric' }
  const dateTimeOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }

  const notSet = t('accountProfile.notSet')
  const displayName = readText(user?.name) || notSet
  const email = readText(user?.email) || notSet
  const accountId = user?.id ?? user?.userId ?? notSet

  /** Personal facts about this person. Absent values read as "Not set". */
  const personalDetails = [
    { key: 'name', labelKey: 'accountProfile.nameLabel', value: displayName },
    { key: 'email', labelKey: 'accountProfile.emailLabel', value: email },
    { key: 'accountId', labelKey: 'accountProfile.accountIdLabel', value: accountId },
    { key: 'memberSince', labelKey: 'accountProfile.memberSinceLabel', value: formatDate(user?.createdAt, dayOptions) },
    { key: 'lastSignIn', labelKey: 'accountProfile.lastSignInLabel', value: formatDate(user?.lastLogin ?? user?.lastLoginAt, dateTimeOptions) },
  ]

  /** Facts about what this account is and how it is presented. */
  const accountDetails = [
    { key: 'role', labelKey: 'accountProfile.roleLabel', value: t(roleKey) },
    { key: 'status', labelKey: 'accountProfile.statusLabel', value: statusKey ? t(statusKey) : notSet },
    { key: 'language', labelKey: 'accountProfile.languageLabel', value: LOCALE_LABELS[locale] ?? notSet },
  ]

  const destinations = [
    { key: 'security', labelKey: 'account.nav.security', hintKey: 'accountPolish.securityLinkHint', to: SECURITY_PATH, icon: Shield },
    { key: 'billing', labelKey: 'account.nav.billing', hintKey: 'accountPolish.billingLinkHint', to: BILLING_PATH, icon: CreditCard },
    { key: 'support', labelKey: 'account.nav.support', hintKey: 'accountProfile.supportLinkHint', to: SUPPORT_PATH, icon: LifeBuoy },
    { key: 'notifications', labelKey: 'account.nav.notifications', hintKey: 'accountProfile.notificationsLinkHint', to: NOTIFICATIONS_PATH, icon: Bell },
  ]

  return (
    <div className="account-page premium-account">
      <p className="page-description">{t('accountProfile.pageDescription')}</p>

      {/* Identity first: who the session belongs to, before any detail about it. */}
      <Card className="profile-identity">
        <span className="account-profile__avatar" aria-hidden="true">
          {getInitials(user?.name)}
        </span>
        <div className="profile-identity__text">
          <p className="profile-identity__name">{displayName}</p>
          <p className="profile-identity__email">{email}</p>
        </div>
        <span className="profile-identity__badges">
          <span className="profile-identity__role">{t(roleKey)}</span>
          {statusKey ? (
            <span className={`status-badge status-badge--${user.status}`}>
              {t(statusKey)}
            </span>
          ) : (
            <span className="status-badge status-badge--unknown">
              {t('accountPolish.statusUnavailable')}
            </span>
          )}
        </span>
      </Card>

      <div className="profile-detail-grid">
        <Card className="profile-detail">
          <header className="profile-summary__heading">
            <h2>{t('accountPolish.personalInformation')}</h2>
          </header>
          <dl className="account-profile__details">
            {personalDetails.map(({ key, labelKey, value }) => (
              <div className="account-profile__row" key={key}>
                <dt>{t(labelKey)}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="profile-detail">
          <header className="profile-summary__heading">
            <h2>{t('accountProfile.accountDetailsTitle')}</h2>
            <span className="status-badge status-badge--unknown">{t('accountPolish.readOnly')}</span>
          </header>
          <dl className="account-profile__details">
            {accountDetails.map(({ key, labelKey, value }) => (
              <div className="account-profile__row" key={key}>
                <dt>{t(labelKey)}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p className="profile-summary__notice workspace-panel-note">
            {t('accountProfile.editNotice')}
          </p>
        </Card>
      </div>

      {/* Admins only: the console areas this role reaches. Read from the same
          model the rail renders, so it cannot claim a destination the sidebar
          does not have — and it is a statement of the frontend surface, not of
          what the backend will let this person do. */}
      {isAdmin ? (
        <Card className="profile-detail profile-access">
          <header className="profile-summary__heading">
            <h2>{t('accountProfile.platformAccessTitle')}</h2>
          </header>
          <ul className="profile-access__list">
            {ADMIN_CONSOLE_AREAS.map(({ key, labelKey }) => (
              <li key={key}>{t(labelKey)}</li>
            ))}
          </ul>
          <p className="profile-summary__notice workspace-panel-note">
            {t('accountProfile.platformAccessHint')}
          </p>
        </Card>
      ) : null}

      <section className="profile-destinations" aria-labelledby="profile-destinations-title">
        <h2 id="profile-destinations-title">{t('accountProfile.destinationsTitle')}</h2>
        <div className="account-profile-links">
          {destinations.map(({ key, labelKey, hintKey, to, icon: Icon }) => (
            <Link key={key} to={to}>
              <Icon size={22} aria-hidden="true" />
              <span><strong>{t(labelKey)}</strong><small>{t(hintKey)}</small></span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

export default AccountProfilePage
