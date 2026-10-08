import { AlertTriangle, Undo2, X, Wand2 } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import ProposalCard from '@/components/ai/ProposalCard'

/**
 * The review queue.
 *
 * ── Why this has its own column ────────────────────────────────────────────────
 *
 * This is the only part of the assistant that can change something. A transcript grows
 * without bound and a history list is reference material; a pending proposal is a
 * decision. So it gets a panel of its own beside the conversation rather than a stack
 * under it, and on narrow screens it becomes a sheet the reader opens deliberately —
 * never something that pushes the composer out of reach.
 *
 * ── What appears here, and in what order ───────────────────────────────────────
 *
 * Everything the backend proposed, newest first, each with the user's decision already
 * folded in: a rejected proposal stays visible, dimmed, rather than vanishing. Removing
 * it would make the queue lie about what was offered, and the reader would have no way
 * to tell a refusal from a proposal that never arrived.
 *
 * ── The two things that are not proposals ──────────────────────────────────────
 *
 * A failed apply is reported *here*, next to the change it failed on, because the
 * conversation did its job — the message was delivered and a plan came back. And the
 * undo control lives at the bottom, under the changes it targets: it is a request to
 * roll back the most recent applied change, and it says out loud that the rollback
 * itself still needs the backend, so pressing it never claims success it does not have.
 */
function AiChangesPanel({
  proposals = [],
  pendingCount = 0,
  actionError = null,
  isApplying = null,
  context = {},
  draftRevision = null,
  onApply,
  onReject,
  onNewPlan,
  canUndo = false,
  onUndo,
  undoNotice = null,
  onDismissUndoNotice,
}) {
  const { t } = useTranslation()

  const hasProposals = proposals.length > 0

  return (
    <section className="ai-changes" aria-labelledby="ai-changes-title">
      <header className="ai-changes__head">
        <h2 className="ai-changes__title" id="ai-changes-title">
          <Wand2 size={15} aria-hidden="true" />
          {t('aiAssistant.changes.title')}
        </h2>

        {pendingCount > 0 ? (
          <span className="ai-changes__badge">
            {t('aiAssistant.approval.pendingCount', { count: pendingCount })}
          </span>
        ) : null}
      </header>

      <p className="ai-changes__description">{t('aiAssistant.changes.description')}</p>

      {/* The failure is reported beside the change, not in the transcript: the message
          that produced this proposal was delivered, and only the change was refused. */}
      {actionError ? (
        <p className="ai-changes__error" role="alert">
          <AlertTriangle size={14} aria-hidden="true" />
          <span>
            {t('aiAssistant.applyFailed')}: {actionError}
          </span>
        </p>
      ) : null}

      {hasProposals ? (
        <div className="ai-changes__list">
          {proposals.map((proposal) => (
            <ProposalCard
              key={proposal.key}
              proposal={proposal}
              context={context}
              draftRevision={draftRevision}
              isApplying={isApplying === proposal.key}
              onApply={() => onApply(proposal)}
              onReject={() => onReject(proposal)}
              onNewPlan={onNewPlan}
            />
          ))}
        </div>
      ) : (
        <div className="ai-changes__empty">
          <p className="ai-changes__empty-title">{t('aiAssistant.changes.emptyTitle')}</p>
          <p className="ai-changes__empty-text">{t('aiAssistant.changes.emptyText')}</p>
        </div>
      )}

      {canUndo ? (
        <div className="ai-changes__undo">
          <button type="button" className="btn btn--outline ai-changes__undo-btn" onClick={onUndo}>
            <Undo2 size={14} aria-hidden="true" />
            {t('aiAssistant.changes.undo')}
          </button>

          <p className="ai-changes__undo-hint">{t('aiAssistant.changes.undoHint')}</p>

          {/* The attempt's own result: honest, dismissible, and it says what is missing
              rather than implying the change was rolled back. */}
          {undoNotice ? (
            <p className="ai-changes__undo-notice" role="status">
              <span>{undoNotice.message}</span>
              <button
                type="button"
                className="ai-changes__undo-dismiss"
                onClick={onDismissUndoNotice}
                aria-label={t('common.close')}
              >
                <X size={13} aria-hidden="true" />
              </button>
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

export default AiChangesPanel
