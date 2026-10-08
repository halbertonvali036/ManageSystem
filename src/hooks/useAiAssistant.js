import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import aiService, { isAiBackendConnected } from '@/services/aiService'
import { getRequestErrorMessage } from '@/services/httpClient'
import useTranslation from '@/hooks/useTranslation'
import {
  AI_EXAMPLE_PROMPTS,
  AI_MESSAGE_MAX_LENGTH,
  AI_PROPOSAL_STATUS,
  getPendingAiProposals,
  normalizeAiMessageList,
  sortAiConversationSummaries,
} from '@/models/ai'

/**
 * Orchestrates the assistant panel.
 *
 * ── Why nothing appears optimistically ─────────────────────────────────────────
 *
 * A chat that echoes a user's message the instant they press Enter feels better and is
 * worse. It is worse because the echo is not evidence the message went anywhere: with
 * no backend connected it would sit in the transcript looking exactly like a delivered
 * message, and the user would reasonably conclude the assistant had received it. So a
 * message is appended only after the backend has returned it, and while a send is in
 * flight the composer shows the pending state instead.
 *
 * The draft survives a failed send. Losing a half-written prompt to a failed request is
 * a small cruelty that costs nothing to avoid, and it is the one place where keeping
 * local state is unambiguously the right call.
 *
 * ── Proposal state ─────────────────────────────────────────────────────────────
 *
 * A proposal starts `pending` and can be marked applied or rejected by the user. The
 * hook only marks one applied when `applyAiAction` resolves. When that call throws —
 * which is the current state of this project, always — the proposal stays pending and
 * an error is shown. There is no code path that marks a proposal applied without a
 * successful server response behind it, because the alternative is a UI that tells
 * people their site was published when it was not.
 *
 * ── Four failures, kept apart ─────────────────────────────────────────────────
 *
 * `error`, `sendError`, `historyError` and `actionError` are separate because they cost
 * the user different things and because each has its own way out. Failing to read the
 * current conversation means the page cannot show a transcript. Failing to send one
 * message costs that message, and the draft is still in the composer, so the way out is
 * to send it again. Failing to read the history costs a sidebar. Failing to apply a
 * proposal changes nothing at all and the proposal is still pending, so its way out is
 * to try Apply again.
 *
 * Collapsing them into one error would mean a failure in the cheapest part replaced the
 * one in the most important, and — worse — would offer a "resend your message" button
 * for a message that was delivered perfectly well.
 */
