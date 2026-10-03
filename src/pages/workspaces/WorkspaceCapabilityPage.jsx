import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Boxes, ExternalLink, Power } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import useWorkspace from '@/hooks/useWorkspace'
import useWorkspaceCapability from '@/hooks/useWorkspaceCapability'
import capabilityService from '@/services/capabilityService'
import { BackendNotConnectedError } from '@/services/httpClient'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import WorkspaceBreadcrumb from '@/components/workspaces/WorkspaceBreadcrumb'
import WorkspaceSectionNav from '@/components/workspaces/WorkspaceSectionNav'
import CapabilityConfigForm from '@/components/capabilities/CapabilityConfigForm'
import { CAPABILITY_CONFIG_TYPE, CAPABILITY_STATUS_LABEL_KEYS, CAPABILITY_STATUS_VARIANTS } from '@/models/capability'
import {
  WORKSPACE_CAPABILITIES_PATH,
  WORKSPACE_MODULE_PATHS,
} from '@/utils/constants'

/**
 * Capability settings — the foundation for per-workspace configuration.
 *
 * The view is driven by the catalog: name, status, the module it hands off to and
 * the config fields all come from `models/capability.js`. Saving posts only the
 * validated config and then re-reads the capability, so the page shows what the
 * backend stored rather than what the form held.
 */
