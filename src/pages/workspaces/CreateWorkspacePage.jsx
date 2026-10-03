import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/common/Card'
import WorkspaceBreadcrumb from '@/components/workspaces/WorkspaceBreadcrumb'
import useTranslation from '@/hooks/useTranslation'
import workspaceService from '@/services/workspaceService'
import { BackendNotConnectedError } from '@/services/httpClient'
import {
  buildWorkspaceDraft,
  isValidWorkspaceName,
  isValidWorkspaceSlug,
  slugifyWorkspaceName,
  WORKSPACE_NAME_MAX_LENGTH,
  WORKSPACE_SLUG_MAX_LENGTH,
} from '@/models/workspace'
import { WORKSPACE_PATH } from '@/utils/constants'

const IDLE = 'idle'
const SUBMITTING = 'submitting'
const ERROR = 'error'
const UNAVAILABLE = 'unavailable'

/**
 * Create Workspace — two-field wizard (name + slug).
 *
 * The slug is auto-suggested from the name but the user can override it.
 * Submission is refused until a backend is available.
 */
function CreateWorkspacePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [nameError, setNameError] = useState('')
  const [slugError, setSlugError] = useState('')
  const [formState, setFormState] = useState(IDLE)

  const handleNameChange = (value) => {
    setName(value)
    if (!slugTouched) {
      setSlug(slugifyWorkspaceName(value))
    }
    if (nameError) setNameError('')
  }

  const handleSlugChange = (value) => {
    setSlugTouched(true)
    setSlug(value)
    if (slugError) setSlugError('')
  }

  const validate = () => {
    let valid = true
    if (!isValidWorkspaceName(name)) {
      setNameError(t('workspaces.create.nameError'))
      valid = false
    }
    if (!isValidWorkspaceSlug(slug)) {
      setSlugError(t('workspaces.create.slugError'))
      valid = false
    }
    return valid
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return

    setFormState(SUBMITTING)
    try {
      const workspace = await workspaceService.createWorkspace(
        buildWorkspaceDraft({ name, slug })
      )
      navigate(WORKSPACE_PATH(workspace.id))
    } catch (err) {
      if (err instanceof BackendNotConnectedError) {
        setFormState(UNAVAILABLE)
      } else {
        setFormState(ERROR)
      }
    }
  }

  const isSubmitting = formState === SUBMITTING

  return (
    <div className="create-workspace-page">
      <WorkspaceBreadcrumb workspace={null} section={null} />

      <header className="workspaces-page__head" style={{ marginTop: 'var(--space-4)' }}>
        <div className="workspaces-page__headline">
          <h1 className="workspaces-page__title">{t('workspaces.create.title')}</h1>
          <p className="page-description">{t('workspaces.create.subtitle')}</p>
        </div>
      </header>

      <Card>
        <form className="workspace-form" onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className={`form-field${nameError ? ' form-field--error' : ''}`}>
            <label className="form-label" htmlFor="ws-name">
              {t('workspaces.create.nameLabel')}
            </label>
            <input
              id="ws-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              maxLength={WORKSPACE_NAME_MAX_LENGTH}
              placeholder={t('workspaces.create.namePlaceholder')}
              autoComplete="off"
              disabled={isSubmitting}
              aria-describedby={nameError ? 'ws-name-error' : undefined}
            />
            {nameError && (
              <p id="ws-name-error" className="form-error" role="alert">
                {nameError}
              </p>
            )}
            <p className="form-hint">{t('workspaces.create.nameHint')}</p>
          </div>

          {/* Slug */}
          <div className={`form-field${slugError ? ' form-field--error' : ''}`}>
            <label className="form-label" htmlFor="ws-slug">
              {t('workspaces.create.slugLabel')}
            </label>
            <input
              id="ws-slug"
              type="text"
              className="form-input form-input--mono"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              maxLength={WORKSPACE_SLUG_MAX_LENGTH}
              placeholder="my-workspace"
              autoComplete="off"
              disabled={isSubmitting}
              aria-describedby={slugError ? 'ws-slug-error' : 'ws-slug-hint'}
            />
            {slugError ? (
              <p id="ws-slug-error" className="form-error" role="alert">
                {slugError}
              </p>
            ) : (
              <p id="ws-slug-hint" className="form-hint">
                {t('workspaces.create.slugHint')}
              </p>
            )}
          </div>

          {/* Notices */}
          {formState === UNAVAILABLE && (
            <div className="form-notice form-notice--warning" role="alert">
              {t('workspaces.create.unavailableNotice')}
            </div>
          )}
          {formState === ERROR && (
            <div className="form-notice form-notice--error" role="alert">
              {t('workspaces.create.failedNotice')}
            </div>
          )}

          <div className="workspace-form__actions">
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? t('workspaces.create.submitting')
                : t('workspaces.create.submit')}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default CreateWorkspacePage
