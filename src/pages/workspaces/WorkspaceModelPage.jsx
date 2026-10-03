import { useState } from 'react'
import { ArrowLeft, Pencil, Plus, Table2, Trash2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import ModelFieldForm from '@/components/database/ModelFieldForm'
import ModelForm from '@/components/database/ModelForm'
import WorkspaceBreadcrumb from '@/components/workspaces/WorkspaceBreadcrumb'
import WorkspaceSectionNav from '@/components/workspaces/WorkspaceSectionNav'
import useTranslation from '@/hooks/useTranslation'
import useWorkspace from '@/hooks/useWorkspace'
import useWorkspaceModel from '@/hooks/useWorkspaceModel'
import useWorkspaceModels from '@/hooks/useWorkspaceModels'
import databaseService from '@/services/databaseService'
import { BackendNotConnectedError } from '@/services/httpClient'
import {
  buildFieldDraft,
  buildModelRename,
  FIELD_TYPE_LABEL_KEYS,
  RELATION_TYPE_LABEL_KEYS,
} from '@/models/database'
import { WORKSPACE_DATABASE_PATH, WORKSPACE_MODEL_RECORDS_PATH } from '@/utils/constants'

/**
 * One schema model — its identity, its fields and its relation declarations.
 *
 * The model is the single unit of persistence, so adding, editing or removing a
 * field is one guarded `updateModel` call. Without a backend every one of those
 * calls is refused, so the field list stays exactly as it was read.
 */
function WorkspaceModelPage() {
  const { workspaceId, modelId } = useParams()
  const { t } = useTranslation()
  const { workspace } = useWorkspace(workspaceId)
  const { model, isLoading, error, refetch } = useWorkspaceModel(workspaceId, modelId)
  // Needed for the relation target picker: a field may only point at a model
  // that already exists in this schema.
  const { models } = useWorkspaceModels(workspaceId)

  const [isSaving, setIsSaving] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [editingField, setEditingField] = useState(undefined)
  const [pendingFieldDelete, setPendingFieldDelete] = useState(null)
  const [actionError, setActionError] = useState(null)

  const isAddingField = editingField?.mode === 'add'
  const isFieldFormOpen = editingField !== undefined

  const runAction = async (action, failureKey) => {
    setIsSaving(true)
    setActionError(null)
    try {
      await action()
      setEditingField(undefined)
      setIsRenaming(false)
      setPendingFieldDelete(null)
      refetch()
    } catch (err) {
      setActionError(
        err instanceof BackendNotConnectedError
          ? t('database.unavailableNotice')
          : t(failureKey)
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleRename = ({ name, key }) =>
    runAction(
      () => databaseService.updateModel(workspaceId, modelId, buildModelRename({ name, key })),
      'database.actions.renameFailed'
    )

  const handleFieldSubmit = (draft) => {
    const field = buildFieldDraft(draft)
    const currentFields = model?.fields ?? []
    const nextFields = isAddingField
      ? [...currentFields, { ...field, id: null }]
      : currentFields.map((item) => (item.id === draft.id ? { ...item, ...field } : item))

    return runAction(
      () => databaseService.updateModel(workspaceId, modelId, { fields: nextFields }),
      'database.actions.fieldSaveFailed'
    )
  }

  const handleFieldDelete = () =>
    runAction(
      () =>
        databaseService.updateModel(workspaceId, modelId, {
          fields: (model.fields ?? []).filter((item) => item.id !== pendingFieldDelete.id),
        }),
      'database.actions.fieldRemoveFailed'
    )

  if (error || (!isLoading && !model)) {
    return (
      <div className="workspaces-page">
        <WorkspaceBreadcrumb workspace={workspace} section="database" />
        <Card>
          <div className="table-state table-state--error">
            <h3 className="table-state__title">{t('workspaces.notFoundTitle')}</h3>
            <p className="table-state__text">{t('workspaces.notFoundText')}</p>
            <Link to={WORKSPACE_DATABASE_PATH(workspaceId)} className="btn btn--primary">
              {t('database.model.backToDatabase')}
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="workspaces-page">
        <WorkspaceBreadcrumb workspace={workspace} section="database" />
        <Card>
          <div className="page-status">
            <span className="spinner" aria-hidden="true" />
            {t('common.loading')}
          </div>
        </Card>
      </div>
    )
  }

  const fields = model.fields ?? []
  const siblingKeys = fields
    .map((field) => field.key)
    .filter((key) => key !== editingField?.field?.key)

  return (
    <div className="workspaces-page db-page">
      <WorkspaceBreadcrumb
        workspace={workspace}
        section="database"
        current={{ label: model.name }}
      />
      <WorkspaceSectionNav workspaceId={workspaceId} />

      <header className="workspaces-page__head">
        <div className="workspaces-page__headline">
          <Link to={WORKSPACE_DATABASE_PATH(workspaceId)} className="db-page__back">
            <ArrowLeft size={15} aria-hidden="true" />
            {t('database.model.backToDatabase')}
          </Link>
          <h1 className="workspaces-page__title">{model.name}</h1>
          <p className="page-description">
            {t('database.model.keyFor', { key: model.key })}
          </p>
        </div>

        <div className="db-page__head-actions">
          <Link
            className="btn btn--outline"
            to={WORKSPACE_MODEL_RECORDS_PATH(workspaceId, modelId)}
          >
            <Table2 size={15} aria-hidden="true" />
            {t('database.records.title')}
          </Link>
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => {
              setActionError(null)
              setIsRenaming((value) => !value)
            }}
          >
            <Pencil size={15} aria-hidden="true" />
            {t('database.actions.rename')}
          </button>
          <button
            type="button"
            className="btn btn--primary db-page__cta"
            onClick={() => {
              setActionError(null)
              setIsRenaming(false)
              setEditingField({ mode: 'add' })
            }}
          >
            <Plus size={16} aria-hidden="true" />
            {t('database.model.addFieldCta')}
          </button>
        </div>
      </header>

      {isRenaming ? (
        <Card>
          <ModelForm
            key={`rename-${model.id}`}
            model={model}
            existingKeys={models.map((item) => item.key).filter((key) => key !== model.key)}
            isSaving={isSaving}
            error={actionError}
            onSubmit={handleRename}
            onCancel={() => {
              setIsRenaming(false)
              setActionError(null)
            }}
          />
        </Card>
      ) : null}

      {isFieldFormOpen ? (
        <Card>
          <ModelFieldForm
            key={
              isAddingField
                ? `add-${model.id}`
                : `edit-${editingField.field.id ?? editingField.field.key}`
            }
            field={isAddingField ? null : editingField.field}
            existingKeys={siblingKeys}
            models={models.filter((item) => item.id !== model.id)}
            isSaving={isSaving}
            error={actionError}
            onSubmit={handleFieldSubmit}
            onCancel={() => {
              setEditingField(undefined)
              setActionError(null)
            }}
          />
        </Card>
      ) : null}

      {actionError && !isRenaming && !isFieldFormOpen ? (
        <div className="form-notice form-notice--error" role="alert">
          {actionError}
        </div>
      ) : null}

      <Card title={t('database.model.fieldsTitle')}>
        {fields.length === 0 && !isFieldFormOpen ? (
          <div className="db-fields__empty">
            <p className="db-fields__empty-title">{t('database.model.noFieldsTitle')}</p>
            <p className="db-fields__empty-text">{t('database.model.noFieldsText')}</p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setEditingField({ mode: 'add' })}
            >
              <Plus size={16} aria-hidden="true" />
              {t('database.model.addFieldCta')}
            </button>
          </div>
        ) : (
          <ul className="db-fields">
            {fields.map((field) => (
              <li className="db-field" key={field.id ?? field.key}>
                <div className="db-field__body">
                  <p className="db-field__name">
                    {field.name}
                    {field.required ? (
                      <span className="db-chip db-chip--required">
                        {t('database.field.requiredBadge')}
                      </span>
                    ) : null}
                  </p>
                  <p className="db-field__key">{field.key}</p>
                  <p className="db-field__meta">
                    {t('database.field.typeBadge', {
                      type: t(FIELD_TYPE_LABEL_KEYS[field.type]),
                    })}
                    {field.defaultValue ? ` · ${field.defaultValue}` : ''}
                  </p>
                  {field.relation ? (
                    <p className="db-field__meta">
                      {t('database.relation.title')}:{' '}
                      {t(RELATION_TYPE_LABEL_KEYS[field.relation.type])}
                      {field.relation.targetModelKey ? ` → ${field.relation.targetModelKey}` : ''}
                    </p>
                  ) : null}
                </div>

                <div className="db-field__actions">
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => {
                      setActionError(null)
                      setIsRenaming(false)
                      setEditingField({ mode: 'edit', field })
                    }}
                    disabled={isSaving}
                  >
                    {t('database.field.editTitle')}
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost db-field__action--danger"
                    onClick={() => {
                      setActionError(null)
                      setPendingFieldDelete(field)
                    }}
                    disabled={isSaving}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    {t('database.field.removeCta')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(pendingFieldDelete)}
        title={t('database.field.removeCta')}
        message={pendingFieldDelete?.name ?? ''}
        confirmLabel={t('database.field.removeCta')}
        cancelLabel={t('database.field.cancel')}
        isConfirming={isSaving}
        error={actionError}
        onConfirm={handleFieldDelete}
        onCancel={() => {
          setPendingFieldDelete(null)
          setActionError(null)
        }}
      />
    </div>
  )
}

export default WorkspaceModelPage
