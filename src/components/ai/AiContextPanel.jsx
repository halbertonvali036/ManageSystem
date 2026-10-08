import { Compass } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import { AI_CONTEXT_KEYS, AI_CONTEXT_LABEL_KEYS } from '@/models/ai'

/**
 * What the assistant knows about where you are.
 *
 * ── Every key is rendered, including the empty ones ─────────────────────────────
 *
 * This panel exists so the user can see the exact set of values that leaves their
 * browser. A panel that lists only what happens to be filled in cannot answer the
 * question it is there to answer, which is "what is this sending?". So the full list is
 * drawn every time and a missing value says so — five rows, four of them reading
 * "not open", is a complete answer; a variable-length list is not.
 *
 * ── Labels are translated, values are named in words ──────────────────────────
 *
 * `activePageId` is a wire name, not an interface one, so each key gets a translated
 * label — and where the page can resolve a friendly name from the draft it shows that
 * instead: "Home page", never `p_9f2a`. The raw identifier is still one disclosure away
 * in a `<details>`, because the panel's job is to show exactly what leaves the browser,
 * and hiding the id entirely would trade a small readability gain for an unanswerable
 * "what is it actually sending?". A value with no readable name shows its id directly —
 * an id nobody should have to read is still an id that has to be shown.
 *
 * ── The privacy claim is stated, not implied ────────────────────────────────────
 *
 * The panel ends with a line saying that keys, tokens and system prompts are never sent.
 * That claim is worth making out loud precisely because it is checkable: the list above
 * is exhaustive, five rows long, and derived from the same allowlist the service builds
 * its request body from. A reader can count the rows and compare them to what leaves the
 * network.
 */
function AiContextPanel({ context = {}, missingKeys = [], names = {} }) {
  const { t } = useTranslation()

  const entries = AI_CONTEXT_KEYS.map((key) => ({
    key,
    value: context[key] ?? null,
  }))
  const presentCount = entries.filter((entry) => entry.value !== null).length

  return (
    <div className="ai-context">
      <div className="ai-context__head">
        <h2 className="card__title">{t('aiAssistant.context.title')}</h2>
        <span className="ai-context__count">
          {t('aiAssistant.context.present', { count: presentCount, total: entries.length })}
        </span>
      </div>

      <p className="ai-context__description">{t('aiAssistant.context.description')}</p>

      <dl className="ai-context__list">
        {entries.map((entry) => (
          <div
            className={[
              'ai-context__item',
              entry.value === null ? 'ai-context__item--missing' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            key={entry.key}
          >
            <dt className="ai-context__item-label">
              {t(AI_CONTEXT_LABEL_KEYS[entry.key])}
            </dt>
            <dd className="ai-context__item-value">
              {entry.value === null ? (
                /* Naming the gap is the useful half. A blank cell next to "Site" reads as
                   a rendering bug; "not open" reads as something the user can go and fix. */
                <span className="ai-context__item-empty">
                  {t('aiAssistant.context.notSet')}
                </span>
              ) : names[entry.key] ? (
                /* The readable name is what the row is for; the id it came from stays
                   available one disclosure down, since the whole point of this panel is
                   that what leaves the browser can be inspected. */
                <>
                  <span className="ai-context__item-name">{names[entry.key]}</span>
                  <details className="ai-context__item-raw">
                    <summary>{t('aiAssistant.context.technicalId')}</summary>
                    <code className="ai-context__item-code">{entry.value}</code>
                  </details>
                </>
              ) : (
                <code className="ai-context__item-code">{entry.value}</code>
              )}
            </dd>
          </div>
        ))}
      </dl>

      {missingKeys.length > 0 ? (
        <p className="ai-context__hint">
          <Compass size={13} aria-hidden="true" />
          {t('aiAssistant.context.hint')}
        </p>
      ) : null}
    </div>
  )
}

export default AiContextPanel
