import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import useWorkspace from '@/hooks/useWorkspace'
import useWorkspaceModel from '@/hooks/useWorkspaceModel'
import useWorkspaceRecord from '@/hooks/useWorkspaceRecord'
import databaseService from '@/services/databaseService'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import WorkspaceBreadcrumb from '@/components/workspaces/WorkspaceBreadcrumb'
import WorkspaceSectionNav from '@/components/workspaces/WorkspaceSectionNav'
import RecordForm from '@/components/records/RecordForm'
import { formatRecordValue } from '@/models/record'
import {
  WORKSPACE_MODEL_PATH,
  WORKSPACE_MODEL_RECORDS_PATH,
} from '@/utils/constants'

const NO_FIELDS = Object.freeze([])

/**
 * One record of a database model.
 *
 * Read mode lists exactly the model's fields, in the model's order, with values
 * formatted by each field's own type — so the detail view cannot drift from the
 * table. Edit mode mounts the same schema-driven form the create flow uses, and
 * the record is only re-read after the service confirms the write.
 */
function WorkspaceRecordPage() {
  const { workspaceId, modelId, recordId } = useParams()
  const navigate = useNavigate()
  const { t, locale } = useTranslation()
  const { workspace } = useWorkspace(workspaceId)

  const { model, isLoading: isLoadingModel, error: modelError } = useWorkspaceModel(
    workspaceId,
    modelId
  )
  const fields = useMemo(() => model?.fields ?? NO_FIELDS, [model])

  const { record, isLoading, error, refetch } = useWorkspaceRecord(
    workspaceId,
    modelId,
    recordId,
    fields,
    { enabled: Boolean(model) }
  )

  const recordsPath = WORKSPACE_MODEL_RECORDS_PATH(workspaceId, modelId)
  const modelPath = WORKSPACE_MODEL_PATH(workspaceId, modelId)

  const [isEditing, setIsEditing] = useState(false)
  const [isPendingDelete, setIsPendingDelete] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [actionError, setActionError] = useState(null)

  const displayOptions = {
    locale,
    trueLabel: t('database.records.form.yes'),
    falseLabel: t('database.records.form.no'),
    emptyLabel: t('database.records.notSet'),
  }

  const formatTimestamp = (value) => {
    if (!value) return t('database.records.notSet')
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return String(value)
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
  }

  const handleSave = async (values) => {
    setIsSaving(true)
    setActionError(null)

    try {
      await databaseService.updateRecord(workspaceId, modelId, recordId, values, fields)
      setIsEditing(false)
      refetch()
    } catch (saveError) {
      setActionError(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsSaving(true)
    setActionError(null)

    try {
      await databaseService.deleteRecord(workspaceId, modelId, recordId)
      // A deleted record cannot stay on screen, so the list is the only honest
      // destination.
      navigate(recordsPath, { replace: true })
    } catch (deleteError) {
      setActionError(deleteError.message)
    } finally {
      setIsSaving(false)
    }
  }

  const renderNotFound = (title, text) => (
    <div className="workspaces-page db-page">
      <WorkspaceBreadcrumb workspace={workspace} section="database" />
      <Card>
        <div className="table-state table-state--error">
          <h3 className="table-state__title">{title}</h3>
          <p className="table-state__text">{text}</p>
          <Link to={recordsPath} className="btn btn--primary">
            {t('database.records.detail.backToList')}
          </Link>
        </div>
      </Card>
    </div>
  )

  if (isLoadingModel || isLoading) {
    return (
      <div className="workspaces-page db-page">
        <WorkspaceBreadcrumb
          workspace={workspace}
          section="database"
          current={model ? { label: model.name, to: modelPath } : null}
        />
        <Card>
          <div className="page-status">
            <span className="spinner" aria-hidden="true" />
            {t('common.loading')}
          </div>
        </Card>
      </div>
    )
  }

  if (modelError || !model) {
    return renderNotFound(
      t('workspaces.notFoundTitle'),
      t('database.records.modelError')
    )
  }

  if (error || !record) {
    return renderNotFound(
      t('database.records.detail.notFoundTitle'),
      t('database.records.detail.notFoundText')
    )
  }

  return (
    <div className="workspaces-page db-page">
      <WorkspaceBreadcrumb
        workspace={workspace}
        section="database"
        current={{ label: t('database.records.detail.title') }}
      />
      <WorkspaceSectionNav workspaceId={workspaceId} />

      <header className="workspaces-page__head">
        <div className="workspaces-page__headline">
          <Link to={recordsPath} className="db-page__back">
            <ArrowLeft size={15} aria-hidden="true" />
            {t('database.records.detail.backToList')}
          </Link>
          <h1 className="workspaces-page__title">{model.name}</h1>
          <p className="page-description">
            {t('database.records.detail.subtitle', { model: model.name })}
          </p>
        </div>

        <div className="db-page__head-actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              setActionError(null)
              setIsEditing((value) => !value)
            }}
            disabled={isSaving}
          >
            <Pencil size={15} aria-hidden="true" />
            {t('database.records.editCta')}
          </button>
          <button
            type="button"
            className="btn btn--ghost db-field__action--danger"
            onClick={() => {
              setActionError(null)
              setIsPendingDelete(true)
            }}
            disabled={isSaving}
          >
            <Trash2 size={15} aria-hidden="true" />
            {t('database.records.deleteCta')}
          </button>
        </div>
      </header>

      {isEditing ? (
        <Card>
          <RecordForm
            model={model}
            record={record}
            isSaving={isSaving}
            error={actionError}
            onSubmit={handleSave}
            onCancel={() => {
              setIsEditing(false)
              setActionError(null)
            }}
          />
        </Card>
      ) : (
        <Card>
          <h2 className="workspace-section__title">{t('database.records.detail.title')}</h2>

          <dl className="record-detail">
            {fields.map((field) => (
              <div key={field.key} className="record-detail__row">
                <dt className="record-detail__label">
                  {field.name}
                  {field.required ? (
                    <span aria-hidden="true" className="record-form__required">
                      {t('database.records.form.requiredMark')}
                    </span>
                  ) : null}
                </dt>
                <dd className="record-detail__value">
                  {formatRecordValue(field, record.values?.[field.key], displayOptions)}
                </dd>
              </div>
            ))}
          </dl>

          <dl className="record-detail record-detail--meta">
            <div className="record-detail__row">
              <dt className="record-detail__label">{t('database.records.detail.createdAt')}</dt>
              <dd className="record-detail__value">{formatTimestamp(record.createdAt)}</dd>
            </div>
            <div className="record-detail__row">
              <dt className="record-detail__label">{t('database.records.detail.updatedAt')}</dt>
              <dd className="record-detail__value">{formatTimestamp(record.updatedAt)}</dd>
            </div>
          </dl>

          {actionError ? (
            <div className="form-notice form-notice--error" role="alert">
              {actionError}
            </div>
          ) : null}
        </Card>
      )}

      <ConfirmDialog
        open={isPendingDelete}
        title={t('database.records.confirm.deleteTitle')}
        message={t('database.records.confirm.deleteText')}
        confirmLabel={t('database.records.deleteCta')}
        cancelLabel={t('database.records.form.cancel')}
        isConfirming={isSaving}
        error={actionError}
        onConfirm={handleDelete}
        onCancel={() => {
          setIsPendingDelete(false)
          setActionError(null)
        }}
      />
    </div>
  )
}

export default WorkspaceRecordPage
