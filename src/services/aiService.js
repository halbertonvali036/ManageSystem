import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'
import {
  buildAiContext,
  normalizeAiConversation,
  normalizeAiConversationSummaryList,
  normalizeAiProposal,
  normalizeAiSuggestionList,
  readAiConversationListPayload,
  readAiMessagePayload,
  readAiSuggestionPayload,
  AI_MESSAGE_MAX_LENGTH,
} from '@/models/ai'

/**
 * AI assistant service.
 *
 * ── The contract ───────────────────────────────────────────────────────────────
 *
 * Reads and writes are treated differently here, and the difference is the point.
 *
 *   Reads (`getConversations`, `getConversation`, `getSuggestions`) resolve to null when
 *          no backend is connected. Null means "not available", and the page renders an
 *          honest notice instead of an empty-looking list that could be mistaken for a
 *          real one. An empty array would say "there are no conversations", which is a
 *          different claim, and a wrong one.
 *
 *   Writes (`sendAiMessage`, `applyAiAction`) throw `BackendNotConnectedError`.
 *
 * The asymmetry is deliberate and it is the honest one. A read that fails can be shown
 * as missing. A write that fails cannot: `sendAiMessage` is expected to produce an
 * assistant reply, and the only way to satisfy that expectation without a backend is to
 * invent a reply. So it throws instead, and the UI says the assistant is not connected.
 * `applyAiAction` is the same reasoning — returning a fabricated "applied" result would
 * be the single most damaging thing this file could do, because a user would then be
 * told a site was published that was never published.
 *
 * ── Credentials ────────────────────────────────────────────────────────────────
 *
 * Nothing here sends a provider name, a model name, a key or a system prompt. This
 * service speaks only to the platform backend, which owns the AI provider
 * credentials. A provider key in a browser bundle is readable by every user and
 * spendable by anyone who copies it, so it belongs on the server and nowhere else.
 * `buildAiContext` is the only place a request body is assembled from the caller's
 * context, and it reads a five-value allowlist — see the model for why an allowlist is
 * the only acceptable shape for that list.
 */

const isBackendConnected = () => Boolean(config.api.baseUrl)

/**
 * Whether the assistant can be reached at all.
 *
 * Exported so the page can say "not connected" up front instead of letting someone
 * compose a message that is certain to fail.
 */
export const isAiBackendConnected = isBackendConnected

const WORKSPACE_AI_PATH = (workspaceId) => `/workspaces/${workspaceId}/ai`
const CONVERSATIONS_PATH = (workspaceId) => `${WORKSPACE_AI_PATH(workspaceId)}/conversations`
const CONVERSATION_PATH = (workspaceId) => `${CONVERSATIONS_PATH(workspaceId)}/current`
const SUGGESTIONS_PATH = (workspaceId) => `${WORKSPACE_AI_PATH(workspaceId)}/suggestions`
const MESSAGE_PATH = (workspaceId) => `${CONVERSATIONS_PATH(workspaceId)}/messages`
const APPLY_PATH = (workspaceId) => `${WORKSPACE_AI_PATH(workspaceId)}/actions`

/**
 * One conversation path, by id.
 *
 * Separate from the paths above because a request that names a conversation is a request
 * for *that* conversation, and routing it through the same string would let a
 * conversation id be interpolated into a URL that a later change could widen.
 */
const CONVERSATION_BY_ID_PATH = (workspaceId, conversationId) =>
  `${CONVERSATIONS_PATH(workspaceId)}/${conversationId}`

/**
 * Builds the request body for anything that talks to the assistant.
 *
 * The context is built through `buildAiContext`, which reads an allowlist of identifiers
 * and one closed theme vocabulary. This is the one place a request body is assembled, so
 * there is no second path that could forward a whole editor state — with its draft tokens
 * and any stray provider configuration — to the backend by accident.
 */
const buildAiRequestBody = ({ message, context, conversationId }) => {
  const body = { context: buildAiContext(context) }
  if (typeof message === 'string' && message.trim() !== '') {
    body.message = message.trim().slice(0, AI_MESSAGE_MAX_LENGTH)
  }
  if (typeof conversationId === 'string' && conversationId.trim() !== '') {
    body.conversationId = conversationId.trim()
  }
  return body
}

/**
 * Appends the context to a path as query parameters.
 *
 * Written out rather than passed as an options object because `httpClient` spreads
 * its options straight into `fetch`, and `fetch` silently ignores a key it does not
 * know. An options-shaped `params` would look correct and send nothing.
 */
const withContextQuery = (path, context, query) => {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(buildAiContext(context))) {
    params.set(key, value)
  }
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== null && value !== undefined && value !== '') params.set(key, String(value))
  }
  const search = params.toString()
  return search ? `${path}?${search}` : path
}

