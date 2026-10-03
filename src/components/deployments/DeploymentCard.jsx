import { Link } from 'react-router-dom'
import { CircleSlash, Globe, RotateCcw, Square } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import {
  DEPLOYMENT_STATUS_LABEL_KEYS,
  DEPLOYMENT_STATUS_VARIANTS,
  getDeploymentActions,
  isPendingDeployment,
} from '@/models/deployment'
import { WORKSPACE_DEPLOYMENT_PATH } from '@/utils/constants'

/**
 * One deployment in the history list.
 *
 * The published URL is shown only when the backend sent one, and always as a real
 * link. It is never assembled from a site slug: a URL that looks right and 404s is
 * worse than no URL, because it reads as a successful deploy.
 */
function DeploymentCard({
  deployment,
  workspaceId,
  latestLive,
  isBusy,
  onStop,
  onRedeploy,
  onRollback,
}) {
  const { t } = useTranslation()

  const actions = getDeploymentActions(deployment, { latestLive })
  const isRunning = isPendingDeployment(deployment.status)

  return (
    <li className="dep-card">
      <div className="dep-card__head">
        <h3 className="dep-card__title">
          <Link
            className="dep-card__link"
            to={WORKSPACE_DEPLOYMENT_PATH(workspaceId, deployment.id)}
          >
            {deployment.version ?? t('workspaceDeployments.card.unversioned')}
          </Link>
        </h3>
        <span className={`dep-chip dep-chip--${DEPLOYMENT_STATUS_VARIANTS[deployment.status]}`}>
          {isRunning ? <span className="spinner" aria-hidden="true" /> : null}
          {t(DEPLOYMENT_STATUS_LABEL_KEYS[deployment.status])}
        </span>
      </div>

      <p className="dep-card__meta">
        <span>{t('workspaceDeployments.card.siteLabel')}</span>
        <code>{deployment.siteId ?? '—'}</code>
      </p>

      {deployment.createdAt ? (
        <p className="dep-card__meta">
          <span>{t('workspaceDeployments.card.createdLabel')}</span>
          <time dateTime={deployment.createdAt}>{deployment.createdAt}</time>
        </p>
      ) : null}

      {deployment.publishedUrl ? (
        <p className="dep-card__meta">
          <span>{t('workspaceDeployments.card.urlLabel')}</span>
          <a
            className="dep-card__url"
            href={deployment.publishedUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            <Globe size={14} aria-hidden="true" />
            {deployment.publishedUrl}
          </a>
        </p>
      ) : null}

      {deployment.logMessage ? (
        <p className="dep-card__log">{deployment.logMessage}</p>
      ) : null}

      <div className="dep-card__actions">
        {actions.canStop ? (
          <button
            type="button"
            className="btn btn--ghost dep-card__action"
            onClick={() => onStop(deployment)}
            disabled={isBusy}
          >
            <Square size={14} aria-hidden="true" />
            {t('workspaceDeployments.card.stopCta')}
          </button>
        ) : null}

        {actions.canRedeploy ? (
          <button
            type="button"
            className="btn btn--primary dep-card__action"
            onClick={() => onRedeploy(deployment)}
            disabled={isBusy}
          >
            <RotateCcw size={14} aria-hidden="true" />
            {t('workspaceDeployments.card.redeployCta')}
          </button>
        ) : null}

        {actions.canRollback ? (
          <button
            type="button"
            className="btn btn--outline dep-card__action"
            onClick={() => onRollback(deployment)}
            disabled={isBusy}
          >
            <CircleSlash size={14} aria-hidden="true" />
            {t('workspaceDeployments.card.rollbackCta')}
          </button>
        ) : null}

        {!actions.canStop &&
        !actions.canRedeploy &&
        !actions.canRollback ? (
          <p className="dep-card__hint">{t('workspaceDeployments.card.draftHint')}</p>
        ) : null}
      </div>
    </li>
  )
}

export default DeploymentCard
