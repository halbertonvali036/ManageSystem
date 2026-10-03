import { Sparkles } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import { AI_ACTION_LABEL_KEYS } from '@/models/ai'

/**
 * Suggested prompts.
 *
 * When the backend is connected these are its suggestions. When it is not, they are
 * the examples declared in the model, and they say so in the heading — a chip list
 * presented as "what this assistant can do" when nothing is connected would be a claim
 * about a system that does not exist.
 *
 * Choosing one fills the composer. It does not send. Autofiring would fire a request
 * the user has not read yet, and with no backend it would fail in a way that looks like
 * a broken feature rather than a missing one.
 *
 * ── The chip text is translated, not read off the model ────────────────────────
 *
 * A declared example carries both a `promptKey` and an Azerbaijani `prompt`. Rendering
 * the literal would leave six Azerbaijani chips sitting in an English page — a small
 * thing, and the kind of small thing that makes an otherwise translated screen feel
 * broken. The key is used when the dictionary has it, and the literal is the fallback.
 * `t` returns the key itself for a missing entry, so that check is what distinguishes
 * "no translation yet" from "translated".
 */
function SuggestedPrompts({ suggestions = [], isUsingExamples = false, onSelect }) {
  const { t } = useTranslation()

  if (suggestions.length === 0) return null

  const labelFor = (suggestion) => {
    if (!suggestion.promptKey) return suggestion.prompt
    const translated = t(suggestion.promptKey)
    return translated === suggestion.promptKey ? suggestion.prompt : translated
  }

  return (
    <div className="ai-suggestions">
      <p className="ai-suggestions__label">
        <Sparkles size={13} aria-hidden="true" />
        {isUsingExamples
          ? t('aiAssistant.examples.label')
          : t('aiAssistant.suggestions.label')}
      </p>

      {isUsingExamples ? (
        /* Said once, above the chips. Six identical footnotes would be noise, and the
           claim matters once — these do nothing until the backend exists. */
        <p className="ai-suggestions__note">{t('aiAssistant.examples.note')}</p>
      ) : null}

      <ul className="ai-suggestions__list">
        {suggestions.map((suggestion) => {
          const prompt = labelFor(suggestion)

          return (
            <li key={suggestion.key}>
              <button type="button" className="ai-chip" onClick={() => onSelect(prompt)}>
                {suggestion.action ? (
                  <span className="ai-chip__action">
                    {t(AI_ACTION_LABEL_KEYS[suggestion.action])}
                  </span>
                ) : null}
                <span className="ai-chip__prompt">{prompt}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default SuggestedPrompts
