import { User } from 'lucide-react'
import Card from '@/components/common/Card'
import useAuth from '@/hooks/useAuth'
import useTranslation from '@/hooks/useTranslation'

/**
 * Account profile.
 *
 * The account feature set already contains Profile, so this route gives the
 * website-builder navigation a real destination for it. It renders the identity
 * the current session actually holds. Editing is not offered here: profile
 * writes need the account API, and this phase does not claim a change it cannot
 * persist. Security, billing and notifications keep their existing pages.
 */
function AccountProfilePage() {
  const { user } = useAuth()
  const { t } = useTranslation()

  const details = [
    { key: 'name', labelKey: 'accountProfile.nameLabel' },
    { key: 'email', labelKey: 'accountProfile.emailLabel' },
  ]

  return (
    <div className="account-page">
      <p className="page-description">{t('accountProfile.pageDescription')}</p>

      <Card>
        <div className="account-profile">
          <span className="account-profile__avatar" aria-hidden="true">
            <User size={24} />
          </span>

          <dl className="account-profile__details">
            {details.map(({ key, labelKey }) => (
              <div className="account-profile__row" key={key}>
                <dt>{t(labelKey)}</dt>
                <dd>{user?.[key] || t('accountProfile.notSet')}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="workspace-panel-note workspace-panel-note--muted">
          {t('accountProfile.editNotice')}
        </p>
      </Card>
    </div>
  )
}

export default AccountProfilePage
