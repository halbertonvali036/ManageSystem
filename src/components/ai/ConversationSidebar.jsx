import { MessageSquare, Plus, RefreshCw, Sparkles } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import { getAiConversationLabel } from '@/models/ai'

/**
 * Conversation history.
 *
 * ── Three states, and they are not the same state ──────────────────────────────
 *
 * A history list has to be able to say three different things, and collapsing any two of
 * them into one "empty" box is how a portal ends up quietly lying about its own state:
 *
 *   unavailable  — no backend, so history cannot be listed at all
 *   error        — the list exists but could not be read
 *   empty        — the backend answered, and there are no conversations
 *
 * Only the third is a normal beginning. The first two are shown as themselves, with a
 * retry on the second. A sidebar full of invented past conversations would be the single
 * most convincing lie this page could tell, so none are ever rendered: `conversations` is
 * empty because the service said it was empty, or because it said it could not answer.
 *
 * ── Selection ──────────────────────────────────────────────────────────────────
 *
 * A `<ul>` of buttons with `aria-current` on the open row, rather than tabs. Tabs would
 * claim the rows are panels of one view; they are separate requests for separate
 * transcripts, and the distinction matters to a screen reader.
 *
 * The open row arrives already flagged by the caller, which is the only place that knows
 * both the id and the history — a row cannot work out whether it is current on its own.
 */
function ConversationSidebar({
  conversations = [],
  isAvailable = false,
  isLoading = false,
  error = null,
  onSelect,
  onRetry,
  onNew,
  isDisabled = false,
}) {
  const { t } = useTranslation()

  const hasConversations = conversations.length > 0

  return (
    <nav className="ai-history" aria-label={t('aiAssistant.history.heading')}>
      <div className="ai-history__head">
        <h2 className="ai-history__title">
          <MessageSquare size={14} aria-hidden="true" />
          {t('aiAssistant.history.heading')}
        </h2>

        {/* Returns to the workspace's live thread. It is not labelled "New conversation"
            because it does not create one: a thread exists once the backend has answered
            something, and the control cannot manufacture an empty one. */}
        <button
          type="button"
          className="ai-history__new"
          onClick={onNew}
          disabled={isDisabled}
          title={t('aiAssistant.history.current')}
        >
          <Plus size={14} aria-hidden="true" />
          <span className="visually-hidden">{t('aiAssistant.history.current')}</span>
        </button>
      </div>

      {isLoading && !hasConversations ? (
        <p className="ai-history__state">
          <span className="spinner" aria-hidden="true" />
          {t('aiAssistant.history.loading')}
        </p>
      ) : null}

      {/* The three empty-ish states, in the order a reader meets them: something went
          wrong, then there is nothing, then there is nothing *and* it could not be
          checked. Each one names its own situation rather than sharing a generic
          "no conversations" line. */}
      {error ? (
        <div className="ai-history__state ai-history__state--error">
          <p className="ai-history__state-text">{error}</p>
          <button
            type="button"
            className="btn btn--outline ai-history__retry"
            onClick={onRetry}
          >
            <RefreshCw size={13} aria-hidden="true" />
            {t('common.retry')}
          </button>
        </div>
      ) : hasConversations ? (
        <ul className="ai-history__list">
          {conversations.map((conversation) => {
            const label = getAiConversationLabel(conversation)
            return (
              <li key={conversation.key}>
                <button
                  type="button"
                  className={[
                    'ai-history__item',
                    conversation.isActive ? 'ai-history__item--active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onSelect(conversation.id)}
                  disabled={isDisabled}
                  aria-current={conversation.isActive ? 'true' : undefined}
                >
                  {/* A row with no title and no preview has nothing to announce, so the
                      fallback is drawn from the same string the name comes from rather
                      than a generic label that would make six rows indistinguishable. */}
                  <span className="ai-history__item-label">
                    {label ?? t('aiAssistant.history.untitled')}
                  </span>
                  {conversation.messageCount !== null ? (
                    <span className="ai-history__item-count">
                      {t('aiAssistant.history.messageCount', {
                        count: conversation.messageCount,
                      })}
                    </span>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : isAvailable ? (
        <p className="ai-history__state">{t('aiAssistant.history.empty')}</p>
      ) : (
        <p className="ai-history__state ai-history__state--muted">
          <Sparkles size={13} aria-hidden="true" />
          {t('aiAssistant.history.unavailable')}
        </p>
      )}
    </nav>
  )
}

export default ConversationSidebar