/**
 * The conversation history for a workspace, or null when there is none to read.
 *
 * Null covers both "no backend" and "the backend has no conversations", because from the
 * sidebar's point of view those produce the same honest statement: there is no history to
 * show, and no history is available are different claims that both resolve to an empty
 * panel. Which one it is, is available separately through `isAiBackendConnected`.
 *
 * A failure to *read* an existing list is not folded into this. It rejects, and the
 * caller reports it, because "the list is empty" is exactly what a failed read must not
 * be allowed to say.
 */
const getConversations = async (workspaceId, { context, query } = {}) => {
  if (!isBackendConnected() || !workspaceId) {
    return null
  }
  return normalizeAiConversationSummaryList(
    readAiConversationListPayload(
      await httpClient.get(withContextQuery(CONVERSATIONS_PATH(workspaceId), context, query)),
    ),
  )
}

/**
 * One stored conversation, or null when there is none to read.
 *
 * With no `conversationId` this reads the workspace's current conversation, which is
 * what a user landing on the assistant page wants: their last thread, not an empty box.
 * With one it reads that thread. Both resolve to null rather than an empty transcript
 * when the backend has nothing, so the empty state can say which case it is.
 */
const getConversation = async (workspaceId, { conversationId, context } = {}) => {
  if (!isBackendConnected() || !workspaceId) {
    return null
  }
  const path =
    typeof conversationId === 'string' && conversationId.trim()
      ? CONVERSATION_BY_ID_PATH(workspaceId, conversationId.trim())
      : CONVERSATION_PATH(workspaceId)
  return normalizeAiConversation(await httpClient.get(withContextQuery(path, context)))
}

/**
 * Suggested prompts for this workspace, or null when there are none to read.
 *
 * With no backend this is null rather than an empty list, and the page then shows the
 * example prompts declared in the model. Those are clearly labelled as examples: they
 * are prompts a user can type, not replies and not things the assistant is claiming
 * it can do yet.
 */
const getSuggestions = async (workspaceId, { context } = {}) => {
  if (!isBackendConnected() || !workspaceId) {
    return null
  }
  // The context goes along even though suggestions are workspace-level today: a backend
  // that can suggest "add a pricing section" only makes sense once it knows which site
  // is open, and sending it now avoids a breaking change later.
  return normalizeAiSuggestionList(
    readAiSuggestionPayload(
      await httpClient.get(withContextQuery(SUGGESTIONS_PATH(workspaceId), context)),
    ),
  )
}

/**
 * Sends a user message and returns the assistant's reply.
 *
 * Throws `BackendNotConnectedError` when no backend is configured. It does not return
 * a placeholder reply, a canned response, or a message that says it is thinking: the
 * expected return value of this call is text from a model, and there is no honest way
 * to produce that here.
 */
const sendAiMessage = async (workspaceId, { message, context, conversationId } = {}) => {
  if (!isBackendConnected() || !workspaceId) {
    throw new BackendNotConnectedError('AI assistant integration is unavailable.')
  }

  const body = buildAiRequestBody({ message, context, conversationId })
  if (!body.message) {
    throw new TypeError('An AI message is required.')
  }

  const response = await httpClient.post(MESSAGE_PATH(workspaceId), body)
  const messages = readAiMessagePayload(response)

  return {
    conversationId: typeof response?.conversationId === 'string' ? response.conversationId : conversationId ?? null,
    messages,
    proposals: messages.flatMap((entry) => {
      const list = entry?.proposals ?? entry?.actions ?? entry?.changes
      return Array.isArray(list) ? list.map(normalizeAiProposal).filter(Boolean) : []
    }),
  }
}

/**
 * Applies a proposed change.
 *
 * Throws `BackendNotConnectedError` when no backend is configured, and deliberately
 * offers no "dry run" that reports success. The return value of a successful call is the
 * backend's own confirmation that the change was made; the UI marks a proposal applied
 * from that response and from nothing else, so a rejected or failed request can never
 * leave a proposal looking done.
 */
const applyAiAction = async (workspaceId, { action, proposalId, context } = {}) => {
  if (!isBackendConnected() || !workspaceId) {
    throw new BackendNotConnectedError('AI action integration is unavailable.')
  }
  if (typeof proposalId !== 'string' || !proposalId.trim()) {
    throw new TypeError('A proposal id is required to apply an AI action.')
  }

  return httpClient.post(APPLY_PATH(workspaceId), {
    action,
    proposalId: proposalId.trim(),
    context: buildAiContext(context),
  })
}

const aiService = {
  getConversations,
  getConversation,
  getSuggestions,
  sendAiMessage,
  applyAiAction,
}

export default aiService

