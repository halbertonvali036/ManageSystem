import { ArrowUpRight, CreditCard, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import SupportContactCard from '@/components/security/SupportContactCard'
import useTranslation from '@/hooks/useTranslation'
import { BILLING_PATH, SECURITY_PATH } from '@/utils/constants'

/**
 * Support — the way to reach the account team.
 *
 * A page of its own rather than a section of Account & Security, because asking
 * for help is not a step of hardening the account. It gives the sidebar something
 * real to link to, and it keeps the security page about security.
 *
 * Nothing here is fabricated: the form collects a request and hands it to
 * `supportService`, which refuses while no support backend is attached and the
 * card says exactly that instead of producing a ticket number.
 */
function SupportPage() {
  const { t } = useTranslation()

  const related = [
    {
      key: 'security',
      labelKey: 'account.nav.security',
      hintKey: 'accountPolish.securityLinkHint',
      to: SECURITY_PATH,
      icon: ShieldCheck,
    },
    {
      key: 'billing',
      labelKey: 'account.nav.billing',
      hintKey: 'accountPolish.billingLinkHint',
      to: BILLING_PATH,
      icon: CreditCard,
    },
  ]

  return (
    <div className="support-page">
      <p className="page-description">{t('support.pageDescription')}</p>

      <SupportContactCard />

      <section className="support-related" aria-labelledby="support-related-title">
        <h2 id="support-related-title">{t('support.relatedTitle')}</h2>
        <div className="account-profile-links">
          {related.map(({ key, labelKey, hintKey, to, icon: Icon }) => (
            <Link key={key} to={to}>
              <Icon size={22} aria-hidden="true" />
              <span>
                <strong>{t(labelKey)}</strong>
                <small>{t(hintKey)}</small>
              </span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

export default SupportPage