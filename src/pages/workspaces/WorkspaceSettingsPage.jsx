import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import BackLink from '@/components/common/BackLink'
import Card from '@/components/common/Card'
import WorkspaceBreadcrumb from '@/components/workspaces/WorkspaceBreadcrumb'
import WorkspaceSectionNav from '@/components/workspaces/WorkspaceSectionNav'
import useTranslation from '@/hooks/useTranslation'
import useWorkspace from '@/hooks/useWorkspace'
import workspaceService from '@/services/workspaceService'
import { BackendNotConnectedError } from '@/services/httpClient'
import {
  isValidWorkspaceName,
  isValidWorkspaceSlug,
  WORKSPACE_NAME_MAX_LENGTH,
  WORKSPACE_SLUG_MAX_LENGTH,
} from '@/models/workspace'
import { WORKSPACES_PATH, WORKSPACE_PATH } from '@/utils/constants'

const IDLE = 'idle'
const SUBMITTING = 'submitting'
const SAVED = 'saved'
const ERROR = 'error'
const UNAVAILABLE = 'unavailable'
const DELETING = 'deleting'
const DELETE_ERROR = 'delete_error'

/**
 * Workspace Settings.
 *
 * Lets the owner rename the workspace or delete it. Both actions are guarded by
 * requireBackend — no change is ever reported without a real server round-trip.
 */
