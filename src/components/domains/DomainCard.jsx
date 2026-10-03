import { Link } from 'react-router-dom'
import { Globe, RefreshCw, ShieldCheck, Star, Trash2 } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import {
  DOMAIN_STATUS,
  DOMAIN_STATUS_LABEL_KEYS,
  DOMAIN_STATUS_VARIANTS,
  DOMAIN_TYPE,
  DOMAIN_TYPE_LABEL_KEYS,
  DOMAIN_TYPE_VARIANTS,
  SSL_STATUS,
  SSL_STATUS_LABEL_KEYS,
  SSL_STATUS_VARIANTS,
  getDomainActions,
} from '@/models/domain'
import { WORKSPACE_DOMAIN_PATH } from '@/utils/constants'

/**
 * One domain card.
 *
 * The card reports two independent things the backend owns: whether the name
 * resolves to this workspace, and whether a certificate has been issued. Neither is
 * inferred from the other — a connected domain can still be waiting on SSL, and a
 * domain with an active certificate can still be mid-verification.
 *
 * Every action is a request. The card renders only what the backend confirmed, so a
 * refused verify leaves the state untouched rather than flashing to "connected".
 */
function DomainCard({ domain, workspaceId, isBusy, onVerify, onSetPrimary, onRemove }) {
  const { t } = useTranslation()

  const actions = getDomainActions(domain)
  const isPlatform = domain.type === DOMAIN_TYPE.PLATFORM

  return (
    <li className="dom-card">
      <div className="dom-card__head">
        <h3 className="dom-card__name">
          <Globe size={17} aria-hidden="true" />
          <Link
            className="dom-card__link"
            to={WORKSPACE_DOMAIN_PATH(workspaceId, domain.id)}
          >
            {domain.hostname}
          </Link>
        </h3>
        {domain.isPrimary ? (
          <span className="dom-chip dom-chip--primary">
            <Star size={13} aria-hidden="true" />
            {t('workspaceDomains.card.primaryBadge')}
          </span>
        ) : null}
      </div>

      <div className="dom-card__badges">
        <span className={`dom-chip dom-chip--${DOMAIN_TYPE_VARIANTS[domain.type]}`}>
          {t(DOMAIN_TYPE_LABEL_KEYS[domain.type])}
        </span>
        <span className={`dom-chip dom-chip--${DOMAIN_STATUS_VARIANTS[domain.status]}`}>
          {t(DOMAIN_STATUS_LABEL_KEYS[domain.status])}
        </span>
        <span className={`dom-chip dom-chip--ssl-${SSL_STATUS_VARIANTS[domain.sslStatus]}`}>
          <ShieldCheck size={13} aria-hidden="true" />
          {t(SSL_STATUS_LABEL_KEYS[domain.sslStatus])}
        </span>
      </div>

      {domain.status === DOMAIN_STATUS.CONNECTED && domain.sslStatus === SSL_STATUS.PENDING ? (
        <p className="dom-card__notice">{t('workspaceDomains.card.sslPendingNotice')}</p>
      ) : null}

      {domain.verificationMessage ? (
        <p className="dom-card__message">{domain.verificationMessage}</p>
      ) : null}

      <div className="dom-card__actions">
        {actions.canVerify ? (
          <button
            type="button"
            className="btn btn--primary dom-card__action"
            onClick={() => onVerify(domain)}
            disabled={isBusy}
          >
            <RefreshCw size={15} aria-hidden="true" />
            {t('workspaceDomains.card.verifyCta')}
          </button>
        ) : null}

        {actions.canSetPrimary ? (
          <button
            type="button"
            className="btn btn--outline dom-card__action"
            onClick={() => onSetPrimary(domain)}
            disabled={isBusy}
          >
            <Star size={15} aria-hidden="true" />
            {t('workspaceDomains.card.setPrimaryCta')}
          </button>
        ) : null}

        {actions.canRemove ? (
          <button
            type="button"
            className="btn btn--ghost dom-card__action"
            onClick={() => onRemove(domain)}
            disabled={isBusy}
          >
            <Trash2 size={15} aria-hidden="true" />
            {t('workspaceDomains.card.removeCta')}
          </button>
        ) : null}
      </div>

      {isPlatform ? (
        <p className="dom-card__hint">{t('workspaceDomains.card.platformHint')}</p>
      ) : null}
    </li>
  )
}

export default DomainCard
