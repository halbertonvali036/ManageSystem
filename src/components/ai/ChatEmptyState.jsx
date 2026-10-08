import { Check, Eye, Sparkles } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'

/**
 * Shown before any message exists.
 *
 * ── Two different emptinesses ──────────────────────────────────────────────────
 *
 * The wording depends on whether the assistant is reachable, because those are
 * genuinely different situations and only one of them is a normal empty state. When
 * connected, an empty conversation is a real start: nothing has been asked yet. When
 * not connected, there is no assistant to be empty, and the panel says that instead of
 * presenting a tidy blank chat as though it were waiting for a first question.
 *
 * ── How this panel works ───────────────────────────────────────────────────────
 *
 * Three lines, because the approval flow is the one thing worth learning before the
 * first message: ask, review, apply. It is a description of what will happen — not a
 * promise that anything has happened. There is no illustration of a finished site and
 * no "the AI is ready" claim; readiness is a fact about a backend, and the status pill
 * in the header is where that fact lives.
 */
function ChatEmptyState({ isConnected = false }) {
  const { t } = useTranslation()

  const steps = [
    { key: 'ask', icon: Sparkles },
    { key: 'review', icon: Eye },
    { key: 'apply', icon: Check },
  ]

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

      <ul className="ai-empty__steps">
        {steps.map((step) => {
          const Icon = step.icon
          return (
            <li className="ai-empty__step" key={step.key}>
              <span className="ai-empty__step-icon" aria-hidden="true">
                <Icon size={13} />
              </span>
              <span>
                <strong className="ai-empty__step-title">
                  {t(`aiAssistant.empty.step.${step.key}`)}
                </strong>
                <span className="ai-empty__step-text">
                  {t(`aiAssistant.empty.stepText.${step.key}`)}
                </span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default ChatEmptyState
