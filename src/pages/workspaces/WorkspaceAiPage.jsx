import { useCallback, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { AlertTriangle, Sparkles } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import useWorkspace from '@/hooks/useWorkspace'
import useAiContext from '@/hooks/useAiContext'
import useAiAssistant from '@/hooks/useAiAssistant'
import Card from '@/components/common/Card'
import WorkspaceBreadcrumb from '@/components/workspaces/WorkspaceBreadcrumb'
import WorkspaceSectionNav from '@/components/workspaces/WorkspaceSectionNav'
import ConversationSidebar from '@/components/ai/ConversationSidebar'
import ChatMessage from '@/components/ai/ChatMessage'
import ChatComposer from '@/components/ai/ChatComposer'
import ChatEmptyState from '@/components/ai/ChatEmptyState'
import ChatThinking from '@/components/ai/ChatThinking'
import ChatSendError from '@/components/ai/ChatSendError'
import SuggestedPrompts from '@/components/ai/SuggestedPrompts'
import ProposalCard from '@/components/ai/ProposalCard'
import AiContextPanel from '@/components/ai/AiContextPanel'
import ActionCatalog from '@/components/ai/ActionCatalog'

/**
 * `AI köməkçi` — the assistant panel.
 *
 * ── What this page is ──────────────────────────────────────────────────────────
 *
 * Three surfaces over one service: a conversation, a history of past conversations, and a
 * review queue for proposed changes. The point of building it now is that the shapes are
 * settled — when the AI integration arrives, it fills these components in rather than
 * redesigning them, and nothing in the UI has to be rewritten to stop pretending.
 *
 * ── What it will not do ────────────────────────────────────────────────────────
 *
 * It will not show a reply that no model produced, it will not list a conversation that
 * was never had, and it will not mark a change applied that no backend performed. Each of
 * those is one line of code and each is the difference between a foundation and a fake.
 * When the assistant is not connected the page says so and the composer is disabled — a
 * control that cannot work is worse than a control that admits it.
 *
 * ── Layout ─────────────────────────────────────────────────────────────────────
 *
 * History, conversation, review. The order is not aesthetic: a proposal that is about to
 * change a site is the most consequential thing on the page, so the review queue gets its
 * own column rather than sitting under the transcript. Below 1280px the review column
 * folds under the conversation, and below 1024px the history folds under that — chat first
 * at every width, because a user who came here to ask something should never have to
 * scroll to find the box to ask it in.
 *
 * ── Context ────────────────────────────────────────────────────────────────────
 *
 * Built by `useAiContext` from the route and the query string, so only validated values
 * are ever sent. That hook owns the allowlist decision; this page just passes the result
 * to the panel, the proposal cards and the service. See the hook for why the URL is the
 * source and the model for what may leave the browser.
 */
function WorkspaceAiPage() {
  const { workspaceId } = useParams()
  const { t } = useTranslation()
  const { workspace, isLoading: workspaceLoading } = useWorkspace(workspaceId)
  const transcriptRef = useRef(null)

  const { context, missingKeys } = useAiContext()

  const {
    messages,
    suggestions,
    isUsingExamples,
    proposals,
    pendingProposals,
    conversationList,
    selectConversation,
    isHistoryAvailable,
    isHistoryLoading,
    historyError,
    draft,
    setDraft,
    send,
    retrySend,
    useSuggestion,
    applyProposal,
    rejectProposal,
    isLoading,
    isSending,
    isApplying,
    error,
    sendError,
    actionError,
    isConnected,
    reload,
  } = useAiAssistant(workspaceId, { context })

  // Keep the newest message in view as the conversation grows, and while a send is in
  // flight so the thinking row does not appear off-screen below a long transcript.
  // `context` is in the dependencies because deep-linking a different site, page or block
  // re-reads the conversation, and the newly loaded transcript starts at the bottom.
  useEffect(() => {
    const node = transcriptRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [messages.length, isSending, context])

  /**
   * The history sidebar's new-conversation control.
   *
   * Goes back to the workspace's live thread rather than creating anything. A thread
   * comes into being when the backend answers a first message, so there is nothing to
   * create here yet — and a sidebar entry for a conversation nobody has had would be a
   * row that opens onto nothing.
   */
  const handleNewConversation = useCallback(() => {
    selectConversation(null)
  }, [selectConversation])

  const hasMessages = messages.length > 0
  const showEmptyState = !isLoading && !hasMessages

  return (
    <div className="workspaces-page ai-page">
      <WorkspaceBreadcrumb workspace={workspace} section="ai" />
      <WorkspaceSectionNav workspaceId={workspaceId} />

      <header className="workspaces-page__head">
        <div className="workspaces-page__headline">
          <h1 className="workspaces-page__title">
            <Sparkles size={22} aria-hidden="true" />
            {t('aiAssistant.pageTitle')}
          </h1>
          <p className="page-description">{t('aiAssistant.pageDescription')}</p>
        </div>
      </header>

      {!isConnected ? (
        <p className="ai-page__notice" role="status">
          <Sparkles size={14} aria-hidden="true" />
          {t('aiAssistant.notice')}
        </p>
      ) : null}

      {/* A conversation that could not be read replaces the transcript rather than
          sitting above it: showing an empty chat under an error would invite the reading
          that this assistant has nothing to say, which is the opposite of what happened. */}
      {error ? (
        <Card>
          <div className="table-state table-state--error">
            <h2 className="table-state__title">{t('aiAssistant.loadFailed')}</h2>
            <p className="table-state__text">{t('aiAssistant.loadFailedText')}</p>
            <p className="ai-page__error-detail">{error}</p>
            <button type="button" className="btn btn--primary" onClick={reload}>
              {t('common.retry')}
            </button>
          </div>
        </Card>
      ) : (
        <div className="ai-layout">
          <div className="ai-layout__history">
            <ConversationSidebar
              conversations={conversationList}
              isAvailable={isHistoryAvailable}
              isLoading={isHistoryLoading}
              error={historyError}
              onSelect={selectConversation}
              onRetry={reload}
              onNew={handleNewConversation}
              isDisabled={!isConnected}
            />
          </div>

          <Card className="ai-layout__chat">
            <div className="ai-chat">
              <h2 className="visually-hidden">{t('aiAssistant.chat.heading')}</h2>

              {/* `aria-live` on the transcript, not on the page: a reader should be told
                  that a reply arrived, not that a card somewhere re-rendered. */}
              <div
                className="ai-chat__transcript"
                ref={transcriptRef}
                role="log"
                aria-live="polite"
                aria-label={t('aiAssistant.chat.heading')}
              >
                {isLoading || workspaceLoading ? (
                  <div className="page-status">
                    <span className="spinner" aria-hidden="true" />
                    {t('aiAssistant.chat.loading')}
                  </div>
                ) : showEmptyState ? (
                  <ChatEmptyState isConnected={isConnected} />
                ) : (
                  <ul className="ai-messages">
                    {messages.map((message) => (
                      <ChatMessage key={message.key} message={message} />
                    ))}
                  </ul>
                )}
              </div>

              {/* Below the transcript rather than inside it: a thinking row is a fact
                  about the request, and putting it in the log would announce it as a
                  message that does not exist. */}
              {isSending ? <ChatThinking /> : null}

              {sendError ? (
                <ChatSendError
                  message={sendError}
                  onRetry={retrySend}
                  canRetry={isConnected && !isSending && draft.trim() !== ''}
                />
              ) : null}

              <ChatComposer
                draft={draft}
                onDraftChange={setDraft}
                onSend={send}
                isSending={isSending}
                isDisabled={!isConnected}
                disabledReasonKey="aiAssistant.chat.notConnected"
              />
            </div>
          </Card>

          <aside className="ai-layout__side" aria-label={t('aiAssistant.side.heading')}>
            <Card>
              <SuggestedPrompts
                suggestions={suggestions}
                isUsingExamples={isUsingExamples}
                onSelect={useSuggestion}
              />
            </Card>

            {proposals.length > 0 ? (
              <Card>
                <div className="ai-proposals">
                  <h2 className="card__title">{t('aiAssistant.approval.title')}</h2>
                  <p className="ai-proposals__description">
                    {t('aiAssistant.approval.description')}
                  </p>

                  {pendingProposals.length > 0 ? (
                    <p className="ai-proposals__count">
                      {t('aiAssistant.approval.pendingCount', {
                        count: pendingProposals.length,
                      })}
                    </p>
                  ) : null}

                  {/* Reported here rather than in the chat, because nothing about the
                      conversation went wrong: the change was refused. The proposal below
                      is still pending, so Apply is still the way to try again. */}
                  {actionError ? (
                    <p className="ai-proposals__error" role="alert">
                      <AlertTriangle size={14} aria-hidden="true" />
                      <span>
                        {t('aiAssistant.applyFailed')}: {actionError}
                      </span>
                    </p>
                  ) : null}

                  <div className="ai-proposals__list">
                    {proposals.map((proposal) => (
                      <ProposalCard
                        key={proposal.key}
                        proposal={proposal}
                        context={context}
                        isApplying={isApplying === proposal.key}
                        onApply={() => applyProposal(proposal)}
                        onReject={() => rejectProposal(proposal)}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            ) : null}

            <Card>
              <AiContextPanel context={context} missingKeys={missingKeys} />
            </Card>

            <Card>
              <ActionCatalog context={context} />
            </Card>
          </aside>
        </div>
      )}
    </div>
  )
}

export default WorkspaceAiPage
