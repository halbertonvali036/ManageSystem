import useTranslation from '@/hooks/useTranslation'
import { AI_ACTIONS, getMissingAiContext } from '@/models/ai'

/**
 * The declared action vocabulary, as something a person can read.
 *
 * ── Why show the internal type names at all ─────────────────────────────────────
 *
 * `AI_ACTION` is a contract with the backend, and a contract nobody outside the codebase
 * can see is a contract that drifts. Rendering it means the eight action types are a
 * visible promise rather than an internal detail — if the backend grows a ninth, this
 * panel is where it shows up missing, and if one of them is renamed, this is where the
 * rename becomes visible.
 *
 * Each row shows the action, where the change would land, and — the part that earns the
 * space — whether the assistant could act on it right now. An action whose context is not
 * open is marked as blocked, because "the AI can add a section" and "the AI cannot add a
 * section until you open a page" are different facts and only the first one is a promise.
 *
 * Nothing here executes anything. There is no button on a row, by design: an action card
 * that looked pressable in a list of eight would eventually grow a click handler, and
 * that is a mutation without a proposal.
 */
function ActionCatalog({ context = {} }) {
  const { t } = useTranslation()

  return (
    <div className="ai-catalog">
      <h2 className="card__title">{t('aiAssistant.catalog.title')}</h2>
      <p className="ai-catalog__description">{t('aiAssistant.catalog.description')}</p>

      <ul className="ai-catalog__list">
        {AI_ACTIONS.map((action) => {
          const missing = getMissingAiContext(action, context)
          const isReady = missing.length === 0

          return (
            <li
              className={[
                'ai-catalog__item',
                isReady ? 'ai-catalog__item--ready' : 'ai-catalog__item--blocked',
              ].join(' ')}
              key={action}
            >
              <div className="ai-catalog__item-main">
                <p className="ai-catalog__item-action">
                  {t(`aiAssistant.action.${action}`)}
                </p>
                <p className="ai-catalog__item-target">
                  {t(`aiAssistant.actionTarget.${action}`)}
                </p>
              </div>

              <span className="ai-catalog__item-state">
                {isReady ? t('aiAssistant.catalog.ready') : t('aiAssistant.catalog.blocked')}
              </span>

              {/* Which values are missing is spelled out for a screen reader, so the
                  state is not carried by a coloured pill alone. */}
              <span className="visually-hidden">
                {isReady
                  ? t('aiAssistant.catalog.ready')
                  : t('aiAssistant.catalog.needs', {
                      fields: missing
                        .map((key) => t(`aiAssistant.contextField.${key}`))
                        .join(', '),
                    })}
              </span>
            </li>
          )
        })}
      </ul>

      <p className="ai-catalog__footnote">{t('aiAssistant.catalog.footnote')}</p>
    </div>
  )
}

export default ActionCatalog
