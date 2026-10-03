import useTranslation from '@/hooks/useTranslation'

/**
 * The in-flight row.
 *
 * ── Why this is a request, not a message ───────────────────────────────────────
 *
 * This row says the assistant is working. It is not a message, it is not in the message
 * list, and it cannot be styled like a bubble — an assistant-shaped placeholder would be
 * a bubble the reader assumes has words in it. It is three dots and a sentence, in a
 * status region, positioned after the transcript.
 *
 * It also carries no animation of its own beyond the shared spinner, because a
 * long-running indeterminate animation is the one motion in this panel that can run
 * forever with nothing to report. The dots are the honest minimum: they show that
 * something is happening, and the reduced-motion block removes the only decorative part.
 */
function ChatThinking() {
  const { t } = useTranslation()

  return (
    <div className="ai-thinking" role="status" aria-live="polite">
      <span className="ai-thinking__dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="ai-thinking__label">{t('aiAssistant.chat.thinking')}</span>
    </div>
  )
}

export default ChatThinking
