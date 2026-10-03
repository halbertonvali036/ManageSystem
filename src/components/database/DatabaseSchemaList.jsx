import { Link } from 'react-router-dom'
import useTranslation from '@/hooks/useTranslation'
import { FIELD_TYPE_LABEL_KEYS, RELATION_TYPE_LABEL_KEYS } from '@/models/database'
import { WORKSPACE_MODEL_PATH } from '@/utils/constants'

/**
 * Schema overview — every model in the workspace with its fields.
 *
 * A read-only projection of the same data the list view edits, so a user can see
 * the whole structure at once before opening a single model. Nothing here is
 * persisted: a relation is shown as a declaration only.
 */
function DatabaseSchemaList({ models, workspaceId }) {
  const { t } = useTranslation()

  if (models.length === 0) {
    return <p className="db-schema__empty">{t('database.schemaEmptyText')}</p>
  }

  return (
    <div className="db-schema">
      {models.map((model) => (
        <section className="db-schema__model" key={model.id}>
          <header className="db-schema__head">
            <h3 className="db-schema__name">
              <Link to={WORKSPACE_MODEL_PATH(workspaceId, model.id)} className="db-schema__link">
                {model.name}
              </Link>
            </h3>
            <p className="db-schema__key">{model.key}</p>
            <p className="db-schema__count">
              {t('database.actions.fields', { count: model.fields?.length ?? 0 })}
            </p>
          </header>

          {model.fields?.length ? (
            <ul className="db-schema__fields">
              {model.fields.map((field) => (
                <li className="db-schema__field" key={field.id ?? field.key}>
                  <span className="db-schema__field-name">{field.name}</span>
                  <span className="db-schema__field-key">{field.key}</span>
                  <span className="db-schema__field-type">
                    {t(FIELD_TYPE_LABEL_KEYS[field.type])}
                  </span>
                  <span className="db-schema__field-flags">
                    {field.required ? (
                      <span className="db-chip db-chip--required">
                        {t('database.field.requiredBadge')}
                      </span>
                    ) : null}
                    {field.relation ? (
                      <span className="db-chip db-chip--relation">
                        {t(RELATION_TYPE_LABEL_KEYS[field.relation.type])}
                        {field.relation.targetModelKey ? ` · ${field.relation.targetModelKey}` : ''}
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="db-schema__empty">{t('database.model.noFieldsTitle')}</p>
          )}
        </section>
      ))}
    </div>
  )
}

export default DatabaseSchemaList
