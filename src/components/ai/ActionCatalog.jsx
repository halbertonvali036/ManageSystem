import { Database, Palette, Pencil, Plus, Type } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import {
  AI_CAPABILITY_CATEGORIES,
  AI_CAPABILITY_CATEGORY_DESCRIPTION_KEYS,
  AI_CAPABILITY_CATEGORY_LABEL_KEYS,
  getMissingAiContext,
} from '@/models/ai'

/**
 * The declared action vocabulary, grouped the way a builder thinks about it.
 *
 * ── Why group at all ───────────────────────────────────────────────────────────
 *
 * Eight raw action names are a contract with the backend, not something a person can
 * scan: nobody asks for `updateBlock`, they ask to fix a sentence. Grouping them into
 * Create / Edit / Content / Design / Data turns the list into "what I can ask for",
 * while the rows underneath still name each action exactly as the backend knows it — so
 * the panel is readable without the vocabulary drifting away from the wire format. Every
 * action appears in exactly one group, because an action listed twice is one whose
 * readiness state can disagree with itself.
 *
 * ── Ready or blocked, per row ──────────────────────────────────────────────────
 *
 * Each row shows where the change would land and whether the assistant could act on it
 * right now. An action whose context is not open is marked blocked, because "the AI can
 * add a section" and "the AI cannot add a section until you open a page" are different
 * facts and only the first one is a promise.
 *
 * Nothing here executes anything. There is no button on a row, by design: an action card
 * that looked pressable in a list of eight would eventually grow a click handler, and
 * that is a mutation without a proposal.
 */
const CATEGORY_ICONS = Object.freeze({
  plus: Plus,
  pencil: Pencil,
  type: Type,
  palette: Palette,
  database: Database,
})

function ActionCatalog({ context = {} }) {
  const { t } = useTranslation()

  return (
    <div className="ai-catalog">
      <h2 className="card__title">{t('aiAssistant.catalog.title')}</h2>
      <p className="ai-catalog__description">{t('aiAssistant.catalog.description')}</p>

      <div className="ai-catalog__groups">
        {AI_CAPABILITY_CATEGORIES.map((category) => {
          const Icon = CATEGORY_ICONS[category.icon] ?? Plus

          return (
            <section className="ai-catalog__group" key={category.key}>
              <h3 className="ai-catalog__group-title">
                <span className="ai-catalog__group-icon" aria-hidden="true">
                  <Icon size={13} />
                </span>
                {t(AI_CAPABILITY_CATEGORY_LABEL_KEYS[category.key])}
              </h3>
              <p className="ai-catalog__group-text">
                {t(AI_CAPABILITY_CATEGORY_DESCRIPTION_KEYS[category.key])}
              </p>

              <ul className="ai-catalog__list">
                {category.actions.map((action) => {
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
            </section>
          )
        })}
      </div>

      <p className="ai-catalog__footnote">{t('aiAssistant.catalog.footnote')}</p>
    </div>
  )
}

export default ActionCatalog
