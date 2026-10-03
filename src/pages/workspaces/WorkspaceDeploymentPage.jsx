import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CircleSlash, Globe, RotateCcw, Square } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import useWorkspace from '@/hooks/useWorkspace'
import useWorkspaceDeployment from '@/hooks/useWorkspaceDeployment'
import deploymentService from '@/services/deploymentService'
import { BackendNotConnectedError } from '@/services/httpClient'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import WorkspaceBreadcrumb from '@/components/workspaces/WorkspaceBreadcrumb'
import WorkspaceSectionNav from '@/components/workspaces/WorkspaceSectionNav'
import DeploymentTimeline from '@/components/deployments/DeploymentTimeline'
import {
  DEPLOYMENT_STATUS,
  DEPLOYMENT_STATUS_LABEL_KEYS,
  DEPLOYMENT_STATUS_VARIANTS,
  getDeploymentActions,
  isPendingDeployment,
} from '@/models/deployment'
import { WORKSPACE_DEPLOYMENTS_PATH } from '@/utils/constants'

/**
 * One deployment — its record fields, the stages it actually reached, and the
 * actions that make sense for it.
 *
 * A build the backend reports as running is shown as running. There is no progress
 * bar that fills on a timer and no optimistic "live" after a deploy request, because
 * the difference between a requested build and a served one is the entire point of
 * this page.
 */
