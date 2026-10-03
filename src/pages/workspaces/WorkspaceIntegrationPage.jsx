import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Cable, ExternalLink, Plug, SlidersHorizontal, Unplug } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import useWorkspace from '@/hooks/useWorkspace'
import useWorkspaceIntegration from '@/hooks/useWorkspaceIntegration'
import integrationService from '@/services/integrationService'
import { BackendNotConnectedError } from '@/services/httpClient'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import WorkspaceBreadcrumb from '@/components/workspaces/WorkspaceBreadcrumb'
import WorkspaceSectionNav from '@/components/workspaces/WorkspaceSectionNav'
import IntegrationConfigForm from '@/components/integrations/IntegrationConfigForm'
import {
  getMissingConfigFields,
  INTEGRATION_CATEGORY_LABEL_KEYS,
  INTEGRATION_CONFIG_TYPE,
  INTEGRATION_STATUS_LABEL_KEYS,
  INTEGRATION_STATUS_VARIANTS,
} from '@/models/integration'
import {
  WORKSPACE_INTEGRATIONS_PATH,
  WORKSPACE_MODULE_PATHS,
} from '@/utils/constants'

/**
 * Integration detail — connect, configure and disconnect one service.
 *
 * The view is driven by the catalog: name, status, category, the module it feeds
 * and the config fields all come from `models/integration.js`. Connect and save are
 * requests; afterwards the page re-reads the service, so it shows what the backend
 * stored rather than what the form held.
 *
 * No secret is ever persisted here. A stored secret is shown as a marker only, and
 * nothing is written to localStorage or sessionStorage.
 */
