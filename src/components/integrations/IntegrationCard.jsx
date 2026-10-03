import { Link } from 'react-router-dom'
import { ArrowRight, Plug, SlidersHorizontal, Unplug } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import {
  INTEGRATION_CATEGORY_LABEL_KEYS,
  INTEGRATION_STATUS_LABEL_KEYS,
  INTEGRATION_STATUS_VARIANTS,
} from '@/models/integration'
import {
  WORKSPACE_INTEGRATION_PATH,
  WORKSPACE_MODULE_PATHS,
} from '@/utils/constants'

/**
 * One integration card.
 *
 * The card describes an external service, it does not connect one: `modulePath`
 * points at the product module the service feeds (billing, notifications, media,
 * security), so nothing here duplicates a feature that already exists.
 *
 * Actions are requests, not local toggles. The card is only re-rendered from
 * whatever the backend confirms, so a refused write leaves it exactly as it was.
 */
function IntegrationCard({
  integration,
  workspaceId,
  isBusy,
  onConnect,
  onDisconnect,
  onConfigure,
}) {
  const { t } = useTranslation()

  const name = t(integration.nameKey)
  const modulePath = WORKSPACE_MODULE_PATHS[integration.modulePath]?.(workspaceId)
  const variant = INTEGRATION_STATUS_VARIANTS[integration.status]

  return (
    <li className="int-card">
      <div className="int-card__head">
        <h3 className="int-card__name">
          <Link
            className="int-card__link"
            to={WORKSPACE_INTEGRATION_PATH(workspaceId, integration.id)}
          >
            {name}
          </Link>
        </h3>
        <span className={`int-chip int-chip--${variant}`}>
          {t(INTEGRATION_STATUS_LABEL_KEYS[integration.status])}
        </span>
      </div>

      <p className="int-card__category">
        {t(INTEGRATION_CATEGORY_LABEL_KEYS[integration.category])}
      </p>

      <p className="int-card__description">{t(integration.descriptionKey)}</p>

      {integration.requiresBackend ? (
        <p className="int-card__notice">
          {t('workspaceIntegrations.card.backendNotice')}
        </p>
      ) : null}

      <div className="int-card__actions">
        {integration.connected ? (
          <button
            type="button"
            className="btn btn--ghost int-card__action"
            onClick={() => onDisconnect(integration)}
            disabled={isBusy}
          >
            <Unplug size={15} aria-hidden="true" />
            {t('workspaceIntegrations.card.disconnectCta')}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn--primary int-card__action"
            onClick={() => onConnect(integration)}
            disabled={isBusy}
          >
            <Plug size={15} aria-hidden="true" />
            {t('workspaceIntegrations.card.connectCta')}
          </button>
        )}

        <button
          type="button"
          className="btn btn--outline int-card__action"
          onClick={() => onConfigure(integration)}
          disabled={isBusy}
        >
          <SlidersHorizontal size={15} aria-hidden="true" />
          {t('workspaceIntegrations.card.configureCta')}
        </button>

        {modulePath ? (
          <Link className="btn btn--ghost int-card__action int-card__module" to={modulePath}>
            {t('workspaceIntegrations.card.openModuleCta')}
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        ) : null}
      </div>

      {integration.connected ? null : (
        <p className="int-card__hint">{t('workspaceIntegrations.card.offHint')}</p>
      )}
    </li>
  )
}

export default IntegrationCard
