import { useCallback } from 'react'
import { ArrowUpRight, Bell, CreditCard, LifeBuoy, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '@/components/common/Card'
import AvatarUploader from '@/components/profile/AvatarUploader'
import ProfileFormCard from '@/components/profile/ProfileFormCard'
import useAuth from '@/hooks/useAuth'
import useProfile from '@/hooks/useProfile'
import useTranslation from '@/hooks/useTranslation'
import { ROLES } from '@/utils/roles'
import { LOCALE_LABELS } from '@/models/locale'
import { getOptionalProfileFields, getProfileInitials, readProfileText } from '@/models/profile'
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

/**
 * The person's own account.
 *
 * One page for both roles: "who am I and what does this account include" is a
 * fact about the signed-in session, not about the product, so admins reach their
 * account here too rather than through a second copy of it in the platform rail.
 *
 * The page splits cleanly into what the person may edit and what only the
 * backend owns. The display name and the profile photo are editable; the email,
 * role, status, identifiers and dates are read-only because the session is their
 * only source. Every value rendered is read from the session the backend
 * established — nothing here is invented, and no write is reported as done
 * unless the account service accepted it.
 */
function AccountProfilePage() {
  const { user, updateUser } = useAuth()
  const { t, locale } = useTranslation()

  const handleSaved = useCallback(
    (confirmed) => {
      updateUser(confirmed)
    },
    [updateUser],
  )

  const profile = useProfile(user, { onSaved: handleSaved })
  const optionalFields = getOptionalProfileFields(user)

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
  const displayName = readProfileText(user?.name) || notSet
  const email = readProfileText(user?.email) || notSet
  const accountId = user?.id ?? user?.userId ?? notSet

  /** Server-owned facts about this person. Absent values read as "Not set". */
  const personalDetails = [
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
    <div className="account-page premium-account profile-page">
      <p className="page-description">{t('accountProfile.pageDescription')}</p>

      {/* Identity and the one visual field the person owns, together at the
          top so the account reads as a person before it reads as a form. */}
      <Card className="profile-identity">
        <AvatarUploader
          url={profile.avatarUrl}
          initials={getProfileInitials(user?.name)}
          name={displayName}
          fileName={profile.avatarFileName}
          isLocalPreview={profile.isAvatarLocalPreview}
          errorKey={profile.avatarErrorKey}
          canRemove={Boolean(profile.avatarUrl) || profile.hasAvatarChange}
          disabled={profile.isSaving}
          persistenceAvailable={profile.persistenceAvailable}
          onSelect={profile.selectAvatarFile}
          onRemove={profile.removePhoto}
        />

        <div className="profile-identity__text">
          <p className="profile-identity__name">{displayName}</p>
          <p className="profile-identity__email">{email}</p>
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
        </div>
      </Card>

      <ProfileFormCard
        draft={profile.draft}
        optionalFields={optionalFields}
        displayNameErrorKey={profile.displayNameErrorKey}
        dirty={profile.dirty}
        canSave={profile.canSave}
        isSaving={profile.isSaving}
        isSaved={profile.isSaved}
        saveError={profile.saveError}
        isSaveUnavailable={profile.isSaveUnavailable}
        persistenceAvailable={profile.persistenceAvailable}
        onChange={profile.setField}
        onSave={profile.save}
        onReset={profile.reset}
      />

      <div className="profile-detail-grid">
        <Card className="profile-detail">
          <header className="profile-summary__heading">
            <h2>{t('accountPolish.personalInformation')}</h2>
            <span className="status-badge status-badge--unknown">{t('accountPolish.readOnly')}</span>
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
