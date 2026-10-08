import { useEffect, useMemo, useRef, useState } from 'react'
import { MessageSquare, MoreHorizontal, Plus, RefreshCw, Search, Sparkles, Trash2 } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import { formatAiConversationDate, getAiConversationLabel } from '@/models/ai'
import ConfirmDialog from '@/components/common/ConfirmDialog'

/**
 * Conversation history.
 *
 * ── Three empty states, and they are not the same state ────────────────────────
 *
 * A history list has to be able to say three different things, and collapsing any two
 * of them into one "empty" box is how a portal ends up quietly lying about its own
 * state:
 *
 *   unavailable  — no backend, so history cannot be listed at all
 *   error        — the list exists but could not be read
 *   empty        — the backend answered, and there are no conversations
 *
 * Only the third is a normal beginning. The first two are shown as themselves, with a
 * retry on the second. A sidebar full of invented past conversations would be the most
 * convincing lie this page could tell, so none are ever rendered.
 *
 * ── Search and rows ────────────────────────────────────────────────────────────
 *
 * Search runs over what is already loaded. It fetches nothing: a text box that
 * requests the history again on every keystroke is a text box that can show results
 * for a query the user has already changed.
 *
 * Each row carries its last activity and length, because "which thread was I in?" is
 * answered by when, not by a title the backend may not have set. A row with neither
 * falls back to the label and then to a translated placeholder — never to a fabricated
 * sequence number.
 *
 * ── The overflow menu ──────────────────────────────────────────────────────────
 *
 * Delete is confirmation-first and honest afterwards: the confirm dialog says what
 * would happen, and the caller decides what actually does. There is no optimistic
 * removal — a row that disappears and comes back is worse than a row that never moved.
 */
