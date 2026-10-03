import { Database, Plus } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'

/**
 * Database empty state.
 *
 * Shown when a workspace has no models. Never renders a sample model: it
 * explains what a model is and hands the user the real create action, which the
 * backend will refuse until persistence exists.
 */
function DatabaseModelsEmptyState({ onCreate, isBusy = false }) {
  const { t } = useTranslation()

  return (
    <div className="workspace-empty">
      <div className="workspace-empty__art" aria-hidden="true">
        <span className="workspace-empty__art-glow" />
        <span className="workspace-empty__art-frame">
          <Database size={26} />
        </span>
      </div>

      <h3 className="workspace-empty__title">{t('database.emptyTitle')}</h3>
      <p className="workspace-empty__text">{t('database.emptyText')}</p>

      <div className="workspace-empty__actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={onCreate}
          disabled={isBusy}
        >
          <Plus size={16} aria-hidden="true" />
          {t('database.newModelCta')}
        </button>
      </div>
    </div>
  )
}

export default DatabaseModelsEmptyState
