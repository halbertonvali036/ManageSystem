import { useCallback, useEffect, useRef } from 'react'
import { ArrowUpRight, SendHorizontal, Sparkles, TimerReset } from 'lucide-react'
import { Link } from 'react-router-dom'
import useTranslation from '@/hooks/useTranslation'
import { AI_MESSAGE_MAX_LENGTH } from '@/models/ai'
import { BILLING_PATH } from '@/utils/constants'

/**
 * The prompt input.
 *
 * ── Multiline, with one send key ───────────────────────────────────────────────
 *
 * Enter sends, Shift+Enter adds a line, and an IME composition in progress is left
 * alone — pressing Enter to accept an Azerbaijani candidate must not send a
 * half-composed word. The box grows with its content up to a ceiling so a long prompt
 * does not push the conversation off screen, and the ceiling is a scroll rather than a
 * truncation: nothing typed is ever lost to the layout.
 *
 * ── Two different reasons not to send ──────────────────────────────────────────
 *
 * `isDisabled` means the request cannot be made at all (no backend), and the reason
 * is printed above the box. A limit reached means the account has used its allowance,
 * and that gets its own block with the way out — an upgrade link — instead of a
 * greyed-out button nobody can explain. The send button is never decorated with a
 * spinner while disabled: a spinner implies work in progress, and "not connected" is
 * the opposite of that.
 *
 * ── The hint ───────────────────────────────────────────────────────────────────
 *
 * The shortcut is spelled out under the box rather than left to be discovered, because
 * a composer that only accepts Enter on a hidden assumption is a composer people avoid
 * for fear of losing a paragraph.
 */
function ChatComposer({
  draft,
  onDraftChange,
  onSend,
  isSending = false,
  isDisabled = false,
  disabledReasonKey = null,
  isLimitReached = false,
  inputRef,
}) {
  const { t } = useTranslation()
  const innerRef = useRef(null)

  const isEmpty = draft.trim() === ''
  const canSend = !isEmpty && !isSending && !isDisabled && !isLimitReached

  // One node, two owners: autosize reads it, and the page may hold it to move focus
  // here after a control in another panel (the stale-plan link) points back at the
  // composer. Identity is memoized — a fresh callback every render would detach and
  // reattach the ref each pass, and a textarea that detaches loses focus.
  const setInputNode = useCallback(
    (node) => {
      innerRef.current = node
      if (inputRef) inputRef.current = node
    },
    [inputRef],
  )

  // Grow with the content, then stop at the ceiling. Reading `scrollHeight` after
  // resetting to `auto` is what keeps a *shorter* draft shrinking again — setting the
  // height directly would ratchet it upwards and never come back down.
  useEffect(() => {
    const node = innerRef.current
    if (!node) return
    node.style.height = 'auto'
    node.style.height = `${Math.min(node.scrollHeight, 160)}px`
  }, [draft])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!canSend) return
    onSend()
  }

  const handleKeyDown = (event) => {
    // Enter sends, but only from a non-composing input. Without the isComposing check,
    // pressing Enter to accept an IME candidate would also send the half-composed word.
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      if (canSend) onSend()
    }
  }

  return (
    <form className="ai-composer" onSubmit={handleSubmit}>
      {isLimitReached ? (
        <div className="ai-composer__limit" role="status">
          <span className="ai-composer__limit-icon" aria-hidden="true">
            <TimerReset size={16} />
          </span>
          <div className="ai-composer__limit-body">
            <p className="ai-composer__limit-title">{t('aiAssistant.plan.limit.title')}</p>
            <p className="ai-composer__limit-text">{t('aiAssistant.plan.limit.text')}</p>
          </div>
          <Link className="btn btn--primary btn--sm ai-composer__limit-cta" to={BILLING_PATH}>
            {t('aiAssistant.plan.upgrade')}
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
      ) : null}

      {isDisabled && !isLimitReached ? (
        <p className="ai-composer__notice">
          <Sparkles size={14} aria-hidden="true" />
          {t(disabledReasonKey ?? 'aiAssistant.chat.notConnected')}
        </p>
      ) : null}

      <div className="ai-composer__row">
        <label className="visually-hidden" htmlFor="ai-prompt">
          {t('aiAssistant.chat.placeholder')}
        </label>

        <textarea
          id="ai-prompt"
          ref={setInputNode}
          className="ai-composer__input"
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('aiAssistant.chat.placeholder')}
          rows={1}
          maxLength={AI_MESSAGE_MAX_LENGTH}
          disabled={isDisabled || isLimitReached}
        />

        <button
          type="submit"
          className="ai-composer__send btn btn--primary"
          disabled={!canSend}
          aria-label={t('aiAssistant.chat.send')}
        >
          <SendHorizontal size={16} aria-hidden="true" />
          <span className="ai-composer__send-text">{t('aiAssistant.chat.send')}</span>
        </button>
      </div>

      <div className="ai-composer__foot">
        <p className="ai-composer__hint">{t('aiAssistant.chat.hint')}</p>
        <p className="ai-composer__count">
          {t('aiAssistant.chat.characterCount', {
            count: draft.length,
            max: AI_MESSAGE_MAX_LENGTH,
          })}
        </p>
      </div>
    </form>
  )
}

export default ChatComposer