function ConversationSidebar({
  conversations = [],
  isAvailable = false,
  isLoading = false,
  error = null,
  notice = null,
  onSelect,
  onRetry,
  onNew,
  onDelete,
  isDisabled = false,
}) {
  const { t, locale } = useTranslation()
  const [query, setQuery] = useState('')
  const [openMenuId, setOpenMenuId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const menuRef = useRef(null)

  const hasConversations = conversations.length > 0

  const visibleConversations = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return conversations
    return conversations.filter((conversation) => {
      const label = getAiConversationLabel(conversation) ?? ''
      return (
        label.toLowerCase().includes(needle) ||
        (conversation.lastMessage ?? '').toLowerCase().includes(needle)
      )
    })
  }, [conversations, query])

  // Closing on an outside press or Escape. The menu is a transient popover rather
  // than a focus trap: it holds one action, and a dialog is what appears next.
  useEffect(() => {
    if (!openMenuId) return undefined

    const close = (event) => {
      if (event.key === 'Escape' || !menuRef.current?.contains(event.target)) {
        setOpenMenuId(null)
      }
    }

    document.addEventListener('keydown', close)
    document.addEventListener('mousedown', close)
    return () => {
      document.removeEventListener('keydown', close)
      document.removeEventListener('mousedown', close)
    }
  }, [openMenuId])

  const handleConfirmDelete = () => {
    const target = deleteTarget
    setDeleteTarget(null)
    setOpenMenuId(null)
    if (target) onDelete?.(target)
  }

  return (
    <nav className="ai-history" aria-label={t('aiAssistant.history.heading')}>
      <div className="ai-history__head">
        <h2 className="ai-history__title">
          <MessageSquare size={14} aria-hidden="true" />
          {t('aiAssistant.history.heading')}
        </h2>
      </div>

      {/* A real, labelled control rather than a bare icon: it starts the workspace's
          live thread, and an icon-only plus in a history column reads as "add row". */}
      <button
        type="button"
        className="ai-history__new"
        onClick={onNew}
        disabled={isDisabled}
      >
        <Plus size={15} aria-hidden="true" />
        <span>{t('aiAssistant.history.newConversation')}</span>
      </button>

      {hasConversations ? (
        <div className="ai-history__search">
          <Search size={14} aria-hidden="true" className="ai-history__search-icon" />
          <label className="visually-hidden" htmlFor="ai-history-search">
            {t('aiAssistant.history.searchLabel')}
          </label>
          <input
            id="ai-history-search"
            type="search"
            className="ai-history__search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('aiAssistant.history.searchPlaceholder')}
          />
        </div>
      ) : null}

      {notice ? (
        <p className="ai-history__notice" role="status">
          {notice}
        </p>
      ) : null}

      {isLoading && !hasConversations ? (
        <p className="ai-history__state">
          <span className="spinner" aria-hidden="true" />
          {t('aiAssistant.history.loading')}
        </p>
      ) : null}

      {error ? (
        <div className="ai-history__state ai-history__state--error">
          <p className="ai-history__state-text">{error}</p>
          <button type="button" className="btn btn--outline ai-history__retry" onClick={onRetry}>
            <RefreshCw size={13} aria-hidden="true" />
            {t('common.retry')}
          </button>
        </div>
      ) : hasConversations && visibleConversations.length === 0 ? (
        <div className="ai-history__state ai-history__state--empty">
          <p className="ai-history__state-text">
            {t('aiAssistant.history.noResults', { query: query.trim() })}
          </p>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => setQuery('')}
          >
            {t('aiAssistant.history.clearSearch')}
          </button>
        </div>
      ) : hasConversations ? (
        <ul className="ai-history__list">
          {visibleConversations.map((conversation) => {
            const label = getAiConversationLabel(conversation)
            const timestamp = formatAiConversationDate(conversation, locale)
            const isMenuOpen = openMenuId === conversation.id

            return (
              <li className="ai-history__row" key={conversation.key} ref={isMenuOpen ? menuRef : null}>
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
                  <span className="ai-history__item-label">
                    {label ?? t('aiAssistant.history.untitled')}
                  </span>
                  <span className="ai-history__item-meta">
                    {timestamp ? (
                      <time className="ai-history__item-time" dateTime={conversation.updatedAt}>
                        {timestamp}
                      </time>
                    ) : (
                      <span className="ai-history__item-time ai-history__item-time--none">
                        {t('aiAssistant.history.noActivity')}
                      </span>
                    )}
                    {conversation.messageCount !== null ? (
                      <span className="ai-history__item-count">
                        {t('aiAssistant.history.messageCount', {
                          count: conversation.messageCount,
                        })}
                      </span>
                    ) : null}
                  </span>
                </button>

                <button
                  type="button"
                  className="ai-history__more"
                  aria-haspopup="menu"
                  aria-expanded={isMenuOpen}
                  aria-label={t('aiAssistant.history.actionsFor', {
                    title: label ?? t('aiAssistant.history.untitled'),
                  })}
                  onClick={() => setOpenMenuId(isMenuOpen ? null : conversation.id)}
                  disabled={isDisabled}
                >
                  <MoreHorizontal size={15} aria-hidden="true" />
                </button>

                {isMenuOpen ? (
                  <div className="ai-history__menu" role="menu">
                    <button
                      type="button"
                      role="menuitem"
                      className="ai-history__menu-item"
                      onClick={() => {
                        setOpenMenuId(null)
                        setDeleteTarget(conversation)
                      }}
                    >
                      <Trash2 size={13} aria-hidden="true" />
                      {t('aiAssistant.history.delete')}
                    </button>
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : isAvailable ? (
        <div className="ai-history__state ai-history__state--empty">
          <Sparkles size={14} aria-hidden="true" className="ai-history__empty-icon" />
          <p className="ai-history__state-text">{t('aiAssistant.history.empty')}</p>
          <p className="ai-history__state-hint">{t('aiAssistant.history.emptyHint')}</p>
        </div>
      ) : (
        <p className="ai-history__state ai-history__state--muted">
          <Sparkles size={13} aria-hidden="true" />
          {t('aiAssistant.history.unavailable')}
        </p>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('aiAssistant.history.deleteTitle')}
        message={t('aiAssistant.history.deleteMessage', {
          title: deleteTarget
            ? getAiConversationLabel(deleteTarget) ?? t('aiAssistant.history.untitled')
            : '',
        })}
        confirmLabel={t('aiAssistant.history.deleteConfirm')}
        confirmingLabel={t('aiAssistant.history.deleting')}
        cancelLabel={t('common.cancel')}
        closeLabel={t('common.close')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </nav>
  )
}

export default ConversationSidebar
