import { Link } from 'react-router-dom'
import { ArrowRight, Power, Settings2 } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import {
  CAPABILITY_STATUS_LABEL_KEYS,
  CAPABILITY_STATUS_VARIANTS,
} from '@/models/capability'
import {
  WORKSPACE_CAPABILITY_PATH,
  WORKSPACE_MODULE_PATHS,
} from '@/utils/constants'

/**
 * One capability card.
 *
 * The card describes a module, it does not re-implement one: `modulePath` points
 * at the product module that already exists (the forms builder, the database
 * section, billing, …), so enabling a capability never duplicates logic.
 *
 * Actions are requests, not local toggles. The card is only re-rendered from
 * whatever the backend confirms, so a refused write leaves it exactly as it was.
 */
function CapabilityCard({ capability, workspaceId, isBusy, onToggle, onConfigure }) {
  const { t } = useTranslation()

  const name = t(capability.nameKey)
  const modulePath = WORKSPACE_MODULE_PATHS[capability.modulePath]?.(workspaceId)
  const variant = CAPABILITY_STATUS_VARIANTS[capability.status]

  return (
    <li className="cap-card">
      <div className="cap-card__head">
        <h3 className="cap-card__name">
          <Link
            className="cap-card__link"
            to={WORKSPACE_CAPABILITY_PATH(workspaceId, capability.id)}
          >
            {name}
          </Link>
        </h3>
        <span className={`cap-chip cap-chip--${variant}`}>
          {t(CAPABILITY_STATUS_LABEL_KEYS[capability.status])}
        </span>
      </div>

      <p className="cap-card__description">{t(capability.descriptionKey)}</p>

      {capability.requiresIntegration ? (
        <p className="cap-card__notice">{t('workspaceCapabilities.card.integrationNotice')}</p>
      ) : null}

      <div className="cap-card__actions">
        {capability.enabled ? (
          <button
            type="button"
            className="btn btn--ghost cap-card__action"
            onClick={() => onToggle(capability, false)}
            disabled={isBusy}
          >
            <Power size={15} aria-hidden="true" />
            {t('workspaceCapabilities.card.disableCta')}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn--primary cap-card__action"
            onClick={() => onToggle(capability, true)}
            disabled={isBusy}
          >
            <Power size={15} aria-hidden="true" />
            {t('workspaceCapabilities.card.enableCta')}
          </button>
        )}

        <button
          type="button"
          className="btn btn--outline cap-card__action"
          onClick={() => onConfigure(capability)}
          disabled={isBusy}
        >
          <Settings2 size={15} aria-hidden="true" />
          {t('workspaceCapabilities.card.configureCta')}
        </button>

        {modulePath ? (
          <Link className="btn btn--ghost cap-card__action cap-card__module" to={modulePath}>
            {t('workspaceCapabilities.card.openModuleCta')}
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        ) : null}
      </div>

      {capability.enabled ? null : (
        <p className="cap-card__hint">{t('workspaceCapabilities.card.offHint')}</p>
      )}
    </li>
  )
}

export default CapabilityCard
