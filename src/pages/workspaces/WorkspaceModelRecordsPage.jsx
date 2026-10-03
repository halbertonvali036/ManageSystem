import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Inbox, Plus, Table2 } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import useWorkspace from '@/hooks/useWorkspace'
import useWorkspaceModel from '@/hooks/useWorkspaceModel'
import useWorkspaceRecords from '@/hooks/useWorkspaceRecords'
import databaseService from '@/services/databaseService'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import WorkspaceBreadcrumb from '@/components/workspaces/WorkspaceBreadcrumb'
import WorkspaceSectionNav from '@/components/workspaces/WorkspaceSectionNav'
import RecordForm from '@/components/records/RecordForm'
import RecordTable from '@/components/records/RecordTable'
import RecordsToolbar from '@/components/records/RecordsToolbar'
import { ALL_RECORDS_FILTER } from '@/models/record'
import {
  WORKSPACE_DATABASE_PATH,
  WORKSPACE_MODEL_PATH,
  WORKSPACE_RECORD_PATH,
} from '@/utils/constants'

const NO_FIELDS = Object.freeze([])

/**
 * Records of one database model.
 *
 * The page is a thin shell: the model supplies the schema, the records hook owns
 * loading plus the search/filter/sort state, and the table and the form read that
 * same field list. No column, control or validation rule is written here, so a
 * change to the model shows up in all of them at once.
 *
 * Nothing is stored in the browser. Creating, editing and deleting call the
 * service, which refuses the write while no backend is connected — the record is
 * never faked to make the table look populated.
 */
