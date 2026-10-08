import { useState } from 'react'
import {
  Check,
  ChevronDown,
  Database,
  Eye,
  FilePlus2,
  FormInput,
  Globe,
  LayoutTemplate,
  Palette,
  Pencil,
  Rocket,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Type,
  X,
} from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import {
  AI_ACTION_OPERATION_LABEL_KEYS,
  AI_ACTION_TARGET_KEYS,
  AI_PROPOSAL_STATUS,
  AI_RISK,
  AI_RISK_LABEL_KEYS,
  getMissingAiContext,
  isAiProposalStale,
} from '@/models/ai'

/**
 * What one proposed operation would do, and the decision to accept or refuse it.
 *
 * ── The order is fixed on purpose ──────────────────────────────────────────────
 *
 * Preview, then decide. Apply stays disabled until the details have been opened once.
 * A button that changes a published site should not be one click away from something
 * that only looks like a suggestion, and requiring a deliberate look is the cheapest
 * way to make that true. The preview toggle stays available after a decision, so an
 * applied change can be read back afterwards instead of collapsing into a status word.
 *
 * ── The card reads before it offers ────────────────────────────────────────────
 *
 * Icon, operation name, target, risk, then the description. The operation name comes
 * from `operation.*` — "Update text", not `updateBlock` — because the wire name is a
 * contract with the backend, not a thing a person should be asked to parse. Risk is
 * stated as safe / reversible / destructive, and destructive is the one that opens a
 * confirmation: publishing and schema changes confirm on the frontend, which stops a
 * mis-click but is not a permission — the backend still decides what happens.
 *
 * ── Three ways Apply is unavailable, kept apart ────────────────────────────────
 *
 * Missing context ("this needs a page open"), a stale plan ("the draft moved on, ask
 * for a new one"), and a destructive action awaiting confirmation. They are separate
 * sentences because they have separate fixes, and a single generic "cannot apply"
 * would leave the reader with nowhere to go.
 *
 * ── What this component cannot do ──────────────────────────────────────────────
 *
 * It cannot mark a change applied — it is handed a status. No amount of clicking
 * produces a panel claiming a site was published that was not.
 */
