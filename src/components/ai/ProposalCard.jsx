import { useState } from 'react'
import { Check, ChevronDown, Eye, X } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import {
  AI_ACTION_LABEL_KEYS,
  AI_ACTION_TARGET_KEYS,
  AI_PROPOSAL_STATUS,
  getMissingAiContext,
} from '@/models/ai'

/**
 * One proposed change, with the decision to accept or refuse it.
 *
 * ── The order is fixed on purpose ──────────────────────────────────────────────
 *
 * Preview, then decide. Apply stays disabled until the details have been opened once. A
 * button that changes a published site should not be one click away from something that
 * only looks like a suggestion, and the cheapest way to make that true is to require a
 * deliberate look first.
 *
 * The preview toggle stays available after a decision, so an applied change can be read
 * back afterwards instead of collapsing into a status word.
 *
 * ── Why a rejection needs no request ───────────────────────────────────────────
 *
 * Rejecting changes nothing, so it is a local decision and stays local. That asymmetry
 * is intentional: it makes Apply the only control in this panel that can be wrong, and
 * therefore the only one that has to wait for the server.
 *
 * ── Applied state ──────────────────────────────────────────────────────────────
 *
 * `applied` is rendered only after `applyAiAction` resolved. This component has no way
 * to set it itself — it is handed a status — so no amount of clicking can produce a
 * panel claiming a site was published. When the call throws, the proposal stays
 * pending and the error is shown above it.
 */
function ProposalCard({ proposal, context, isApplying = false, onApply, onReject }) {
  const { t } = useTranslation()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const isApplied = proposal.status === AI_PROPOSAL_STATUS.APPLIED
  const isRejected = proposal.status === AI_PROPOSAL_STATUS.REJECTED
  const isPending = proposal.status === AI_PROPOSAL_STATUS.PENDING

  const missingContext = getMissingAiContext(proposal.action, context)
  const hasFields = proposal.fields.length > 0

  /**
   * The gate this component's comment claims.
   *
   * Apply requires the preview to have been opened. Two reasons, and both are about the
   * user rather than the code: a control that changes a site should not be one click away
   * from something that merely looks like a suggestion, and someone who applies a change
   * without reading it will not notice what it did until after it did. The state is
   * remembered in the component rather than derived, because the user closing the preview
   * again should not re-arm a button they have already been shown the contents of.
   *
   * A proposal with no fields has nothing to preview, so the gate cannot be satisfied and
   * Apply stays unavailable — the panel says so in words rather than leaving a button
   * that would apply an unspecified change.
   */
  const hasReviewed = isPreviewOpen || !hasFields
  const canApply =
    isPending && hasReviewed && hasFields && !isApplying && missingContext.length === 0

  const statusLabel = isApplied
    ? t('aiAssistant.approval.applied')
    : isRejected
      ? t('aiAssistant.approval.rejected')
      : t('aiAssistant.approval.pending')

  return (
    <article
      className={[
        'ai-proposal',
        isApplied ? 'ai-proposal--applied' : '',
        isRejected ? 'ai-proposal--rejected' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <header className="ai-proposal__head">
        <div className="ai-proposal__titles">
          <p className="ai-proposal__action">
            {t(AI_ACTION_LABEL_KEYS[proposal.action])}
          </p>
          <p className="ai-proposal__target">
            {t(AI_ACTION_TARGET_KEYS[proposal.action])}
            {proposal.isDeferred ? (
              <span className="ai-proposal__deferred">
                {t('aiAssistant.approval.deferred')}
              </span>
            ) : null}
          </p>
        </div>

        <span
          className={[
            'ai-proposal__status',
            isApplied ? 'ai-proposal__status--applied' : '',
            isRejected ? 'ai-proposal__status--rejected' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {isApplied ? <Check size={12} aria-hidden="true" /> : null}
          {statusLabel}
        </span>
      </header>

      {proposal.title ? <p className="ai-proposal__summary">{proposal.title}</p> : null}
      {proposal.description ? (
        <p className="ai-proposal__description">{proposal.description}</p>
      ) : null}

      {/* ── Preview ──────────────────────────────────────────────────────────── */}
      {hasFields ? (
        <div className="ai-proposal__preview">
          <button
            type="button"
            className="ai-proposal__preview-toggle"
            onClick={() => setIsPreviewOpen((open) => !open)}
            aria-expanded={isPreviewOpen}
          >
            <Eye size={14} aria-hidden="true" />
            {isPreviewOpen
              ? t('aiAssistant.approval.hidePreview')
              : t('aiAssistant.approval.showPreview')}
            <ChevronDown
              size={14}
              aria-hidden="true"
              className={isPreviewOpen ? 'ai-proposal__caret ai-proposal__caret--open' : 'ai-proposal__caret'}
            />
          </button>

          {isPreviewOpen ? (
            <dl className="ai-proposal__fields">
              {proposal.fields.map((field) => (
                <div className="ai-proposal__field" key={field.key}>
                  <dt className="ai-proposal__field-key">{field.key}</dt>
                  <dd className="ai-proposal__field-value">
                    {Array.isArray(field.value) ? field.value.join(', ') : String(field.value)}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      ) : (
        /* No preview to show is stated, so its absence is not read as an empty
           change that can be applied safely. */
        <p className="ai-proposal__no-preview">
          {t('aiAssistant.approval.noPreview')}
        </p>
      )}

      {/* ── Decision ─────────────────────────────────────────────────────────── */}
      {isPending ? (
        <>
          {missingContext.length > 0 ? (
            <p className="ai-proposal__blocked">
              {t('aiAssistant.approval.missingContext', {
                fields: missingContext
                  .map((key) => t(`aiAssistant.contextField.${key}`))
                  .join(', '),
              })}
            </p>
          ) : null}

          <div className="ai-proposal__actions">
            <button
              type="button"
              className="btn btn--primary ai-proposal__apply"
              disabled={!canApply}
              onClick={onApply}
            >
              {isApplying ? t('aiAssistant.approval.applying') : t('aiAssistant.approval.apply')}
            </button>
            <button
              type="button"
              className="btn btn--outline ai-proposal__reject"
              onClick={onReject}
            >
              <X size={14} aria-hidden="true" />
              {t('aiAssistant.approval.reject')}
            </button>
          </div>
        </>
      ) : null}
    </article>
  )
}

export default ProposalCard
