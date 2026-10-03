import { useId } from 'react'
import { Copy, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import useTranslation from '@/hooks/useTranslation'
import { formatDatabaseDate } from '@/models/database'
import { WORKSPACE_MODEL_PATH } from '@/utils/constants'

/**
 * One schema model in the Models list.
 *
 * Purely presentational: it renders the model and reports the requested action
 * to the page. Every mutation goes through the page, which is the only place
 * that talks to the service, so there is exactly one guarded write path.
 */
function DatabaseModelCard({ model, workspaceId, onRename, onDuplicate, onDelete, isBusy = false }) {
  const { t, locale } = useTranslation()
  const actionsId = useId()

  const updatedLabel = formatDatabaseDate(model.updatedAt, locale)
  const fieldCount = model.fields?.length ?? 0

  return (
    <article className="db-model" aria-labelledby={`${actionsId}-name`}>
      <div className="db-model__body">
        <h3 className="db-model__name" id={`${actionsId}-name`}>
          <Link
            to={WORKSPACE_MODEL_PATH(workspaceId, model.id)}
            className="db-model__link"
          >
            {model.name}
          </Link>
        </h3>

        <p className="db-model__key">{model.key}</p>

        {model.description ? (
          <p className="db-model__description">{model.description}</p>
        ) : null}

        <p className="db-model__meta">
          <span className="db-model__meta-value">
            {t('database.actions.fields', { count: fieldCount })}
          </span>
          {updatedLabel ? (
            <>
              {' · '}
              {t('database.actions.updated')} {updatedLabel}
            </>
          ) : null}
        </p>
      </div>

      <div className="db-model__actions" role="group" aria-labelledby={`${actionsId}-name`}>
        <button
          type="button"
          className="btn btn--ghost db-model__action"
          onClick={() => onRename(model)}
          disabled={isBusy}
        >
          <Pencil size={15} aria-hidden="true" />
          {t('database.actions.rename')}
        </button>

        <button
          type="button"
          className="btn btn--ghost db-model__action"
          onClick={() => onDuplicate(model)}
          disabled={isBusy}
        >
          <Copy size={15} aria-hidden="true" />
          {t('database.actions.duplicate')}
        </button>

        <button
          type="button"
          className="btn btn--ghost db-model__action db-model__action--danger"
          onClick={() => onDelete(model)}
          disabled={isBusy}
        >
          <Trash2 size={15} aria-hidden="true" />
          {t('database.actions.delete')}
        </button>
      </div>
    </article>
  )
}

export default DatabaseModelCard
