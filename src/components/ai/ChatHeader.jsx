import { PanelLeft, PanelRight, Sparkles } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'

/**
 * The assistant's header.
 *
 * ── What it answers ────────────────────────────────────────────────────────────
 *
 * Two questions, in that order: who am I talking to, and what is it looking at. The
 * first is the assistant itself; the second is the workspace · site · page line, built
 * from the same context allowlist the request uses. A chat about "the pricing page"
 * is unusable when the header cannot say which site that is, and the summary is
 * deliberately friendly — "Home page", never `p_9f2a`.
 *
 * The status pill is not decoration. The panel is fully rendered whether or not a
 * backend answers, so "Not connected" is the one place the page can say up front that
 * nothing will be sent — before someone composes a message that cannot go anywhere.
 *
 * ── The two buttons ────────────────────────────────────────────────────────────
 *
 * History and changes are drawers below their breakpoints, not columns, and a drawer
 * with no handle is invisible. Both buttons are always in the DOM; the stylesheet
 * decides at which width each one exists, so there is no layout branch in the
 * component and no button that appears with nothing behind it.
 */
function ChatHeader({
  contextItems = [],
  isConnected = false,
  pendingCount = 0,
  onToggleHistory,
  onToggleChanges,
  isHistoryOpen = false,
  isChangesOpen = false,
}) {
  const { t } = useTranslation()

  const summary = contextItems.filter(Boolean).join(' · ')

  return (
    <header className="ai-chat-head">
      <div className="ai-chat-head__identity">
        <span className="ai-chat-head__avatar" aria-hidden="true">
          <Sparkles size={18} />
        </span>

        <div className="ai-chat-head__text">
          <div className="ai-chat-head__title-row">
            <h2 className="ai-chat-head__title">{t('aiAssistant.chat.title')}</h2>
            <span
              className={[
                'ai-chat-head__status',
                isConnected ? 'ai-chat-head__status--online' : 'ai-chat-head__status--offline',
              ].join(' ')}
            >
              <span className="ai-chat-head__status-dot" aria-hidden="true" />
              {isConnected
                ? t('aiAssistant.chat.statusConnected')
                : t('aiAssistant.chat.statusOffline')}
            </span>
          </div>

          <p className="ai-chat-head__context" title={summary || undefined}>
            {summary || t('aiAssistant.chat.noContext')}
          </p>
        </div>
      </div>

      <div className="ai-chat-head__actions">
        <button
          type="button"
          className="ai-chat-head__action ai-chat-head__action--history"
          onClick={onToggleHistory}
          aria-expanded={isHistoryOpen}
          aria-controls="ai-history-panel"
        >
          <PanelLeft size={15} aria-hidden="true" />
          <span className="ai-chat-head__action-label">
            {t('aiAssistant.layout.historyToggle')}
          </span>
        </button>

        <button
          type="button"
          className="ai-chat-head__action ai-chat-head__action--changes"
          onClick={onToggleChanges}
          aria-expanded={isChangesOpen}
          aria-controls="ai-changes-panel"
        >
          <PanelRight size={15} aria-hidden="true" />
          <span className="ai-chat-head__action-label">
            {t('aiAssistant.layout.changesToggle')}
          </span>
          {pendingCount > 0 ? (
            <span className="ai-chat-head__action-badge">{pendingCount}</span>
          ) : null}
        </button>
      </div>
    </header>
  )
}

export default ChatHeader