function useAiAssistant(workspaceId, { context } = {}) {
  const { t } = useTranslation()
  const [messages, setMessages] = useState([])
  const [suggestions, setSuggestions] = useState(null)
  const [conversations, setConversations] = useState(null)
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState(null)
  const [sendError, setSendError] = useState(null)
  const [historyError, setHistoryError] = useState(null)
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [settledProposals, setSettledProposals] = useState({})
  const [actionError, setActionError] = useState(null)
  const [isApplying, setIsApplying] = useState(null)
  const [undoNotice, setUndoNotice] = useState(null)

  /**
   * Which request the state on screen belongs to.
   *
   * Loading is *derived* from this rather than stored as its own boolean. Storing it
   * means setting state synchronously in the effect that starts the fetch, which
   * starts a second render pass before the fetch has done anything — and it gets the
   * "navigate to another workspace" case wrong, briefly showing the previous
   * workspace's conversation under the new heading. Comparing the request key against
   * what was loaded gives the right answer without a state write.
   */
  const [loadedFor, setLoadedFor] = useState(null)
  const requestKey = `${workspaceId ?? ''}`

  const conversationIdRef = useRef(null)
  const readVersion = useRef(0)
  const isConnected = isAiBackendConnected()
  const isLoading = loadedFor !== requestKey

  /**
   * Reads the conversation and the suggestions, keeping their failures apart.
   *
   * Returns whether it committed, so the effect can tell "still the current workspace"
   * from "the user moved on".
   *
   * A missing conversation is not a page-level error — it is the normal state of a fresh
   * workspace, and the empty state explains it. A failure to *read* one is worth saying
   * out loud, so only that branch sets `error`. A missing suggestion list costs the user
   * a shortcut rather than a page, so it is never promoted to an error either.
   *
   * The request key is recorded here rather than in the effect, so both callers commit
   * it the same way. A response that arrives after the user has moved on records the
   * *old* key, which leaves `isLoading` true for the new one — the derivation then keeps
   * showing the loading state rather than briefly displaying a stale conversation.
   */
  const read = useCallback(async () => {
    const version = ++readVersion.current
    const [conversationResult, suggestionResult] = await Promise.allSettled([
      aiService.getConversation(workspaceId, { context }),
      aiService.getSuggestions(workspaceId, { context }),
    ])

    if (version !== readVersion.current) return
    if (conversationResult.status === 'fulfilled') {
      const conversation = conversationResult.value
      setMessages(conversation?.messages ?? [])
      conversationIdRef.current = conversation?.id ?? null
      setActiveConversationId(conversation?.id ?? null)
      setError(null)
    } else {
      setMessages([])
      conversationIdRef.current = null
      setActiveConversationId(null)
      setError(getRequestErrorMessage(conversationResult.reason))
    }

    setSuggestions(suggestionResult.status === 'fulfilled' ? suggestionResult.value : null)
    setLoadedFor(`${workspaceId ?? ''}`)
  }, [workspaceId, context])

  /**
   * Reads the history sidebar on its own.
   *
   * Separate from `read` because it fails separately and because it is not needed to
   * render a transcript: a user with an unreadable history still has a working assistant
   * panel, and telling them otherwise would be wrong.
   *
   * A null result is stored as null, not as `[]`, and the sidebar distinguishes the two.
   * That distinction is the whole reason this list is a service read rather than a local
   * array: "no conversations yet" and "conversations cannot be listed" are different
   * sentences, and only one of them is an empty box.
   */
  const readHistory = useCallback(async () => {
    setIsHistoryLoading(true)
    try {
      const result = await aiService.getConversations(workspaceId, { context })
      setConversations(result)
      setHistoryError(null)
    } catch (caught) {
      setConversations(null)
      setHistoryError(getRequestErrorMessage(caught))
    } finally {
      setIsHistoryLoading(false)
    }
  }, [workspaceId, context])

  /**
   * Fetches on mount and whenever the workspace or context changes.
   *
   * This is a genuine external-system read, so an effect is the right tool — the data
   * lives outside React and the request has to be started by something outside the
   * render pass.
   */
  useEffect(() => {
    // `read` is async: every setState below runs after `await Promise.allSettled`, so
    // this is not the synchronous setState-in-render the rule is guarding against. The
    // conversation genuinely lives outside React and the read has to start here.
    read() // eslint-disable-line react/set-state-in-effect
  }, [read])

  useEffect(() => {
    readHistory() // eslint-disable-line react/set-state-in-effect
  }, [readHistory])

  /** Re-reads both, showing the loading states again while they run. */
  const reload = useCallback(async () => {
    setLoadedFor(null)
    await Promise.all([read(), readHistory()])
  }, [read, readHistory])

  /**
   * Opens a conversation from the history sidebar, or returns to the current one.
   *
   * Passing no id means "the workspace's live thread", which is what the New control
   * does — and it is a read, not a write. Creating a conversation is the backend's job:
   * a thread only comes into being when the first message is answered, so inventing one
   * here would produce an empty entry in the sidebar that nothing will ever fill. If the
   * backend names a conversation on the first reply, it appears in the history then.
   *
   * Selecting the conversation already open is a no-op rather than a re-read: clicking
   * the highlighted row should not blank the transcript and fill it again.
   *
   * A failure here is reported as a *history* failure, not a page one, and the messages
   * on screen are left alone. They are real — they are the conversation that was already
   * open — and replacing a readable transcript with an error card because a sidebar click
   * missed would throw away the only thing the user could still read.
   */
  const selectConversation = useCallback(
    async (conversationId) => {
      const nextId = conversationId ?? null
      if (!isConnected || isSending) return null
      if (nextId === null) {
        readVersion.current += 1
        conversationIdRef.current = null
        setActiveConversationId(null)
        setMessages([])
        setDraft('')
        setSettledProposals({})
        setSendError(null)
        setActionError(null)
        setUndoNotice(null)
        setHistoryError(null)
        setIsHistoryLoading(false)
        return null
      }
      if (nextId === activeConversationId) return null
      const version = ++readVersion.current

      setIsHistoryLoading(true)
      setHistoryError(null)
      try {
        const conversation = await aiService.getConversation(workspaceId, {
          conversationId: nextId,
          context,
        })
        if (version !== readVersion.current) return null
        if (!conversation) {
          setHistoryError(t('aiAssistant.history.notFound'))
          return null
        }
        setMessages(conversation.messages)
        conversationIdRef.current = conversation.id ?? nextId
        setActiveConversationId(conversation.id ?? null)
        return conversation
      } catch (caught) {
        setHistoryError(getRequestErrorMessage(caught))
        return null
      } finally {
        setIsHistoryLoading(false)
      }
    },
    [activeConversationId, isConnected, isSending, workspaceId, context, t],
  )

  /**
   * Sends the draft and appends what the backend actually returned.
   *
   * Returns the result of the send so a caller can clear a composer on success. The
   * draft is deliberately left in place when the send fails.
   */
  const send = useCallback(async () => {
    const message = draft.trim()
    if (!message || isSending) return null

    setIsSending(true)
    setSendError(null)

    try {
      const result = await aiService.sendAiMessage(workspaceId, {
        message,
        context,
        conversationId: conversationIdRef.current,
      })
      const confirmed = normalizeAiMessageList(result?.messages ?? [])
      // Only the server's own messages are added. Nothing is echoed locally.
      setMessages((current) => [...current, ...confirmed])
      // The backend names the conversation on the first exchange. Reading it from the
      // response rather than assuming one keeps the next send attached to the right
      // thread, and keeps the history sidebar pointing at the thread just written to.
      if (result?.conversationId) {
        conversationIdRef.current = result.conversationId
        setActiveConversationId(result.conversationId)
        readHistory()
      }
      setDraft('')
      return result
    } catch (caught) {
      setSendError(getRequestErrorMessage(caught))
      return null
    } finally {
      setIsSending(false)
    }
  }, [draft, isSending, workspaceId, context, readHistory])

  /**
   * Sends a suggestion or example as if it had been typed.
   *
   * Fills the composer rather than sending straight away. Autofiring on a click would
   * send a request the user had not finished reading, and would fail visibly in a way
   * that looks like the assistant is broken rather than absent.
   *
   * It also moves focus to the composer. A chip that fills a box the user then has to
   * find is a chip that only half worked, and the user has no way of knowing the text is
   * waiting there rather than gone.
   */
  const useSuggestion = useCallback((prompt) => {
    if (typeof prompt !== 'string' || prompt.trim() === '') return
    setDraft(prompt.trim().slice(0, AI_MESSAGE_MAX_LENGTH))
  }, [])

  /**
   * Re-sends the draft after a failure.
   *
   * Separate from `send` only in intent: the draft is still in the composer, so this is
   * the same call the send button makes. It exists so the error row can offer the obvious
   * next step without the page having to know that retrying means re-reading the draft.
   */
  const retrySend = useCallback(() => send(), [send])

  /**
   * Applies a proposed change.
   *
   * Marks the proposal applied only on a resolved call. On any failure the proposal
   * stays pending — it is still an outstanding suggestion, which is exactly what it is —
   * and the failure is reported next to the proposal, not as a send failure. The message
   * that produced this proposal was delivered; only the change was refused, and an error
   * offering to resend the message would be describing a problem that does not exist.
   */
  const applyProposal = useCallback(
    async (proposal) => {
      if (!proposal || isApplying) return null

      setIsApplying(proposal.key)
      setActionError(null)

      try {
        const result = await aiService.applyAiAction(workspaceId, {
          action: proposal.action,
          proposalId: proposal.id,
          context,
        })
        setSettledProposals((current) => ({
          ...current,
          [proposal.key]: AI_PROPOSAL_STATUS.APPLIED,
        }))
        // A notice about the previous change would sit under this one and read as a
        // failure of it, so the undo row starts over with the change just applied.
        setUndoNotice(null)
        return result
      } catch (caught) {
        setActionError(getRequestErrorMessage(caught))
        return null
      } finally {
        setIsApplying(null)
      }
    },
    [isApplying, workspaceId, context],
  )

  /** Records a rejection, which needs no server call — nothing was changed. */
  const rejectProposal = useCallback((proposal) => {
    if (!proposal) return
    setSettledProposals((current) => ({
      ...current,
      [proposal.key]: AI_PROPOSAL_STATUS.REJECTED,
    }))
  }, [])

  const clearUndoNotice = useCallback(() => setUndoNotice(null), [])

  /**
   * Proposals with the user's decision folded in.
   *
   * The base list comes from the messages and the decisions are layered on top, so a
   * decision cannot outlive the message it belongs to.
   *
   * Decisions are also keyed by conversation implicitly, through the message they came
   * from: switching conversations replaces `messages`, and the keys in a different thread
   * cannot collide with these. Nothing extra is needed, and nothing extra could be wrong.
   */
  const proposals = useMemo(
    () =>
      getPendingAiProposals(messages).map((proposal) => ({
        ...proposal,
        status: settledProposals[proposal.key] ?? proposal.status,
      })),
    [messages, settledProposals],
  )

  /**
   * What has actually been applied, newest last, and the change undo would target.
   *
   * Derived from `proposals` — which only contains proposals the backend sent — so
   * there is no separate list that could claim an application the transcript does not
   * show. `canUndo` is false unless that change is one the portal could ask to reverse,
   * so the control never appears on a publish it would have no way to take back.
   */
  const appliedProposals = useMemo(
    () => proposals.filter((proposal) => proposal.status === AI_PROPOSAL_STATUS.APPLIED),
    [proposals],
  )

  const lastAppliedProposal = appliedProposals[appliedProposals.length - 1] ?? null
  const canUndo = Boolean(lastAppliedProposal?.isUndoable)

  /**
   * Undo, as a UI foundation rather than a rollback.
   *
   * Pressing it reverts nothing: there is no rollback call to make, and inventing one
   * that reported success would be the same class of lie as marking an unapplied
   * proposal applied. So the attempt resolves to an honest notice that sits beside the
   * change it refers to, and the real rollback arrives with the backend.
   */
  const undoLastChange = useCallback(() => {
    if (!canUndo || !lastAppliedProposal) return
    setUndoNotice({
      key: lastAppliedProposal.key,
      message: t('aiAssistant.changes.undoUnavailable'),
    })
  }, [canUndo, lastAppliedProposal, t])

  /**
   * Suggestions from the backend, or the declared examples when there are none.
   *
   * The examples gain a `key` here rather than in the model: `AI_EXAMPLE_PROMPTS`
   * entries are declared as copy, not as list rows, and the component renders whatever
   * list it is handed — so the row identity is added at the one place the two meet.
   */
  const availableSuggestions = useMemo(
    () =>
      suggestions ??
      AI_EXAMPLE_PROMPTS.map((item) => ({ ...item, key: item.id, isExample: true })),
    [suggestions],
  )

  const isUsingExamples = suggestions === null

  /** Newest first, with the open conversation flagged for the sidebar. */
  const conversationList = useMemo(
    () =>
      sortAiConversationSummaries(conversations ?? []).map((summary) => ({
        ...summary,
        isActive: summary.id === activeConversationId,
      })),
    [conversations, activeConversationId],
  )

  return {
    messages,
    suggestions: availableSuggestions,
    isUsingExamples,
    proposals,
    pendingProposals: proposals.filter(
      (proposal) => proposal.status === AI_PROPOSAL_STATUS.PENDING,
    ),
    conversationList,
    activeConversationId,
    selectConversation,
    isHistoryAvailable: conversations !== null,
    isHistoryLoading,
    historyError,
    draft,
    setDraft,
    send,
    retrySend,
    useSuggestion,
    applyProposal,
    rejectProposal,
    // Undo foundation: the change it would target, whether that change is reversible
    // at all, the attempt itself, and the honest notice the attempt produces.
    lastAppliedProposal,
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
  }
}

export default useAiAssistant