function ProposalCard({
  proposal,
  context,
  isApplying = false,
  draftRevision = null,
  onApply,
  onReject,
  onNewPlan,
}) {
  const { t } = useTranslation()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  const isApplied = proposal.status === AI_PROPOSAL_STATUS.APPLIED
  const isRejected = proposal.status === AI_PROPOSAL_STATUS.REJECTED
  const isPending = proposal.status === AI_PROPOSAL_STATUS.PENDING

  const missingContext = getMissingAiContext(proposal.action, context)
  const hasFields = proposal.fields.length > 0
  const isStale = isPending && isAiProposalStale(proposal, draftRevision)
  const isDestructive = proposal.risk === AI_RISK.DESTRUCTIVE

  /**
   * The gate this component's comment claims.
   *
   * Apply requires the preview to have been opened. Two reasons, and both are about
   * the user rather than the code: a control that changes a site should not be one
   * click away from something that merely looks like a suggestion, and someone who
   * applies a change without reading it will not notice what it did until after it did.
   * A proposal with no fields has nothing to preview, so the gate cannot be satisfied
   * and Apply stays unavailable — the panel says so in words rather than leaving a
   * button that would apply an unspecified change.
   */
  const hasReviewed = isPreviewOpen || !hasFields
  const canApply =
    isPending &&
    hasReviewed &&
    hasFields &&
    !isApplying &&
    !isStale &&
    missingContext.length === 0

  const statusLabel = isApplied
    ? t('aiAssistant.approval.applied')
    : isRejected
      ? t('aiAssistant.approval.rejected')
      : t('aiAssistant.approval.pending')

  const riskLabel = t(AI_RISK_LABEL_KEYS[proposal.risk] ?? AI_RISK_LABEL_KEYS[AI_RISK.SAFE])
  const ActionIcon = PROPOSAL_ICONS[proposal.action] ?? Pencil

  const handleApplyClick = () => {
    if (!canApply) return
    // Destructive actions confirm first. This is a frontend stop, not a permission:
    // it exists so a stray Enter cannot publish a site, and the backend remains the
    // thing that decides whether the change happens.
    if (proposal.isConfirmationRequired) {
      setIsConfirming(true)
      return
    }
    onApply()
  }

  return (
    <article
      className={[
        'ai-proposal',
        isApplied ? 'ai-proposal--applied' : '',
        isRejected ? 'ai-proposal--rejected' : '',
        isStale ? 'ai-proposal--stale' : '',
        isDestructive ? 'ai-proposal--destructive' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <header className="ai-proposal__head">
        <span
          className={[
            'ai-proposal__icon',
            isDestructive ? 'ai-proposal__icon--destructive' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden="true"
        >
          <ActionIcon size={16} />
        </span>

        <div className="ai-proposal__titles">
          <p className="ai-proposal__action">
            {t(AI_ACTION_OPERATION_LABEL_KEYS[proposal.action])}
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

      <p className="ai-proposal__risk">
        <span
          className={[
            'ai-proposal__risk-badge',
            `ai-proposal__risk-badge--${proposal.risk}`,
          ].join(' ')}
        >
          {proposal.risk === AI_RISK.DESTRUCTIVE ? (
            <ShieldAlert size={11} aria-hidden="true" />
          ) : proposal.risk === AI_RISK.REVERSIBLE ? (
            <RotateCcw size={11} aria-hidden="true" />
          ) : (
            <ShieldCheck size={11} aria-hidden="true" />
          )}
          {riskLabel}
        </span>
        {isDestructive ? (
          <span className="ai-proposal__risk-note">
            {t('aiAssistant.approval.confirmNote')}
          </span>
        ) : null}
      </p>

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
              className={
                isPreviewOpen ? 'ai-proposal__caret ai-proposal__caret--open' : 'ai-proposal__caret'
              }
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
        /* No preview to show is stated, so its absence is not read as an empty change
           that can be applied safely. */
        <p className="ai-proposal__no-preview">{t('aiAssistant.approval.noPreview')}</p>
      )}

      {/* ── Decision ─────────────────────────────────────────────────────────── */}
      {isPending ? (
        <>
          {isStale ? (
            <p className="ai-proposal__stale" role="status">
              <ShieldAlert size={14} aria-hidden="true" />
              <span>
                <strong>{t('aiAssistant.approval.staleTitle')}</strong>
                {t('aiAssistant.approval.staleText')}
              </span>
            </p>
          ) : null}

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
              className="btn btn--outline ai-proposal__preview-action"
              onClick={() => setIsPreviewOpen(true)}
              disabled={!hasFields}
            >
              <Eye size={14} aria-hidden="true" />
              {t('aiAssistant.approval.preview')}
            </button>

            <button
              type="button"
              className="btn btn--primary ai-proposal__apply"
              disabled={!canApply}
              onClick={handleApplyClick}
            >
              {isApplying ? t('aiAssistant.approval.applying') : t('aiAssistant.approval.apply')}
            </button>

            <button
              type="button"
              className="btn btn--outline ai-proposal__reject"
              onClick={onReject}
              disabled={isApplying}
            >
              <X size={14} aria-hidden="true" />
              {t('aiAssistant.approval.reject')}
            </button>
          </div>

          {isStale ? (
            <button type="button" className="btn btn--ghost ai-proposal__new-plan" onClick={onNewPlan}>
              {t('aiAssistant.approval.newPlan')}
            </button>
          ) : null}
        </>
      ) : null}

      {isApplied && proposal.isUndoable ? (
        <p className="ai-proposal__undo-hint">{t('aiAssistant.changes.undoHint')}</p>
      ) : null}

      <ConfirmDialog
        open={isConfirming}
        title={t('aiAssistant.confirm.title', {
          action: t(AI_ACTION_OPERATION_LABEL_KEYS[proposal.action]),
        })}
        message={t(`aiAssistant.confirm.message.${proposal.action}`)}
        confirmLabel={t('aiAssistant.confirm.confirm')}
        confirmingLabel={t('aiAssistant.confirm.confirming')}
        cancelLabel={t('common.cancel')}
        closeLabel={t('common.close')}
        isConfirming={isApplying}
        onConfirm={() => {
          setIsConfirming(false)
          onApply()
        }}
        onCancel={() => setIsConfirming(false)}
      />
    </article>
  )
}

/** One icon per allowlisted action. The map covers every action; the fallback is
 *  only reachable if a future action is declared without one here. */
const PROPOSAL_ICONS = Object.freeze({
  createSite: Globe,
  createPage: FilePlus2,
  addSection: LayoutTemplate,
  updateBlock: Type,
  updateTheme: Palette,
  createModel: Database,
  createForm: FormInput,
  publishSite: Rocket,
})

export default ProposalCard
