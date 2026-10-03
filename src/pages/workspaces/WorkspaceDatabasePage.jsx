import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useParams } from 'react-router-dom'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import DatabaseModelCard from '@/components/database/DatabaseModelCard'
import DatabaseModelsEmptyState from '@/components/database/DatabaseModelsEmptyState'
import DatabaseSchemaList from '@/components/database/DatabaseSchemaList'
import ModelForm from '@/components/database/ModelForm'
import WorkspaceBreadcrumb from '@/components/workspaces/WorkspaceBreadcrumb'
import WorkspaceSectionNav from '@/components/workspaces/WorkspaceSectionNav'
import useTranslation from '@/hooks/useTranslation'
import useWorkspace from '@/hooks/useWorkspace'
import useWorkspaceModels from '@/hooks/useWorkspaceModels'
import databaseService from '@/services/databaseService'
import { BackendNotConnectedError } from '@/services/httpClient'
import { buildModelDuplicateDraft, buildModelRename } from '@/models/database'

const VIEW_LIST = 'list'
const VIEW_SCHEMA = 'schema'

/**
 * Workspace Database — the schema builder for one workspace.
 *
 * Models list with create / rename / duplicate / delete, plus a read-only schema
 * view of the same models and their fields. Nothing is invented: reads degrade
 * to an empty list without a backend and every write is refused, so the page can
 * never show a model that was not persisted.
 */
