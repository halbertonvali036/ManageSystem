import useTranslation from '@/hooks/useTranslation'
import { formatAiMessageDate, isAiUserMessage, isAiNoticeMessage } from '@/models/ai'

/**
 * A single message in the conversation.
 *
 * Who is speaking is carried by alignment and colour, not by an avatar: a chat reads
 * by its shape of turn-taking, and an avatar column on every row makes a short
 * conversation look like a table.
 *
 * The sender's own words are never reformatted. A message is shown exactly as it was
 * sent, because this is a transcript — the moment it starts tidying up what a person
 * said, it stops being evidence of what they said.
 *
 * Proposals are deliberately not rendered here. A message that carried a change
 * proposal would show the proposal twice — once inline, once in the review panel — and
 * the two copies could disagree. The panel is the single place a proposal is shown, so
 * there is only one thing to review and one pair of buttons to press.
 *
 * There is no pending or failed variant of this component, and that is the point. A
 * bubble is a thing that was delivered; a send that failed keeps its text in the composer
 * and reports itself in a separate error row, so nothing in this component has to be able
 * to render a message that no model produced.
 */
function ChatMessage({ message }) {
  const { t, locale } = useTranslation()

  const isUser = isAiUserMessage(message)
  const isNotice = isAiNoticeMessage(message)

  const timestamp = formatAiMessageDate(message, locale)
  const senderLabel = isUser
    ? t('aiAssistant.chat.you')
    : isNotice
      ? t('aiAssistant.chat.notice')
      : t('aiAssistant.chat.assistant')

  const modifier = isUser
    ? 'ai-msg--user'
    : isNotice
      ? 'ai-msg--notice'
      : 'ai-msg--assistant'

  return (
    <li
      className={[
        'ai-msg',
        modifier,
        isUser ? 'ai-msg--outgoing' : 'ai-msg--incoming',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="ai-msg__sender">{senderLabel}</span>

      {/* The body is a plain block of text. A chat assistant eventually renders rich
          content, and when it does this element is where sanitisation has to land —
          it is the only place message text enters the document. */}
      <div className="ai-msg__bubble">
        <p className="ai-msg__text">{message.content}</p>
      </div>

      {timestamp ? (
        <time className="ai-msg__time" dateTime={message.createdAt}>
          {timestamp}
        </time>
      ) : null}
    </li>
  )
}

export default ChatMessage