function WorkspaceDeploymentPage() {
  const { workspaceId, deploymentId } = useParams()
  const { t } = useTranslation()
  const { workspace } = useWorkspace(workspaceId)
  const { deployment, isLoading, error, refetch } = useWorkspaceDeployment(
    workspaceId,
    deploymentId
  )

  const [isBusy, setIsBusy] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [actionError, setActionError] = useState(null)

  const runAction = async (action, { closeDialog = false } = {}) => {
    setIsBusy(true)
    setActionError(null)
    try {
      await action()
      if (closeDialog) setConfirmAction(null)
      refetch()
    } catch (err) {
      setActionError(
        err instanceof BackendNotConnectedError
          ? t('workspaceDeployments.unavailableNotice')
          : t('workspaceDeployments.actionFailed')
      )
    } finally {
      setIsBusy(false)
    }
  }

  if (isLoading) {
    return (
      <div className="workspaces-page dep-page">
        <WorkspaceSectionNav workspaceId={workspaceId} />
        <Card>
          <div className="page-status">
            <span className="spinner" aria-hidden="true" />
            {t('workspaceDeployments.loading')}
          </div>
        </Card>
      </div>
    )
  }

  if (error || !deployment) {
    return (
      <div className="workspaces-page dep-page">
        <WorkspaceSectionNav workspaceId={workspaceId} />
        <Card>
          <div className="table-state table-state--error">
            <h2 className="table-state__title">
              {t('workspaceDeployments.notFoundTitle')}
            </h2>
            <p className="table-state__text">
              {t('workspaceDeployments.notFoundText')}
            </p>
            <Link
              className="btn btn--primary"
              to={WORKSPACE_DEPLOYMENTS_PATH(workspaceId)}
            >
              {t('workspaceDeployments.backToList')}
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  // The list view passes the currently-live row so the card can hide "rollback" on
  // the version that is already serving. This page has only its own record, so the
  // guard falls back to offering rollback for any finished build.
  const actions = getDeploymentActions(deployment)
  const isRunning = isPendingDeployment(deployment.status)

  return (
    <div className="workspaces-page dep-page">
      <WorkspaceBreadcrumb workspace={workspace} section="deployments" />
      <WorkspaceSectionNav workspaceId={workspaceId} />

      <header className="workspaces-page__head">
        <div className="workspaces-page__headline">
          <Link className="dep-page__back" to={WORKSPACE_DEPLOYMENTS_PATH(workspaceId)}>
            <ArrowLeft size={16} aria-hidden="true" />
            {t('workspaceDeployments.backToList')}
          </Link>
          <h1 className="workspaces-page__title">
            {deployment.version ?? t('workspaceDeployments.card.unversioned')}
          </h1>
          <span className={`dep-chip dep-chip--${DEPLOYMENT_STATUS_VARIANTS[deployment.status]}`}>
            {isRunning ? <span className="spinner" aria-hidden="true" /> : null}
            {t(DEPLOYMENT_STATUS_LABEL_KEYS[deployment.status])}
          </span>
        </div>

        <div className="dep-page__actions">
          {actions.canStop ? (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => runAction(() => deploymentService.stopDeployment(deployment.id, workspaceId))}
              disabled={isBusy}
            >
              <Square size={15} aria-hidden="true" />
              {t('workspaceDeployments.card.stopCta')}
            </button>
          ) : null}

          {actions.canRedeploy ? (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setConfirmAction('redeploy')}
              disabled={isBusy}
            >
              <RotateCcw size={15} aria-hidden="true" />
              {t('workspaceDeployments.card.redeployCta')}
            </button>
          ) : null}

          {actions.canRollback ? (
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => setConfirmAction('rollback')}
              disabled={isBusy}
            >
              <CircleSlash size={15} aria-hidden="true" />
              {t('workspaceDeployments.card.rollbackCta')}
            </button>
          ) : null}
        </div>
      </header>

      {actionError ? (
        <div className="form-notice form-notice--error" role="alert">
          {actionError}
        </div>
      ) : null}

      {deployment.status === DEPLOYMENT_STATUS.FAILED ? (
        <div className="form-notice form-notice--error" role="alert">
          {deployment.logMessage ?? t('workspaceDeployments.failedNotice')}
        </div>
      ) : null}

      <Card>
        <h2 className="card__title">{t('workspaceDeployments.timeline.title')}</h2>
        <DeploymentTimeline deployment={deployment} />
        {isRunning ? (
          <p className="form__hint">{t('workspaceDeployments.timeline.runningHint')}</p>
        ) : null}
      </Card>

      <Card>
        <h2 className="card__title">{t('workspaceDeployments.detail.title')}</h2>
        <dl className="dep-detail__grid">
          <div className="dep-detail__row">
            <dt>{t('workspaceDeployments.detail.id')}</dt>
            <dd>
              <code>{deployment.id}</code>
            </dd>
          </div>
          <div className="dep-detail__row">
            <dt>{t('workspaceDeployments.detail.siteId')}</dt>
            <dd>
              <code>{deployment.siteId ?? '—'}</code>
            </dd>
          </div>
          <div className="dep-detail__row">
            <dt>{t('workspaceDeployments.detail.status')}</dt>
            <dd>{t(DEPLOYMENT_STATUS_LABEL_KEYS[deployment.status])}</dd>
          </div>
          <div className="dep-detail__row">
            <dt>{t('workspaceDeployments.detail.version')}</dt>
            <dd>
              <code>{deployment.version ?? '—'}</code>
            </dd>
          </div>
          <div className="dep-detail__row">
            <dt>{t('workspaceDeployments.detail.createdAt')}</dt>
            <dd>
              <time dateTime={deployment.createdAt ?? undefined}>
                {deployment.createdAt ?? '—'}
              </time>
            </dd>
          </div>
          <div className="dep-detail__row">
            <dt>{t('workspaceDeployments.detail.finishedAt')}</dt>
            <dd>
              <time dateTime={deployment.finishedAt ?? undefined}>
                {deployment.finishedAt ?? '—'}
              </time>
            </dd>
          </div>
          <div className="dep-detail__row">
            <dt>{t('workspaceDeployments.detail.publishedUrl')}</dt>
            <dd>
              {deployment.publishedUrl ? (
                <a
                  className="dep-card__url"
                  href={deployment.publishedUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Globe size={14} aria-hidden="true" />
                  {deployment.publishedUrl}
                </a>
              ) : (
                '—'
              )}
            </dd>
          </div>
          {deployment.logMessage ? (
            <div className="dep-detail__row">
              <dt>{t('workspaceDeployments.detail.log')}</dt>
              <dd>{deployment.logMessage}</dd>
            </div>
          ) : null}
        </dl>
      </Card>

      <ConfirmDialog
        open={Boolean(confirmAction)}
        title={
          confirmAction === 'rollback'
            ? t('workspaceDeployments.confirm.rollbackTitle')
            : t('workspaceDeployments.confirm.redeployTitle')
        }
        message={
          confirmAction === 'rollback'
            ? t('workspaceDeployments.confirm.rollbackText')
            : t('workspaceDeployments.confirm.redeployText')
        }
        confirmLabel={
          confirmAction === 'rollback'
            ? t('workspaceDeployments.card.rollbackCta')
            : t('workspaceDeployments.card.redeployCta')
        }
        confirmingLabel={t('workspaceDeployments.confirm.working')}
        cancelLabel={t('workspaceDeployments.form.cancel')}
        isConfirming={isBusy}
        error={actionError}
        onConfirm={() =>
          runAction(
            () =>
              confirmAction === 'rollback'
                ? deploymentService.rollbackDeployment(deployment.id, workspaceId)
                : deploymentService.redeploy(deployment.id, workspaceId),
            { closeDialog: true }
          )
        }
        onCancel={() => {
          setConfirmAction(null)
          setActionError(null)
        }}
      />
    </div>
  )
}

export default WorkspaceDeploymentPage