function WorkspaceModelRecordsPage() {
  const { workspaceId, modelId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { workspace } = useWorkspace(workspaceId)

  const { model, isLoading, error } = useWorkspaceModel(workspaceId, modelId)

  const fields = useMemo(() => model?.fields ?? NO_FIELDS, [model])
  const modelPath = WORKSPACE_MODEL_PATH(workspaceId, modelId)

  const {
    visibleRecords,
    total,
    isLoading: isLoadingRecords,
    error: recordsError,
    query,
    setQuery,
    filterField,
    setFilterField,
    filterValue,
    setFilterValue,
    filterOptions,
    sortKey,
    sortDirection,
    toggleSort,
    applySort,
    isFiltered,
    clearFilters,
    refetch,
  } = useWorkspaceRecords(workspaceId, modelId, fields, { enabled: Boolean(model) })

  // The create form opens under the table, editing replaces it. Only one form is
  // mounted at a time, so a draft can never be submitted twice.
  const [isCreating, setIsCreating] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [actionError, setActionError] = useState(null)

  const hasFields = fields.length > 0
  const isFormOpen = isCreating || Boolean(editingRecord)

  const openCreateForm = () => {
    setEditingRecord(null)
    setIsCreating(true)
    setActionError(null)
  }

  const closeForm = () => {
    setIsCreating(false)
    setEditingRecord(null)
    setActionError(null)
  }

  const handleSubmit = async (values) => {
    setIsSaving(true)
    setActionError(null)

    try {
      if (editingRecord) {
        await databaseService.updateRecord(
          workspaceId,
          modelId,
          editingRecord.id,
          values,
          fields
        )
      } else {
        await databaseService.createRecord(workspaceId, modelId, values, fields)
      }
      closeForm()
      refetch()
    } catch (submitError) {
      // The refusal is shown in place and the form keeps its draft, so nothing the
      // user typed is lost.
      setActionError(submitError.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!pendingDelete) return
    setIsSaving(true)
    setActionError(null)

    try {
      await databaseService.deleteRecord(workspaceId, modelId, pendingDelete.id)
      setPendingDelete(null)
      refetch()
    } catch (deleteError) {
      // The dialog stays open on failure; the message comes from the service.
      setActionError(deleteError.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || isLoadingRecords) {
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

  if (error || !model) {
    return (
      <div className="workspaces-page db-page">
        <WorkspaceBreadcrumb workspace={workspace} section="database" />
        <Card>
          <div className="table-state table-state--error">
            <h3 className="table-state__title">{t('workspaces.notFoundTitle')}</h3>
            <p className="table-state__text">{t('database.records.modelError')}</p>
            <Link to={WORKSPACE_DATABASE_PATH(workspaceId)} className="btn btn--primary">
              {t('database.model.backToDatabase')}
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  const renderBody = () => {
    if (recordsError) {
      return (
        <div className="table-state table-state--error">
          <h3 className="table-state__title">{t('database.records.loadErrorTitle')}</h3>
          <p className="table-state__text">{recordsError.message}</p>
          <button type="button" className="btn btn--ghost" onClick={refetch}>
            {t('common.retry')}
          </button>
        </div>
      )
    }

    if (!hasFields) {
      return <RecordTable model={model} workspaceId={workspaceId} fields={fields} />
    }

    if (total === 0) {
      return (
        <div className="table-state">
          <Inbox size={28} className="table-state__icon" aria-hidden="true" />
          <p className="table-state__title">{t('database.records.emptyTitle')}</p>
          <p className="table-state__text">{t('database.records.emptyText')}</p>
          <button type="button" className="btn btn--primary" onClick={openCreateForm}>
            <Plus size={16} aria-hidden="true" />
            {t('database.records.newCta')}
          </button>
        </div>
      )
    }

    if (visibleRecords.length === 0) {
      return (
        <div className="table-state">
          <Inbox size={28} className="table-state__icon" aria-hidden="true" />
          <p className="table-state__title">{t('database.records.noResultsTitle')}</p>
          <p className="table-state__text">{t('database.records.noResultsText')}</p>
          <button type="button" className="btn btn--ghost" onClick={clearFilters}>
            {t('database.records.clearFilters')}
          </button>
        </div>
      )
    }

    return (
      <RecordTable
        model={model}
        workspaceId={workspaceId}
        fields={fields}
        records={visibleRecords}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={toggleSort}
        onView={(record) => navigate(WORKSPACE_RECORD_PATH(workspaceId, modelId, record.id))}
        onEdit={(record) => {
          setIsCreating(false)
          setEditingRecord(record)
          setActionError(null)
        }}
        onDelete={(record) => {
          setPendingDelete(record)
          setActionError(null)
        }}
      />
    )
  }

  return (
    <div className="workspaces-page db-page">
      <WorkspaceBreadcrumb
        workspace={workspace}
        section="database"
        current={{ label: `${model.name} · ${t('database.records.title')}` }}
      />
      <WorkspaceSectionNav workspaceId={workspaceId} />

      <header className="workspaces-page__head">
        <div className="workspaces-page__headline">
          <Link to={modelPath} className="db-page__back">
            <ArrowLeft size={15} aria-hidden="true" />
            {t('database.records.backToModel')}
          </Link>
          <h1 className="workspaces-page__title">
            <Table2 size={22} aria-hidden="true" />
            {t('database.records.title')}
          </h1>
          <p className="page-description">
            {t('database.records.subtitle', { model: model.name })}
          </p>
        </div>

        <div className="db-page__head-actions">
          <Link className="btn btn--outline" to={modelPath}>
            {t('database.records.manageFieldsCta')}
          </Link>
          <button
            type="button"
            className="btn btn--primary db-page__cta"
            onClick={openCreateForm}
            disabled={!hasFields}
          >
            <Plus size={16} aria-hidden="true" />
            {t('database.records.newCta')}
          </button>
        </div>
      </header>

      <Card>
        {hasFields ? (
          <>
            <RecordsToolbar
              fields={fields}
              query={query}
              onQueryChange={setQuery}
              filterField={filterField}
              onFilterFieldChange={(key) => {
                setFilterField(key)
                setFilterValue(ALL_RECORDS_FILTER)
              }}
              filterValue={filterValue}
              onFilterValueChange={setFilterValue}
              filterOptions={filterOptions}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSortChange={applySort}
              isFiltered={isFiltered}
              onClear={clearFilters}
            />

            <p className="records-summary" role="status">
              {isFiltered
                ? t('database.records.countFiltered', {
                    visible: visibleRecords.length,
                    total,
                  })
                : t('database.records.count', { count: total })}
            </p>
          </>
        ) : null}

        {renderBody()}
      </Card>

      {isFormOpen ? (
        <Card>
          <RecordForm
            model={model}
            record={editingRecord}
            isSaving={isSaving}
            error={actionError}
            onSubmit={handleSubmit}
            onCancel={closeForm}
          />
        </Card>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={t('database.records.confirm.deleteTitle')}
        message={t('database.records.confirm.deleteText')}
        confirmLabel={t('database.records.deleteCta')}
        cancelLabel={t('database.records.form.cancel')}
        isConfirming={isSaving}
        error={actionError}
        onConfirm={handleDelete}
        onCancel={() => {
          setPendingDelete(null)
          setActionError(null)
        }}
      />
    </div>
  )
}

export default WorkspaceModelRecordsPage