function WorkspaceSettingsPage() {
  const { workspaceId } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { workspace, isLoading, error } = useWorkspace(workspaceId)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [nameError, setNameError] = useState('')
  const [slugError, setSlugError] = useState('')
  const [formState, setFormState] = useState(IDLE)
  const [deleteState, setDeleteState] = useState(IDLE)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [showDeleteZone, setShowDeleteZone] = useState(false)

  // Populate local form state once the workspace loads — only on first load
  const [initialised, setInitialised] = useState(false)
  if (workspace && !initialised) {
    setName(workspace.name)
    setSlug(workspace.slug)
    setInitialised(true)
  }

  const validate = () => {
    let valid = true
    if (!isValidWorkspaceName(name)) { setNameError(t('workspaces.create.nameError')); valid = false }
    if (!isValidWorkspaceSlug(slug)) { setSlugError(t('workspaces.create.slugError')); valid = false }
    return valid
  }

  const handleSave = async (event) => {
    event.preventDefault()
    if (!validate()) return
    setFormState(SUBMITTING)
    try {
      await workspaceService.updateWorkspace(workspaceId, { name, slug })
      setFormState(SAVED)
    } catch (err) {
      setFormState(err instanceof BackendNotConnectedError ? UNAVAILABLE : ERROR)
    }
  }

  const handleDelete = async () => {
    if (deleteConfirm !== workspace?.name) return
    setDeleteState(DELETING)
    try {
      await workspaceService.deleteWorkspace(workspaceId)
      navigate(WORKSPACES_PATH)
    } catch (err) {
      setDeleteState(err instanceof BackendNotConnectedError ? UNAVAILABLE : DELETE_ERROR)
    }
  }

  if (error || (!isLoading && !workspace)) {
    return (
      <div className="workspaces-page">
        <WorkspaceBreadcrumb workspace={null} section="settings" />
        <Card>
          <div className="table-state table-state--error">
            <h3 className="table-state__title">{t('workspaces.notFoundTitle')}</h3>
            <Link to={WORKSPACES_PATH} className="btn btn--primary" style={{ marginTop: 'var(--space-4)' }}>
              {t('workspaces.backToWorkspaces')}
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="workspaces-page">
        <WorkspaceBreadcrumb workspace={null} section="settings" />
        <Card>
          <div className="page-status">
            <span className="spinner" aria-hidden="true" />
            {t('common.loading')}
          </div>
        </Card>
      </div>
    )
  }

  const isSubmitting = formState === SUBMITTING

  return (
    <div className="workspaces-page">
      <WorkspaceBreadcrumb workspace={workspace} section="settings" />
      <WorkspaceSectionNav workspaceId={workspaceId} />

      <header className="workspaces-page__head" style={{ marginTop: 'var(--space-4)' }}>
        <div className="workspaces-page__headline">
          <BackLink />
          <h1 className="workspaces-page__title">{t('workspaces.settings.title')}</h1>
          <p className="page-description">{t('workspaces.settings.subtitle')}</p>
        </div>
      </header>

      {/* General settings */}
      <Card>
        <form className="workspace-form" onSubmit={handleSave} noValidate>
          <h2 className="workspace-section__title">{t('workspaces.settings.general')}</h2>

          <div className={`form-field${nameError ? ' form-field--error' : ''}`}>
            <label className="form-label" htmlFor="ws-settings-name">
              {t('workspaces.create.nameLabel')}
            </label>
            <input
              id="ws-settings-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError('') }}
              maxLength={WORKSPACE_NAME_MAX_LENGTH}
              disabled={isSubmitting}
            />
            {nameError && <p className="form-error" role="alert">{nameError}</p>}
          </div>

          <div className={`form-field${slugError ? ' form-field--error' : ''}`}>
            <label className="form-label" htmlFor="ws-settings-slug">
              {t('workspaces.create.slugLabel')}
            </label>
            <input
              id="ws-settings-slug"
              type="text"
              className="form-input form-input--mono"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugError('') }}
              maxLength={WORKSPACE_SLUG_MAX_LENGTH}
              disabled={isSubmitting}
            />
            {slugError && <p className="form-error" role="alert">{slugError}</p>}
          </div>

          {formState === SAVED && (
            <div className="form-notice form-notice--success" role="status">
              {t('workspaces.settings.saved')}
            </div>
          )}
          {formState === UNAVAILABLE && (
            <div className="form-notice form-notice--warning" role="alert">
              {t('workspaces.create.unavailableNotice')}
            </div>
          )}
          {formState === ERROR && (
            <div className="form-notice form-notice--error" role="alert">
              {t('workspaces.settings.saveFailed')}
            </div>
          )}

          <div className="workspace-form__actions">
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              {isSubmitting ? t('common.saving') : t('common.save')}
            </button>
            <Link to={WORKSPACE_PATH(workspaceId)} className="btn btn--ghost">
              {t('common.cancel')}
            </Link>
          </div>
        </form>
      </Card>

      {/* Danger zone */}
      <Card>
        <div className="workspace-danger-zone">
          <h2 className="workspace-section__title workspace-danger-zone__title">
            {t('workspaces.settings.dangerZone')}
          </h2>
          <p className="workspace-panel-note">{t('workspaces.settings.deleteWarning')}</p>

          {!showDeleteZone ? (
            <button
              type="button"
              className="btn btn--destructive"
              onClick={() => setShowDeleteZone(true)}
            >
              {t('workspaces.settings.deleteBtn')}
            </button>
          ) : (
            <div className="workspace-delete-confirm">
              <p className="workspace-panel-note">
                {t('workspaces.settings.deleteConfirmText', { name: workspace.name })}
              </p>
              <input
                type="text"
                className="form-input"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={workspace.name}
                aria-label={t('workspaces.settings.deleteConfirmLabel')}
              />
              {(deleteState === UNAVAILABLE || deleteState === DELETE_ERROR) && (
                <div className="form-notice form-notice--error" role="alert">
                  {deleteState === UNAVAILABLE
                    ? t('workspaces.create.unavailableNotice')
                    : t('workspaces.settings.deleteFailed')}
                </div>
              )}
              <div className="workspace-form__actions">
                <button
                  type="button"
                  className="btn btn--destructive"
                  disabled={deleteConfirm !== workspace.name || deleteState === DELETING}
                  onClick={handleDelete}
                >
                  {deleteState === DELETING
                    ? t('workspaces.settings.deleting')
                    : t('workspaces.settings.deleteConfirmBtn')}
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => { setShowDeleteZone(false); setDeleteConfirm(''); setDeleteState(IDLE) }}
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default WorkspaceSettingsPage