function WorkspaceDatabasePage() {
  const { workspaceId } = useParams()
  const { t } = useTranslation()
  const { workspace, isLoading: workspaceLoading } = useWorkspace(workspaceId)
  const {
    models,
    visibleModels,
    total,
    fieldCount,
    isLoading,
    error,
    query,
    setQuery,
    clearFilters,
    refetch,
  } = useWorkspaceModels(workspaceId)

  const [view, setView] = useState(VIEW_LIST)
  const [editing, setEditing] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const keysInUse = models.map((model) => model.key)

  const runAction = async (action) => {
    setIsSaving(true)
    setFormError(null)
    try {
      await action()
      setEditing(null)
      setPendingDelete(null)
      refetch()
    } catch (err) {
      setFormError(
        err instanceof BackendNotConnectedError
          ? t('database.unavailableNotice')
          : t('database.actionFailed')
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreate = ({ name, key, description }) =>
    runAction(() => databaseService.createModel(workspaceId, { name, key, description }))

  const handleRename = ({ name, key }) =>
    runAction(() =>
      databaseService.updateModel(workspaceId, editing.id, buildModelRename({ name, key }))
    )

  const handleDuplicate = (model) =>
    runAction(() =>
      databaseService.createModel(workspaceId, buildModelDuplicateDraft(model, models))
    )

  const handleDelete = () =>
    runAction(() => databaseService.deleteModel(workspaceId, pendingDelete.id))

  return (
    <div className="workspaces-page db-page">
      <WorkspaceBreadcrumb workspace={workspace} section="database" />
      <WorkspaceSectionNav workspaceId={workspaceId} />

      <header className="workspaces-page__head">
        <div className="workspaces-page__headline">
          <h1 className="workspaces-page__title">{t('database.pageTitle')}</h1>
          <p className="page-description">{t('database.pageDescription')}</p>
        </div>

        <div className="db-page__head-actions">
          <div className="db-toggle" role="group" aria-label={t('database.viewLabel')}>
            <button
              type="button"
              className={`db-toggle__btn${view === VIEW_LIST ? ' db-toggle__btn--active' : ''}`}
              aria-pressed={view === VIEW_LIST}
              onClick={() => setView(VIEW_LIST)}
            >
              {t('database.viewList')}
            </button>
            <button
              type="button"
              className={`db-toggle__btn${view === VIEW_SCHEMA ? ' db-toggle__btn--active' : ''}`}
              aria-pressed={view === VIEW_SCHEMA}
              onClick={() => setView(VIEW_SCHEMA)}
            >
              {t('database.viewSchema')}
            </button>
          </div>

          <button
            type="button"
            className="btn btn--primary db-page__cta"
            onClick={() => {
              setFormError(null)
              setEditing({ mode: 'create' })
            }}
            disabled={workspaceLoading}
          >
            <Plus size={16} aria-hidden="true" />
            {t('database.newModelCta')}
          </button>
        </div>
      </header>

      {editing ? (
        <Card>
          <ModelForm
            key={editing.mode === 'create' ? 'create' : editing.model.id}
            model={editing.mode === 'create' ? null : editing.model}
            existingKeys={
              editing.mode === 'create'
                ? keysInUse
                : keysInUse.filter((key) => key !== editing.model.key)
            }
            isSaving={isSaving}
            error={formError}
            onSubmit={editing.mode === 'create' ? handleCreate : handleRename}
            onCancel={() => {
              setEditing(null)
              setFormError(null)
            }}
          />
        </Card>
      ) : null}

      {formError && !editing ? (
        <div className="form-notice form-notice--error" role="alert">
          {formError}
        </div>
      ) : null}

      {total > 0 ? (
        <div className="db-page__toolbar">
          <div className="db-search">
            <Search size={16} aria-hidden="true" className="db-search__icon" />
            <label className="db-search__label" htmlFor="db-model-search">
              {t('database.searchLabel')}
            </label>
            <input
              id="db-model-search"
              type="search"
              className="form__input db-search__input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('database.searchPlaceholder')}
            />
          </div>
          <p className="db-page__count" role="status">
            {t('database.modelCount', { count: total })} · {t('database.fieldCount', { count: fieldCount })}
          </p>
        </div>
      ) : null}

      {error ? (
        <Card>
          <div className="table-state table-state--error">
            <h3 className="table-state__title">{t('database.loadFailed')}</h3>
            <p className="table-state__text">{t('database.loadFailedText')}</p>
            <button type="button" className="btn btn--primary" onClick={refetch}>
              {t('common.retry')}
            </button>
          </div>
        </Card>
      ) : isLoading ? (
        <Card>
          <div className="page-status">
            <span className="spinner" aria-hidden="true" />
            {t('database.loading')}
          </div>
        </Card>
      ) : total === 0 ? (
        <Card>
          <DatabaseModelsEmptyState
            onCreate={() => {
              setFormError(null)
              setEditing({ mode: 'create' })
            }}
            isBusy={isSaving}
          />
        </Card>
      ) : view === VIEW_SCHEMA ? (
        <Card title={t('database.schemaTitle')}>
          <DatabaseSchemaList models={visibleModels} workspaceId={workspaceId} />
        </Card>
      ) : visibleModels.length === 0 ? (
        <Card>
          <div className="sites-no-results">
            <h3 className="sites-no-results__title">{t('database.noResultsTitle')}</h3>
            <p className="sites-no-results__text">{t('database.noResultsText')}</p>
            <button type="button" className="btn btn--outline" onClick={clearFilters}>
              {t('database.clearFilters')}
            </button>
          </div>
        </Card>
      ) : (
        <ul className="db-model-list">
          {visibleModels.map((model) => (
            <li key={model.id}>
              <DatabaseModelCard
                model={model}
                workspaceId={workspaceId}
                isBusy={isSaving}
                onRename={(target) => {
                  setFormError(null)
                  setEditing({ mode: 'rename', model: target })
                }}
                onDuplicate={handleDuplicate}
                onDelete={(target) => {
                  setFormError(null)
                  setPendingDelete(target)
                }}
              />
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={t('database.actions.deleteTitle')}
        message={t('database.actions.deleteMessage', { name: pendingDelete?.name ?? '' })}
        confirmLabel={t('database.actions.deleteConfirm')}
        cancelLabel={t('database.form.cancel')}
        isConfirming={isSaving}
        error={formError}
        onConfirm={handleDelete}
        onCancel={() => {
          setPendingDelete(null)
          setFormError(null)
        }}
      />
    </div>
  )
}

export { VIEW_LIST, VIEW_SCHEMA }
export default WorkspaceDatabasePage
