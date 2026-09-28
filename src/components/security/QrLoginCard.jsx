import useAccountCopy from '@/hooks/useAccountCopy'
import useTranslation from '@/hooks/useTranslation'
import { Clock, QrCode, ScanLine, ShieldCheck } from 'lucide-react'
import SecurityNotice from '@/components/security/SecurityNotice'
import SecuritySection from '@/components/security/SecuritySection'

const READINESS_POINTS = [
  {
    icon: Clock,
    title: 'Short-lived pairing token',
    text: 'The backend issues a single-use code with a short expiry. The browser never mints one.',
  },
  {
    icon: ScanLine,
    title: 'Confirmed on your phone',
    text: 'You approve the sign-in in the signed-in app, and the backend matches the two sides.',
  },
  {
    icon: ShieldCheck,
    title: 'Backend-owned exchange',
    text: 'Only the backend hands the approved token to the new session. No trust is placed in this page.',
  },
]

/**
 * QR sign-in — reference card for Account & Security.
 *
 * QR sign-in itself lives in one place: the public `/login/qr` page, which
 * requests the pairing session and renders its status. This card deliberately
 * has no request, refresh or cancel action, so the pairing architecture is not
 * duplicated or forked from the sign-in flow.
 */
function QrLoginCard() {
  const copy = useAccountCopy()
  const { t } = useTranslation()
  return (
    <SecuritySection
      id="qr-login"
      className="qr-login-section"
      eyebrow={t('accountPolish.signIn')}
      title={t('accountPolish.qrSignIn')}
      description={t('accountPolish.approveABrowserSignInFromTheMobileApp')}
      icon={<QrCode size={20} aria-hidden="true" />}
    >
      <ol className="qr-login-section__points">
        {READINESS_POINTS.map(({ icon: Icon, title, text }) => (
          <li className="qr-login-point" key={title}>
            <span className="qr-login-point__icon" aria-hidden="true">
              <Icon size={16} />
            </span>
            <div className="qr-login-point__body">
              <h3 className="qr-login-point__title">{copy(title)}</h3>
              <p className="qr-login-point__text">{copy(text)}</p>
            </div>
          </li>
        ))}
      </ol>

      <SecurityNotice tone="info" title={t('accountPolish.whereItHappens')}>{t('accountPolish.qrSignInIsASignInTimeFlow')}<code>/login/qr</code>{t('accountPolish.ratherThanHereThisCardOnlyDocumentsHowThe')}</SecurityNotice>

      <SecurityNotice tone="pending" title={t('accountPolish.notAvailableYet')}>{t('accountPolish.aUsableCodeNeedsABackendIssuedPairingSession')}</SecurityNotice>
    </SecuritySection>
  )
}

export default QrLoginCard
