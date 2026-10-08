import { Sparkles, Wand2 } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import { formatAiMessageDate, isAiUserMessage, isAiNoticeMessage } from '@/models/ai'

/**
 * A single message in the conversation.
 *
 * ── Text first, then the change it carried ─────────────────────────────────────
 *
 * A reply is read as prose, so the body stays a plain block: no rich cards, no
 * reflowed markup, nothing that could reorder what a model actually said. When the
 * same reply also proposed changes, a single line under the bubble says how many and
 * where to review them. That line is a signpost, not a second copy of the proposals —
 * the review queue stays the only place they are shown, so there is one list to read
 * and one pair of buttons to press.
 *
 * ── Who is speaking ────────────────────────────────────────────────────────────
 *
 * Carried by alignment, colour and a named label, not by an avatar column: a chat
 * reads by its shape of turn-taking, and an avatar on every row makes a short
 * conversation look like a table.
 *
 * There is no pending or failed variant of this component, and that is the point. A
 * bubble is a thing that was delivered; a send that failed keeps its text in the
 * composer and reports itself in a separate error row, so nothing here can render a
 * message that no model produced.
 */
function ChatMessage({ message, onSelectChanges }) {
  const { t, locale } = useTranslation()

  const isUser = isAiUserMessage(message)
  const isNotice = isAiNoticeMessage(message)
  const proposalCount = Array.isArray(message.proposals) ? message.proposals.length : 0

  const timestamp = formatAiMessageDate(message, locale)
  const senderLabel = isUser
    ? t('aiAssistant.chat.you')
    : isNotice
      ? t('aiAssistant.chat.notice')
      : t('aiAssistant.chat.assistant')

  const modifier = isUser ? 'ai-msg--user' : isNotice ? 'ai-msg--notice' : 'ai-msg--assistant'

  return (
    <li
      className={['ai-msg', modifier, isUser ? 'ai-msg--outgoing' : 'ai-msg--incoming']
        .filter(Boolean)
        .join(' ')}
    >
      <span className="ai-msg__sender">
        {!isUser && !isNotice ? (
          <span className="ai-msg__sender-icon" aria-hidden="true">
            <Sparkles size={11} />
          </span>
        ) : null}
        {senderLabel}
      </span>

      {/* The body is a plain block of text. A chat assistant eventually renders rich
          content, and when it does this element is where sanitisation has to land —
          it is the only place message text enters the document. */}
      <div className="ai-msg__bubble">
        <p className="ai-msg__text">{message.content}</p>
      </div>

      {proposalCount > 0 ? (
        <button type="button" className="ai-msg__proposals" onClick={onSelectChanges}>
          <Wand2 size={12} aria-hidden="true" />
          {t('aiAssistant.chat.proposalsLinked', { count: proposalCount })}
        </button>
      ) : null}

      {timestamp ? (
        <time className="ai-msg__time" dateTime={message.createdAt}>
          {timestamp}
        </time>
      ) : null}
    </li>
  )
}

export default ChatMessage
