import { AlertTriangle, RefreshCw } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'

/**
 * A failed send, and the way out of it.
 *
 * ── What is deliberately not shown ─────────────────────────────────────────────
 *
 * The user's own text. A failed message does not appear as a red bubble, because a
 * bubble is something that was delivered and this was not. The draft is still sitting in
 * the composer where the user can see it and fix it, so this row reports the failure and
 * offers the retry; showing the text twice would invite the reader to assume it had been
 * sent once already.
 *
 * ── Retry is honest about what it does ─────────────────────────────────────────
 *
 * Retry re-runs the same send. It is hidden while a send is in flight, because a second
 * click there would be a duplicate delivery, and it is never shown when the assistant is
 * not connected — a button whose only possible outcome is the same failure is worse than
 * no button.
 */
function ChatSendError({ message, onRetry, canRetry = false }) {
  const { t } = useTranslation()

  return (
    <div className="ai-send-error" role="alert">
      <AlertTriangle size={15} aria-hidden="true" className="ai-send-error__icon" />

      <div className="ai-send-error__body">
        <p className="ai-send-error__title">{t('aiAssistant.sendFailed')}</p>
        <p className="ai-send-error__text">{message}</p>
        <p className="ai-send-error__note">{t('aiAssistant.chat.draftKept')}</p>
      </div>

      {canRetry ? (
        <button type="button" className="btn btn--outline ai-send-error__retry" onClick={onRetry}>
          <RefreshCw size={13} aria-hidden="true" />
          {t('aiAssistant.chat.retry')}
        </button>
      ) : null}
    </div>
  )
}

export default ChatSendError
