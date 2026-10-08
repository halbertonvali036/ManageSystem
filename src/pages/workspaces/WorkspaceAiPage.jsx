import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import useWorkspace from '@/hooks/useWorkspace'
import useWorkspaceSites from '@/hooks/useWorkspaceSites'
import useMediaQuery from '@/hooks/useMediaQuery'
import useAiContext from '@/hooks/useAiContext'
import useAiAssistant from '@/hooks/useAiAssistant'
import useAiSiteDraft from '@/hooks/useAiSiteDraft'
import Card from '@/components/common/Card'
import WorkspaceBreadcrumb from '@/components/workspaces/WorkspaceBreadcrumb'
import WorkspaceSectionNav from '@/components/workspaces/WorkspaceSectionNav'
import ConversationSidebar from '@/components/ai/ConversationSidebar'
import ChatHeader from '@/components/ai/ChatHeader'
import ChatMessage from '@/components/ai/ChatMessage'
import ChatComposer from '@/components/ai/ChatComposer'
import ChatEmptyState from '@/components/ai/ChatEmptyState'
import ChatThinking from '@/components/ai/ChatThinking'
import ChatSendError from '@/components/ai/ChatSendError'
import SuggestedPrompts from '@/components/ai/SuggestedPrompts'
import AiChangesPanel from '@/components/ai/AiChangesPanel'
import AiContextPanel from '@/components/ai/AiContextPanel'
import AiPlanCard from '@/components/ai/AiPlanCard'
import ActionCatalog from '@/components/ai/ActionCatalog'
import { BLOCK_TYPE_LABELS, getBlockById, getPageById } from '@/models/siteEditor'
import { getSiteTheme } from '@/models/siteTheme'
import { getAiPlan, isAiPlanLimitReached } from '@/models/aiPlan'

/**
 * `AI köməkçi` — the assistant workspace.
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
 * ── Layout: three columns, two drawers ─────────────────────────────────────────
 *
 * History, conversation, review — the review queue gets its own column because it is the
 * only thing here that can change someone's site. The three columns only exist while
 * there is room for all of them: at 1280px history becomes a drawer behind its header
 * button, and at 720px the review column becomes a bottom sheet. The conversation is
 * never the thing that collapses, at any width — a user who came here to ask something
 * should never have to scroll to find the box to ask it in.
 *
 * The two panel states are written onto the layout as data attributes rather than
 * swapped as different trees, so the DOM order — history, chat, review — stays stable
 * and the stylesheet alone decides which of them is a column, a drawer or a sheet.
 *
 * ── Context ────────────────────────────────────────────────────────────────────
 *
 * Built by `useAiContext` from the route and the query string, so only validated values
 * are ever sent. The open site's draft is read separately, and only to put names on those
 * values: "Home page" instead of `p_9f2a` in the header and the context panel, and its
 * `updatedAt` as the revision a proposal is compared against for staleness. See the hook
 * for why the URL is the source and the model for what may leave the browser.
 */
