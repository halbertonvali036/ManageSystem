import { Sparkles } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'

/**
 * Shown before any message exists.
 *
 * The wording depends on whether the assistant is reachable, because those are two
 * genuinely different situations and only one of them is a normal empty state.
 *
 * When connected, an empty conversation is a real state: the assistant has simply not
 * been asked anything. When not connected, there is no assistant to be empty, and the
 * panel says that instead of presenting a tidy blank chat as though it were waiting
 * for a first question.
 */
function ChatEmptyState({ isConnected = false }) {
  const { t } = useTranslation()

  return (
    <div className="ai-empty">
      <span className="ai-empty__icon" aria-hidden="true">
        <Sparkles size={20} />
      </span>

      <h3 className="ai-empty__title">
        {isConnected ? t('aiAssistant.empty.title') : t('aiAssistant.empty.offlineTitle')}
      </h3>

      <p className="ai-empty__text">
        {isConnected ? t('aiAssistant.empty.text') : t('aiAssistant.empty.offlineText')}
      </p>
    </div>
  )
}

export default ChatEmptyState