function WorkspaceCapabilityPage() {
  const { workspaceId, capabilityId } = useParams()
  const { t } = useTranslation()
  const { workspace } = useWorkspace(workspaceId)

  const { capability, isLoading, error, refetch } = useWorkspaceCapability(
    workspaceId,
    capabilityId
  )

  const [isEditing, setIsEditing] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [isDisableOpen, setIsDisableOpen] = useState(false)
  const [actionError, setActionError] = useState(null)

  const capabilitiesPath = WORKSPACE_CAPABILITIES_PATH(workspaceId)
  const modulePath = capability
    ? WORKSPACE_MODULE_PATHS[capability.modulePath]?.(workspaceId)
    : null

  const runAction = async (action) => {
    setIsBusy(true)
    setActionError(null)
    try {
      await action()
      setIsDisableOpen(false)
      setIsEditing(false)
      refetch()
    } catch (err) {
      setActionError(
        err instanceof BackendNotConnectedError
          ? t('workspaceCapabilities.unavailableNotice')
          : t('workspaceCapabilities.actionFailed')
      )
    } finally {
      setIsBusy(false)
    }
  }

  const handleSaveConfig = (inputs) =>
    runAction(() =>
      capabilityService.updateCapabilityConfig(workspaceId, capabilityId, inputs)
    )

  if (isLoading) {
    return (
      <div className="workspaces-page cap-page">
        <WorkspaceBreadcrumb workspace={workspace} section="capabilities" />
        <Card>
          <div className="page-status">
            <span className="spinner" aria-hidden="true" />
            {t('workspaceCapabilities.loading')}
          </div>
        </Card>
      </div>
    )
  }

  if (error || !capability) {
    return (
      <div className="workspaces-page cap-page">
        <WorkspaceBreadcrumb workspace={workspace} section="capabilities" />
        <Card>
          <div className="table-state table-state--error">
            <h3 className="table-state__title">{t('workspaceCapabilities.detail.notFoundTitle')}</h3>
            <p className="table-state__text">{t('workspaceCapabilities.detail.notFoundText')}</p>
            <Link className="btn btn--primary" to={capabilitiesPath}>
              {t('workspaceCapabilities.detail.backToCatalog')}
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  const name = t(capability.nameKey)
  const variant = CAPABILITY_STATUS_VARIANTS[capability.status]

  return (
    <div className="workspaces-page cap-page">
      <WorkspaceBreadcrumb
        workspace={workspace}
        section="capabilities"
        current={{ label: name }}
      />
      <WorkspaceSectionNav workspaceId={workspaceId} />

      <header className="workspaces-page__head">
        <div className="workspaces-page__headline">
          <Link to={capabilitiesPath} className="db-page__back">
            <ArrowLeft size={15} aria-hidden="true" />
            {t('workspaceCapabilities.detail.backToCatalog')}
          </Link>
          <h1 className="workspaces-page__title">
            <Boxes size={22} aria-hidden="true" />
            {name}
          </h1>
          <p className="page-description">{t(capability.descriptionKey)}</p>
        </div>

        <div className="cap-page__head-actions">
          <span className={`cap-chip cap-chip--${variant}`}>
            {t(CAPABILITY_STATUS_LABEL_KEYS[capability.status])}
          </span>

          {capability.enabled ? (
            <button
              type="button"
              className="btn btn--ghost cap-page__cta"
              onClick={() => {
                setActionError(null)
                setIsDisableOpen(true)
              }}
              disabled={isBusy}
            >
              <Power size={15} aria-hidden="true" />
              {t('workspaceCapabilities.card.disableCta')}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--primary cap-page__cta"
              onClick={() =>
                runAction(() =>
                  capabilityService.enableCapability(workspaceId, capability.id)
                )
              }
              disabled={isBusy}
            >
              <Power size={15} aria-hidden="true" />
              {t('workspaceCapabilities.card.enableCta')}
            </button>
          )}

          {modulePath ? (
            <Link className="btn btn--outline" to={modulePath}>
              <ExternalLink size={15} aria-hidden="true" />
              {t('workspaceCapabilities.card.openModuleCta')}
            </Link>
          ) : null}
        </div>
      </header>

      {actionError ? (
        <div className="form-notice form-notice--error" role="alert">
          {actionError}
        </div>
      ) : null}

      <Card title={t('workspaceCapabilities.detail.overviewTitle')}>
        <dl className="record-detail">
          <div className="record-detail__row">
            <dt className="record-detail__label">{t('workspaceCapabilities.detail.idLabel')}</dt>
            <dd className="record-detail__value record-detail__value--mono">
              {capability.id}
            </dd>
          </div>
          <div className="record-detail__row">
            <dt className="record-detail__label">{t('workspaceCapabilities.detail.moduleLabel')}</dt>
            <dd className="record-detail__value">
              {t('workspaceCapabilities.detail.reusedModule')}
            </dd>
          </div>
          <div className="record-detail__row">
            <dt className="record-detail__label">{t('workspaceCapabilities.detail.updatedLabel')}</dt>
            <dd className="record-detail__value">
              {capability.updatedAt ?? t('workspaceCapabilities.detail.notSet')}
            </dd>
          </div>
        </dl>

        {capability.requiresIntegration ? (
          <p className="cap-card__notice">{t('workspaceCapabilities.card.integrationNotice')}</p>
        ) : null}
      </Card>

      {isEditing ? (
        <Card>
          <CapabilityConfigForm
            key={capability.id}
            capability={capability}
            isSaving={isBusy}
            error={actionError}
            onSubmit={handleSaveConfig}
            onCancel={() => {
              setIsEditing(false)
              setActionError(null)
            }}
          />
        </Card>
      ) : (
        <Card title={t('workspaceCapabilities.detail.settingsTitle')}>
          {capability.configFields.length === 0 ? (
            <p className="table-state__text">{t('workspaceCapabilities.settings.noFields')}</p>
          ) : (
            <>
              <dl className="record-detail">
                {capability.configFields.map((field) => (
                  <div key={field.key} className="record-detail__row">
                    <dt className="record-detail__label">{t(field.label)}</dt>
                    <dd className="record-detail__value">
                      {describeConfigValue(field, capability.configuration[field.key], t)}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="cap-detail__actions">
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => {
                    setActionError(null)
                    setIsEditing(true)
                  }}
                  disabled={isBusy}
                >
                  {t('workspaceCapabilities.card.configureCta')}
                </button>
                <p className="form__hint">{t('workspaceCapabilities.detail.configHint')}</p>
              </div>
            </>
          )}
        </Card>
      )}

      <ConfirmDialog
        open={isDisableOpen}
        title={t('workspaceCapabilities.confirm.disableTitle')}
        message={t('workspaceCapabilities.confirm.disableText', { name })}
        confirmLabel={t('workspaceCapabilities.card.disableCta')}
        cancelLabel={t('workspaceCapabilities.settings.cancel')}
        isConfirming={isBusy}
        error={actionError}
        onConfirm={() =>
          runAction(() =>
            capabilityService.disableCapability(workspaceId, capabilityId)
          )
        }
        onCancel={() => {
          setIsDisableOpen(false)
          setActionError(null)
        }}
      />
    </div>
  )
}

/**
 * Renders one saved setting.
 *
 * An absent value reads as "not set" rather than as a default: the catalog's
 * suggested value is what the form pre-fills, not something the backend stored.
 */
function describeConfigValue(field, value, t) {
  if (value === undefined || value === null || value === '') {
    return t('workspaceCapabilities.detail.notSet')
  }

  if (field.type === CAPABILITY_CONFIG_TYPE.BOOLEAN) {
    return value ? t('workspaceCapabilities.detail.yes') : t('workspaceCapabilities.detail.no')
  }

  return String(value)
}

export default WorkspaceCapabilityPage