function WorkspaceAiPage() {
  const { workspaceId } = useParams()
  const { t } = useTranslation()
  const { workspace, isLoading: workspaceLoading } = useWorkspace(workspaceId)
  const { sites } = useWorkspaceSites(workspaceId, { enabled: Boolean(workspaceId) })
  const transcriptRef = useRef(null)
  const composerRef = useRef(null)

  const isMobile = useMediaQuery('(max-width: 720px)')
  const isCompact = useMediaQuery('(max-width: 1280px)')

  // One state per real surface. The history drawer is closed until asked for; the review
  // column is present from the start everywhere it is a column, and absent on phones
  // until the sheet is raised. Deriving the initial values from the breakpoints means no
  // effect has to correct them after the first paint.
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isChangesOpen, setIsChangesOpen] = useState(!isMobile)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [historyNotice, setHistoryNotice] = useState(null)

  const { context, missingKeys } = useAiContext()
  const { draft: siteDraft } = useAiSiteDraft(context.siteId)

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
    canUndo,
    undoLastChange,
    undoNotice,
    clearUndoNotice,
    isLoading,
    isSending,
    isApplying,
    error,
    sendError,
    actionError,
    isConnected,
    reload,
  } = useAiAssistant(workspaceId, { context })

  /* ── Naming the context ────────────────────────────────────────────────────────
     The URL carries ids, and an id is the one thing a person should never have to read.
     These names come from the sites list and the open draft — the same documents the
     editor already normalises — so nothing new is published anywhere and a missing name
     simply stays missing rather than being guessed. */
  const site = useMemo(
    () => sites.find((entry) => entry.id === context.siteId) ?? null,
    [sites, context.siteId],
  )
  const page = useMemo(
    () => (siteDraft && context.activePageId ? getPageById(siteDraft, context.activePageId) : null),
    [siteDraft, context.activePageId],
  )
  const block = useMemo(
    () => (page && context.selectedBlockId ? getBlockById(page, context.selectedBlockId) : null),
    [page, context.selectedBlockId],
  )
  const theme = useMemo(
    () => (context.currentTheme ? getSiteTheme(context.currentTheme) : null),
    [context.currentTheme],
  )

  const names = useMemo(
    () => ({
      workspaceId: workspace?.name ?? null,
      siteId: site?.name ?? null,
      activePageId: page?.name ?? null,
      selectedBlockId:
        block?.type && BLOCK_TYPE_LABELS[block.type] ? t(BLOCK_TYPE_LABELS[block.type]) : null,
      currentTheme: theme?.nameKey ? t(theme.nameKey) : null,
    }),
    [workspace, site, page, block, theme, t],
  )

  /**
   * The line under the assistant's name.
   *
   * An id whose name cannot be resolved falls back to the id itself rather than to a
   * blank: if a site is open, the header should say *something* about which one. What it
   * never does is claim nothing is open — "no site selected" is reserved for the case
   * where the URL really does not name one, so the honest state and the unresolved one
   * read differently.
   */
  const contextItems = useMemo(
    () =>
      [
        workspace?.name ?? null,
        names.siteId ?? (context.siteId || t('aiAssistant.chat.noSite')),
        names.activePageId ?? (context.activePageId || t('aiAssistant.chat.noPage')),
        names.selectedBlockId ?? context.selectedBlockId ?? null,
        names.currentTheme ?? null,
      ].filter((item) => item !== null && item !== ''),
    [workspace, names, context, t],
  )

  // There is no plan endpoint yet, so this is the declared placeholder — and the card
  // labels it as such. `isAiPlanLimitReached` therefore reads false today: the composer
  // is only ever locked by numbers a backend actually reported.
  const plan = getAiPlan(null)
  const isLimitReached = isAiPlanLimitReached(plan)

  // Keep the newest message in view as the conversation grows, and while a send is in
  // flight so the thinking row does not appear off-screen below a long transcript.
  // `context` is in the dependencies because deep-linking a different site, page or block
  // re-reads the conversation, and the newly loaded transcript starts at the bottom.
  useEffect(() => {
    const node = transcriptRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [messages.length, isSending, context])

  // Escape is how a drawer is dismissed on a keyboard. The listener only exists while a
  // drawer could be open, so a desktop session carries no no-op handler at all.
  useEffect(() => {
    if (!isCompact) return undefined

    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      setIsHistoryOpen(false)
      setIsSheetOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isCompact])

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
    setHistoryNotice(null)
    if (isCompact) setIsHistoryOpen(false)
  }, [selectConversation, isCompact])

  const handleSelectConversation = useCallback(
    (conversationId) => {
      selectConversation(conversationId)
      setHistoryNotice(null)
      // Choosing a thread from a drawer means the drawer has done its job; leaving it
      // open would cover the transcript it just loaded.
      if (isCompact) setIsHistoryOpen(false)
    },
    [selectConversation, isCompact],
  )

  /**
   * Deleting a conversation.
   *
   * There is no delete call in the service, so confirming one reports that instead of
   * pretending: the row is not removed, nothing changes on screen, and the sidebar says
   * what actually happened. A row that disappeared and reappeared on reload would be the
   * same class of lie as a row that was never there.
   */
  const handleDeleteConversation = useCallback(() => {
    setHistoryNotice(t('aiAssistant.history.deleteUnavailable'))
  }, [t])

  const handleToggleHistory = useCallback(() => setIsHistoryOpen((open) => !open), [])

  const handleToggleChanges = useCallback(() => {
    if (isMobile) setIsSheetOpen((open) => !open)
    else setIsChangesOpen((open) => !open)
  }, [isMobile])

  const handleDismissDrawers = useCallback(() => {
    setIsHistoryOpen(false)
    setIsSheetOpen(false)
  }, [])

  /** Where the "this reply proposed N changes" link sends the reader. */
  const handleShowChanges = useCallback(() => {
    if (isMobile) setIsSheetOpen(true)
    else if (isCompact) setIsChangesOpen(true)

    // After the panel has been made visible, not before: scrolling to an element the
    // stylesheet has just revealed is the only frame in which it has a position.
    requestAnimationFrame(() => {
      document
        .getElementById('ai-changes-panel')
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }, [isMobile, isCompact])

  /**
   * The stale-plan link.
   *
   * A plan that no longer matches the draft cannot be applied, so the way forward is a
   * new request. This points at the composer rather than writing anything itself: the
   * prompt is filled in and focus moves, and pressing Send is still the user's action.
   */
  const handleNewPlan = useCallback(() => {
    setDraft(t('aiAssistant.approval.newPlanPrompt'))
    composerRef.current?.focus()
  }, [setDraft, t])

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
        <div
          className="ai-layout"
          data-history-open={isHistoryOpen ? 'true' : 'false'}
          data-changes-open={isChangesOpen ? 'true' : 'false'}
          data-sheet-open={isSheetOpen ? 'true' : 'false'}
        >
          <div className="ai-layout__history" id="ai-history-panel">
            <ConversationSidebar
              conversations={conversationList}
              isAvailable={isHistoryAvailable}
              isLoading={isHistoryLoading}
              error={historyError}
              notice={historyNotice}
              onSelect={handleSelectConversation}
              onRetry={reload}
              onNew={handleNewConversation}
              onDelete={handleDeleteConversation}
              isDisabled={!isConnected}
            />
          </div>

          <div className="ai-layout__main">
            <Card className="ai-layout__chat">
              <div className="ai-chat">
                <ChatHeader
                  contextItems={contextItems}
                  isConnected={isConnected}
                  pendingCount={pendingProposals.length}
                  isHistoryOpen={isHistoryOpen}
                  isChangesOpen={isMobile ? isSheetOpen : isChangesOpen}
                  onToggleHistory={handleToggleHistory}
                  onToggleChanges={handleToggleChanges}
                />

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
                        <ChatMessage
                          key={message.key}
                          message={message}
                          onSelectChanges={handleShowChanges}
                        />
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

                {/* Above the composer rather than in the side panel: suggestions are a way
                    to start writing, and a prompt list in another column is a prompt list
                    most readers never find. */}
                <SuggestedPrompts
                  suggestions={suggestions}
                  isUsingExamples={isUsingExamples}
                  onSelect={useSuggestion}
                  variant="rail"
                />

                <ChatComposer
                  draft={draft}
                  onDraftChange={setDraft}
                  onSend={send}
                  isSending={isSending}
                  isDisabled={!isConnected}
                  disabledReasonKey="aiAssistant.chat.notConnected"
                  isLimitReached={isLimitReached}
                  inputRef={composerRef}
                />
              </div>
            </Card>
          </div>

          <aside
            className="ai-layout__changes"
            id="ai-changes-panel"
            aria-label={t('aiAssistant.side.heading')}
          >
            <Card>
              <AiChangesPanel
                proposals={proposals}
                pendingCount={pendingProposals.length}
                actionError={actionError}
                isApplying={isApplying}
                context={context}
                draftRevision={siteDraft?.updatedAt ?? null}
                onApply={applyProposal}
                onReject={rejectProposal}
                onNewPlan={handleNewPlan}
                canUndo={canUndo}
                onUndo={undoLastChange}
                undoNotice={undoNotice}
                onDismissUndoNotice={clearUndoNotice}
              />
            </Card>

            <Card>
              <AiPlanCard />
            </Card>

            <Card>
              <AiContextPanel context={context} missingKeys={missingKeys} names={names} />
            </Card>

            <Card>
              <ActionCatalog context={context} />
            </Card>
          </aside>

          {/* One dismiss for every overlay. It is a button rather than a div so Escape
              has a visible counterpart for pointer and keyboard users alike, and the
              stylesheet decides at which widths it exists at all. */}
          <button
            type="button"
            className="ai-layout__scrim"
            onClick={handleDismissDrawers}
            aria-label={t('common.close')}
            tabIndex={-1}
          />
        </div>
      )}
    </div>
  )
}

export default WorkspaceAiPage