function WorkspaceIntegrationPage() {
  const { workspaceId, integrationId } = useParams()
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()
  const { workspace } = useWorkspace(workspaceId)

  const { integration, isLoading, error, refetch } = useWorkspaceIntegration(
    workspaceId,
    integrationId
  )

  // "Configure" and "Connect" open the same form; only the submit label differs.
  const wantsConnect = searchParams.get('action') === 'connect'

  // The requested action is the initial value. Navigating from the catalog already
  // remounts this page, so the form never has to be re-synced by an effect.
  const [isEditing, setIsEditing] = useState(wantsConnect)
  const [isBusy, setIsBusy] = useState(false)
  const [isDisconnectOpen, setIsDisconnectOpen] = useState(false)
  const [actionError, setActionError] = useState(null)

  const integrationsPath = WORKSPACE_INTEGRATIONS_PATH(workspaceId)
  const modulePath = integration
    ? WORKSPACE_MODULE_PATHS[integration.modulePath]?.(workspaceId)
    : null

  const runAction = async (action) => {
    setIsBusy(true)
    setActionError(null)
    try {
      await action()
      setIsDisconnectOpen(false)
      setIsEditing(false)
      refetch()
    } catch (err) {
      setActionError(
        err instanceof BackendNotConnectedError
          ? t('workspaceIntegrations.unavailableNotice')
          : t('workspaceIntegrations.actionFailed')
      )
    } finally {
      setIsBusy(false)
    }
  }

  // The form hands up raw inputs; the service validates and sends them, so there
  // is a single authority on what is valid.
  const handleSubmit = (inputs) =>
    runAction(() =>
      integration.connected
        ? integrationService.updateIntegrationConfig(integrationId, workspaceId, inputs)
        : integrationService.connectIntegration(integrationId, workspaceId, inputs)
    )

  if (isLoading) {
    return (
      <div className="workspaces-page int-page">
        <WorkspaceBreadcrumb workspace={workspace} section="integrations" />
        <Card>
          <div className="page-status">
            <span className="spinner" aria-hidden="true" />
            {t('workspaceIntegrations.loading')}
          </div>
        </Card>
      </div>
    )
  }

  if (error || !integration) {
    return (
      <div className="workspaces-page int-page">
        <WorkspaceBreadcrumb workspace={workspace} section="integrations" />
        <Card>
          <div className="table-state table-state--error">
            <h3 className="table-state__title">
              {t('workspaceIntegrations.detail.notFoundTitle')}
            </h3>
            <p className="table-state__text">
              {t('workspaceIntegrations.detail.notFoundText')}
            </p>
            <Link className="btn btn--primary" to={integrationsPath}>
              {t('workspaceIntegrations.detail.backToCatalog')}
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  const name = t(integration.nameKey)
  const variant = INTEGRATION_STATUS_VARIANTS[integration.status]
  const missingFields = getMissingConfigFields(integration)

  return (
    <div className="workspaces-page int-page">
      <WorkspaceBreadcrumb
        workspace={workspace}
        section="integrations"
        current={{ label: name }}
      />
      <WorkspaceSectionNav workspaceId={workspaceId} />

      <header className="workspaces-page__head">
        <div className="workspaces-page__headline">
          <Link to={integrationsPath} className="db-page__back">
            <ArrowLeft size={15} aria-hidden="true" />
            {t('workspaceIntegrations.detail.backToCatalog')}
          </Link>
          <h1 className="workspaces-page__title">
            <Cable size={22} aria-hidden="true" />
            {name}
          </h1>
          <p className="page-description">{t(integration.descriptionKey)}</p>
        </div>

        <div className="int-page__head-actions">
          <span className={`int-chip int-chip--${variant}`}>
            {t(INTEGRATION_STATUS_LABEL_KEYS[integration.status])}
          </span>

          {integration.connected ? (
            <button
              type="button"
              className="btn btn--ghost int-page__cta"
              onClick={() => {
                setActionError(null)
                setIsDisconnectOpen(true)
              }}
              disabled={isBusy}
            >
              <Unplug size={15} aria-hidden="true" />
              {t('workspaceIntegrations.card.disconnectCta')}
            </button>
          ) : null}

          {modulePath ? (
            <Link className="btn btn--outline" to={modulePath}>
              <ExternalLink size={15} aria-hidden="true" />
              {t('workspaceIntegrations.card.openModuleCta')}
            </Link>
          ) : null}
        </div>
      </header>

      {actionError ? (
        <div className="form-notice form-notice--error" role="alert">
          {actionError}
        </div>
      ) : null}

      <Card title={t('workspaceIntegrations.detail.overviewTitle')}>
        <dl className="record-detail">
          <div className="record-detail__row">
            <dt className="record-detail__label">
              {t('workspaceIntegrations.detail.idLabel')}
            </dt>
            <dd className="record-detail__value record-detail__value--mono">
              {integration.id}
            </dd>
          </div>
          <div className="record-detail__row">
            <dt className="record-detail__label">
              {t('workspaceIntegrations.detail.categoryLabel')}
            </dt>
            <dd className="record-detail__value">
              {t(INTEGRATION_CATEGORY_LABEL_KEYS[integration.category])}
            </dd>
          </div>
          <div className="record-detail__row">
            <dt className="record-detail__label">
              {t('workspaceIntegrations.detail.moduleLabel')}
            </dt>
            <dd className="record-detail__value">
              {t('workspaceIntegrations.detail.reusedModule')}
            </dd>
          </div>
          <div className="record-detail__row">
            <dt className="record-detail__label">
              {t('workspaceIntegrations.detail.connectedAtLabel')}
            </dt>
            <dd className="record-detail__value">
              {integration.connectedAt ?? t('workspaceIntegrations.detail.notSet')}
            </dd>
          </div>
        </dl>

        {integration.requiresBackend ? (
          <p className="int-card__notice">
            {t('workspaceIntegrations.card.backendNotice')}
          </p>
        ) : null}
      </Card>

      {isEditing ? (
        <Card>
          <IntegrationConfigForm
            key={`${integration.id}-${isEditing}`}
            integration={integration}
            isSaving={isBusy}
            error={actionError}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsEditing(false)
              setActionError(null)
            }}
          />
        </Card>
      ) : (
        <Card title={t('workspaceIntegrations.detail.settingsTitle')}>
          {integration.configFields.length === 0 ? (
            <p className="table-state__text">
              {t('workspaceIntegrations.settings.noFields')}
            </p>
          ) : (
            <>
              <dl className="record-detail">
                {integration.configFields.map((field) => (
                  <div key={field.key} className="record-detail__row">
                    <dt className="record-detail__label">{t(field.label)}</dt>
                    <dd className="record-detail__value">
                      {describeConfigValue(field, integration.configuration[field.key], t)}
                    </dd>
                  </div>
                ))}
              </dl>

              {missingFields.length > 0 ? (
                <p className="int-detail__warning">
                  {t('workspaceIntegrations.detail.missingFields', {
                    count: missingFields.length,
                  })}
                </p>
              ) : null}

              <div className="int-detail__actions">
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => {
                    setActionError(null)
                    setIsEditing(true)
                  }}
                  disabled={isBusy}
                >
                  {integration.connected ? (
                    <SlidersHorizontal size={15} aria-hidden="true" />
                  ) : (
                    <Plug size={15} aria-hidden="true" />
                  )}
                  {integration.connected
                    ? t('workspaceIntegrations.card.configureCta')
                    : t('workspaceIntegrations.card.connectCta')}
                </button>
                <p className="form__hint">
                  {t('workspaceIntegrations.detail.configHint')}
                </p>
              </div>
            </>
          )}
        </Card>
      )}

      <p className="int-page__security">
        {t('workspaceIntegrations.detail.securityNote')}
      </p>

      <ConfirmDialog
        open={isDisconnectOpen}
        title={t('workspaceIntegrations.confirm.disconnectTitle')}
        message={t('workspaceIntegrations.confirm.disconnectText', { name })}
        confirmLabel={t('workspaceIntegrations.card.disconnectCta')}
        confirmingLabel={t('workspaceIntegrations.confirm.disconnecting')}
        cancelLabel={t('workspaceIntegrations.settings.cancel')}
        isConfirming={isBusy}
        error={actionError}
        onConfirm={() =>
          runAction(() =>
            integrationService.disconnectIntegration(integrationId, workspaceId)
          )
        }
        onCancel={() => {
          setIsDisconnectOpen(false)
          setActionError(null)
        }}
      />
    </div>
  )
}

/**
 * Renders one saved setting.
 *
 * A secret is never rendered. A stored secret reports only that it is set, and an
 * absent value reads as "not set" rather than as a default: the catalog's suggested
 * value is what the form pre-fills, not something the backend stored.
 */
function describeConfigValue(field, value, t) {
  if (field.type === INTEGRATION_CONFIG_TYPE.STORED_SECRET) {
    return value
      ? t('workspaceIntegrations.detail.secretSet')
      : t('workspaceIntegrations.detail.notSet')
  }
  if (field.type === INTEGRATION_CONFIG_TYPE.SECRET) {
    return t('workspaceIntegrations.detail.secretHidden')
  }
  if (value === undefined || value === null || value === '') {
    return t('workspaceIntegrations.detail.notSet')
  }
  if (field.type === INTEGRATION_CONFIG_TYPE.BOOLEAN) {
    return value
      ? t('workspaceIntegrations.detail.yes')
      : t('workspaceIntegrations.detail.no')
  }
  return String(value)
}

export default WorkspaceIntegrationPage
