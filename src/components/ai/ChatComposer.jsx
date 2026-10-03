import { useRef } from 'react'
import { SendHorizontal, Sparkles } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import { AI_MESSAGE_MAX_LENGTH } from '@/models/ai'

/**
 * The prompt input.
 *
 * Enter sends, Shift+Enter adds a line. The send button is disabled for an empty draft
 * and while a send is in flight, so a second press cannot put two copies of the same
 * message into the conversation.
 *
 * The disabled button is *not* decorated with a spinner. A spinner on a send button
 * implies a request is in progress; the honest state when there is no backend is that
 * the request cannot be made at all, and the page says that in plain words above the
 * composer. An animated control would suggest a system that is working on something.
 */
function ChatComposer({
  draft,
  onDraftChange,
  onSend,
  isSending = false,
  isDisabled = false,
  disabledReasonKey = null,
}) {
  const { t } = useTranslation()
  const textareaRef = useRef(null)

  const isEmpty = draft.trim() === ''
  const canSend = !isEmpty && !isSending && !isDisabled

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!canSend) return
    onSend()
  }

  const handleKeyDown = (event) => {
    // Enter sends, but only from a non-composing input. Without the isComposing check,
    // pressing Enter to accept an IME candidate in Azerbaijani would also send the
    // half-composed word.
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      if (canSend) onSend()
    }
  }

  return (
    <form className="ai-composer" onSubmit={handleSubmit}>
      {isDisabled ? (
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
          ref={textareaRef}
          className="ai-composer__input"
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('aiAssistant.chat.placeholder')}
          rows={1}
          maxLength={AI_MESSAGE_MAX_LENGTH}
          disabled={isDisabled}
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

      <p className="ai-composer__hint">{t('aiAssistant.chat.hint')}</p>
    </form>
  )
}

export default ChatComposer
