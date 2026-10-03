/**
 * AI assistant model — the vocabulary for `AI köməkçi`.
 *
 * ── The rule this file exists to enforce ───────────────────────────────────────
 *
 * Nothing here can produce an answer. A message in this portal is either something
 * the user typed and the backend accepted, or something the backend sent. There is no
 * third source, and no local generator standing in for one.
 *
 * That is the whole design brief, and it is easy to violate by accident. A chat UI
 * feels broken when the assistant "thinks" forever, so the tempting shortcut is a
 * canned reply that appears after a delay. It would make the demo look finished and
 * it would be a lie: a user would read advice from a system that does not exist, and
 * would then spend an afternoon trying to apply it. So the model has no reply
 * generator at all — not a hidden one, not a fallback path, none. An assistant message
 * that did not come from the backend cannot be constructed.
 *
 * ── What is deliberately absent ────────────────────────────────────────────────
 *
 * No provider key, no model name, no API token, no system prompt, no temperature.
 * An AI feature is exactly the kind of feature that tempts a developer to put a key
 * in a frontend env var so the thing works during a demo. That key would ship to every
 * browser, be readable by every user, and be spent by anyone who copies it. The
 * backend holds the provider credentials and this portal only ever sends text to it.
 * `AI_CONTEXT_KEYS` is an allowlist for the same reason: the only things that can ever
 * leave the browser are the four identifiers below plus one theme name, so a future
 * field cannot leak by default — it has to be added to the list on purpose.
 *
 * ── Proposals, not actions ─────────────────────────────────────────────────────
 *
 * A proposed change is a *proposal*. The model can describe one precisely — which
 * action, on which object, with which fields — and can show it, but it cannot apply
 * it. Applying is `applyAiAction` in the service, and that call throws until a backend
 * exists. So a proposal reaching `applied` is not a UI state this file can reach; it is
 * a fact the backend reported.
 */

import { isValidSiteThemeId } from '@/models/siteTheme'

/* ── Roles and message state ──────────────────────────────────────────────────── */

/** Who produced a message. A message with no other role is dropped, not guessed. */
export const AI_ROLE = Object.freeze({
  USER: 'user',
  ASSISTANT: 'assistant',
  /** A local note from the portal itself, e.g. "not connected yet". Never the AI. */
  NOTICE: 'notice',
})

const AI_ROLE_SET = new Set(Object.values(AI_ROLE))

export const isKnownAiRole = (role) => AI_ROLE_SET.has(role)

/**
 * Messages have no delivery state, and that is the point.
 *
 * `pending` and `failed` were briefly offered here so a failed send could appear in the
 * transcript as a red bubble. They were removed: nothing ever produced them. The portal
 * does not echo a user's message locally, so there is no local row to mark pending, and
 * a failed send keeps the text in the composer instead of moving it into the transcript
 * as a lie with a warning stripe on it. A bubble on screen is therefore always text a
 * model produced, with nothing else able to reach that branch.
 *
 * A send that is in flight is `isSending` in the hook, and it renders as a thinking row
 * below the transcript — a fact about the request, not a property of a message.
 */

/** How many messages the composer accepts, enforced on input and on stored text. */
export const AI_MESSAGE_MAX_LENGTH = 4000

/* ── Proposals ────────────────────────────────────────────────────────────────── */

/**
 * Where a proposed change stands.
 *
 * `pending` is the only state a proposal is created in. `applied` and `rejected` are
 * both terminal and both require the backend to have acted — the portal cannot mark
 * its own work done, and in particular cannot mark a change applied when the call
 * that would apply it threw.
 */
export const AI_PROPOSAL_STATUS = Object.freeze({
  PENDING: 'pending',
  APPLIED: 'applied',
  REJECTED: 'rejected',
})

/** Statuses from which no further transition is possible. */
const AI_PROPOSAL_TERMINAL = new Set([
  AI_PROPOSAL_STATUS.APPLIED,
  AI_PROPOSAL_STATUS.REJECTED,
])

export const isPendingAiProposal = (proposal) =>
  proposal?.status === AI_PROPOSAL_STATUS.PENDING

export const isSettledAiProposal = (proposal) =>
  AI_PROPOSAL_TERMINAL.has(proposal?.status)

/* ── Actions ──────────────────────────────────────────────────────────────────── */

/**
 * The changes the assistant is allowed to propose.
 *
 * This is a declared vocabulary, not an implementation: naming `createSite` here says
 * the portal can *describe* such a change, and nothing more. There is no local code
 * anywhere that creates a site from one of these — the actions exist to be sent to the
 * backend and to be previewed in the UI.
 *
 * `requiredContext` is the part that earns its keep. `addSection` is meaningless
 * without a page to add it to, and `publishSite` without a site would have nowhere to
 * publish to. Recording that here means the UI can say "this needs a page open" instead
 * of letting a request go out that cannot mean anything.
 */
export const AI_ACTION = Object.freeze({
  CREATE_SITE: 'createSite',
  CREATE_PAGE: 'createPage',
  ADD_SECTION: 'addSection',
  UPDATE_BLOCK: 'updateBlock',
  UPDATE_THEME: 'updateTheme',
  CREATE_MODEL: 'createModel',
  CREATE_FORM: 'createForm',
  PUBLISH_SITE: 'publishSite',
})

/** Every declared action, in the order the preview panel lists them. */
export const AI_ACTIONS = Object.freeze(Object.values(AI_ACTION))

const AI_ACTION_SET = new Set(AI_ACTIONS)

export const isKnownAiAction = (action) => AI_ACTION_SET.has(action)

/** Actions whose effect is not visible until a site is published. */
export const AI_DEFERRED_ACTIONS = new Set([AI_ACTION.PUBLISH_SITE])

/** Translation key per action. The UI never hard-codes an action name. */
export const AI_ACTION_LABEL_KEYS = Object.freeze(
  Object.fromEntries(AI_ACTIONS.map((action) => [action, `aiAssistant.action.${action}`])),
)

/** Per-action description of the object the change lands on. */
export const AI_ACTION_TARGET_KEYS = Object.freeze(
  Object.fromEntries(AI_ACTIONS.map((action) => [action, `aiAssistant.actionTarget.${action}`])),
)

/**
 * Context each action needs before a proposal about it can mean anything.
 *
 * Read by `getMissingAiContext`, which reports the gap to the user. This is not
 * validation of the backend's request — it is a way of refusing to build a proposal
 * preview that describes a change to nothing.
 *
 * `updateTheme` asks for the current theme even though it is the action that changes it.
 * The reason is that a theme change described without the starting point is not
 * reviewable: the user is asked to approve a new accent colour and cannot see what it is
 * replacing.
 */
export const AI_ACTION_REQUIRED_CONTEXT = Object.freeze({
  [AI_ACTION.CREATE_SITE]: Object.freeze(['workspaceId']),
  [AI_ACTION.CREATE_PAGE]: Object.freeze(['siteId']),
  [AI_ACTION.ADD_SECTION]: Object.freeze(['siteId', 'activePageId']),
  [AI_ACTION.UPDATE_BLOCK]: Object.freeze(['siteId', 'activePageId', 'selectedBlockId']),
  [AI_ACTION.UPDATE_THEME]: Object.freeze(['siteId', 'currentTheme']),
  [AI_ACTION.CREATE_MODEL]: Object.freeze(['workspaceId']),
  [AI_ACTION.CREATE_FORM]: Object.freeze(['siteId', 'activePageId']),
  [AI_ACTION.PUBLISH_SITE]: Object.freeze(['siteId']),
})

/**
 * Fields the portal knows how to describe for each action.
 *
 * Used only to *order* a preview, never to filter it. A field the backend sends that
 * is not listed here is still shown, under its own raw key: a preview that quietly
 * dropped an unrecognised field would be a preview that could be incomplete, which is
 * worse than one that looks slightly untidy.
 */
export const AI_ACTION_FIELDS = Object.freeze({
  [AI_ACTION.CREATE_SITE]: Object.freeze(['name', 'templateId']),
  [AI_ACTION.CREATE_PAGE]: Object.freeze(['title', 'path']),
  [AI_ACTION.ADD_SECTION]: Object.freeze(['sectionType', 'position']),
  [AI_ACTION.UPDATE_BLOCK]: Object.freeze(['blockId', 'props']),
  [AI_ACTION.UPDATE_THEME]: Object.freeze(['presetId', 'primary', 'accent']),
  [AI_ACTION.CREATE_MODEL]: Object.freeze(['name', 'fields']),
  [AI_ACTION.CREATE_FORM]: Object.freeze(['name', 'fields', 'submitLabel']),
  [AI_ACTION.PUBLISH_SITE]: Object.freeze(['domainId']),
})

/* ── Context ──────────────────────────────────────────────────────────────────── */

/**
 * Where the user is, as far as the assistant is concerned.
 *
 * Five values, in two groups, because they are not the same kind of thing and must not
 * be validated the same way. The identifiers are opaque tokens whose shape we cannot
 * check, so they are checked for *shape*. The theme is a name from a closed list this
 * codebase already owns, so it is checked against that list — which is the stronger
 * check, and the reason a free-text "current theme" cannot travel.
 *
 * An allowlist rather than a denylist. The tempting alternative is to forward whatever
 * the editor has in scope and hope none of it is sensitive — but "whatever is in scope"
 * is precisely where a draft token, a private API key or a provider secret would come
 * from. With an allowlist, adding something new to the request is a deliberate edit to
 * this file, and a reviewer sees it.
 */
export const AI_CONTEXT_ID_KEYS = Object.freeze([
  'workspaceId',
  'siteId',
  'activePageId',
  'selectedBlockId',
])

/**
 * Context values that are a closed vocabulary rather than a free identifier.
 *
 * `currentTheme` is a *site* theme preset id — the theme of the customer's published
 * website, not the builder's own interface. Validating it against `SITE_THEME_IDS` is
 * what stops a theme name being used as a smuggling route, and it also means the
 * backend receives the same ids the editor uses.
 */
export const AI_CONTEXT_VALUE_READERS = Object.freeze({
  currentTheme: isValidSiteThemeId,
})

/** Every context key, for iteration and for rendering the panel in a fixed order. */
export const AI_CONTEXT_KEYS = Object.freeze([
  ...AI_CONTEXT_ID_KEYS,
  ...Object.keys(AI_CONTEXT_VALUE_READERS),
])

/** Translation key per context key, so the panel never shows a raw camelCase name. */
export const AI_CONTEXT_LABEL_KEYS = Object.freeze(
  Object.fromEntries(AI_CONTEXT_KEYS.map((key) => [key, `aiAssistant.contextField.${key}`])),
)

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

/**
 * A readable id, or null.
 *
 * Refuses anything that is not a plain short token. An id is an identifier, not free
 * text: a value containing a space, a newline, a `?` or a long run of characters is
 * not something an id legitimately is, and forwarding it would put arbitrary content
 * into a request body under a field the backend trusts to be an id.
 */
export const readAiIdentifier = (value) => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > 128) return null
  if (!/^[A-Za-z0-9._~:@/-]+$/.test(trimmed)) return null
  return trimmed
}

/**
 * Builds the context object for a request.
 *
 * Identifiers go through `readAiIdentifier`, closed-vocabulary values through their
 * own reader. Anything else the caller passes is ignored rather than forwarded, so this
 * function cannot become the accidental way a secret reaches the backend.
 *
 * The result is frozen: it is passed as a request body and as a set of query
 * parameters, and neither caller should be able to widen what is in it after the fact.
 */
export const buildAiContext = (source = {}) => {
  const context = {}
  for (const key of AI_CONTEXT_ID_KEYS) {
    const id = readAiIdentifier(source?.[key])
    if (id !== null) context[key] = id
  }
  for (const [key, isKnown] of Object.entries(AI_CONTEXT_VALUE_READERS)) {
    if (isKnown(source?.[key])) context[key] = source[key]
  }
  return Object.freeze(context)
}

/** Context keys with no value, i.e. what the user has not opened or selected. */
export const getMissingAiContext = (action, context = {}) => {
  const required = AI_ACTION_REQUIRED_CONTEXT[action]
  if (!required) return Object.freeze([])
  return Object.freeze(required.filter((key) => !context?.[key]))
}

/** True when every field an action needs is present. */
export const isAiActionContextReady = (action, context = {}) =>
  getMissingAiContext(action, context).length === 0

/* ── Message reading ──────────────────────────────────────────────────────────── */

/** A readable string from the first key that carries one. */
const readString = (raw, ...keys) => {
  for (const key of keys) {
    const value = raw?.[key]
    if (typeof value === 'string' && value.trim() !== '') return value.trim()
  }
  return null
}

/**
 * One message, normalized.
 *
 * Returns null — and the caller drops the row — for a message with no readable body
 * or a role this portal does not render. An empty bubble is not a message, and a
 * message from a role that is not drawn would be invisible data pretending to be
 * content.
 *
 * `key` is always present, derived from the backend's id when there is one and from
 * the position when there is not. It exists so React can render the list without this
 * model having to invent a domain identifier.
 */
export const normalizeAiMessage = (raw, index = 0) => {
  if (!isPlainObject(raw)) return null

  const role = readString(raw, 'role', 'author', 'sender')
  if (!role || !isKnownAiRole(role)) return null

  const content = readString(raw, 'content', 'text', 'body', 'message')
  if (!content) return null

  // A length ceiling is enforced here rather than at the input, because the text can
  // also arrive from a stored conversation.
  const id = readString(raw, 'id', 'messageId', 'message_id')

  return Object.freeze({
    id,
    key: id ?? `${role}-${index}`,
    role,
    content: content.slice(0, AI_MESSAGE_MAX_LENGTH),
    createdAt: readString(raw, 'createdAt', 'created_at', 'timestamp'),
    proposals: normalizeAiProposalList(raw?.proposals ?? raw?.actions ?? raw?.changes),
  })
}

/** A stored conversation, mapped onto messages. */
export const normalizeAiMessageList = (items) => {
  if (!Array.isArray(items)) return []
  return items.map(normalizeAiMessage).filter(Boolean).map((message) => Object.freeze(message))
}

/** Accepts a bare array or a `{ data: [...] }` / `{ messages: [...] }` envelope. */
export const readAiMessagePayload = (response) => {
  const candidate = response?.data ?? response
  if (Array.isArray(candidate)) return candidate
  if (Array.isArray(candidate?.messages)) return candidate.messages
  if (Array.isArray(candidate?.conversation)) return candidate.conversation
  if (Array.isArray(candidate?.items)) return candidate.items
  return []
}

/* ── Proposal reading ─────────────────────────────────────────────────────────── */

/**
 * Field values a preview may show.
 *
 * Deliberately narrow: strings, finite numbers and booleans, plus shallow arrays of
 * those. An object or a function is not rendered, and not stringified into the DOM.
 * A preview is a place where backend-supplied data reaches the page as text, and
 * `JSON.stringify` on an arbitrary object is how a prototype-shaped payload ends up
 * being printed for a user to stare at.
 */
const readAiFieldValue = (value) => {
  if (typeof value === 'string') return value
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (Array.isArray(value)) {
    const parts = value
      .map((item) => readAiFieldValue(item))
      .filter((item) => item !== null)
      .map((item) => (typeof item === 'object' ? null : String(item)))
    return parts.length > 0 ? parts : null
  }
  return null
}

/**
 * Keys that describe the proposal envelope rather than the change it carries.
 *
 * Only applied when a proposal arrives with no explicit field object and the whole row
 * is treated as the field source. In that case `action: 'createSite'` and
 * `status: 'pending'` would otherwise be listed as things about to change, which is
 * noise at best and misleading at worst — "action is about to be set to createSite"
 * describes nothing real. An explicit `fields`/`params` object is left untouched, so a
 * field genuinely named `title` is not lost.
 */
const AI_PROPOSAL_ENVELOPE_KEYS = new Set([
  'action',
  'type',
  'kind',
  'id',
  'proposalId',
  'proposal_id',
  'title',
  'summary',
  'headline',
  'description',
  'details',
  'message',
  'status',
  'proposals',
  'actions',
  'changes',
])

/** Preview fields for one proposal, declared ones first, nothing dropped. */
const normalizeAiProposalFields = (raw, { declaredKeys, isWholeRow }) => {
  if (!isPlainObject(raw)) return Object.freeze([])

  // A key declared for this action is always kept, even if its name collides with an
  // envelope key — `title` is a real field of `createPage` and the wrapper's headline at
  // the same time. Envelope exclusion only ever removes *undeclared* noise.
  const isEnvelopeNoise = (key) => isWholeRow && !declaredKeys.includes(key) && AI_PROPOSAL_ENVELOPE_KEYS.has(key)

  const candidates = Object.keys(raw).filter((key) => !isEnvelopeNoise(key))
  const keys = [
    ...declaredKeys.filter((key) => key in raw),
    ...candidates.filter((key) => !declaredKeys.includes(key)),
  ]

  return Object.freeze(
    keys
      .map((key) => {
        const value = readAiFieldValue(raw[key])
        if (value === null) return null
        return Object.freeze({ key, value })
      })
      .filter(Boolean),
  )
}

/**
 * One proposed change, normalized.
 *
 * A proposal without a known action is dropped. The alternative — showing a preview
 * for an action this portal cannot name — would produce a panel with no Apply
 * semantics and no idea what applying would do, which is the least useful thing that
 * could be rendered.
 */
export const normalizeAiProposal = (raw, index = 0) => {
  if (!isPlainObject(raw)) return null

  const action = readString(raw, 'action', 'type', 'kind')
  if (!action || !isKnownAiAction(action)) return null

  const id = readString(raw, 'id', 'proposalId', 'proposal_id')
  const status = isPendingAiProposal({ status: readString(raw, 'status') })
    ? AI_PROPOSAL_STATUS.PENDING
    : raw?.status === AI_PROPOSAL_STATUS.APPLIED
      ? AI_PROPOSAL_STATUS.APPLIED
      : raw?.status === AI_PROPOSAL_STATUS.REJECTED
        ? AI_PROPOSAL_STATUS.REJECTED
        : AI_PROPOSAL_STATUS.PENDING

  // A proposal may carry its fields under `fields`/`params`/`payload`, or spread across
  // the row itself. Both are supported; the row fallback excludes envelope keys.
  const explicit = raw?.fields ?? raw?.params ?? raw?.payload
  const isWholeRow = !isPlainObject(explicit)
  const source = isWholeRow ? raw : explicit

  return Object.freeze({
    id,
    key: id ?? `${action}-${index}`,
    action,
    title: readString(raw, 'title', 'summary', 'headline'),
    description: readString(raw, 'description', 'details', 'message'),
    status,
    isDeferred: AI_DEFERRED_ACTIONS.has(action),
    fields: normalizeAiProposalFields(source, {
      declaredKeys: AI_ACTION_FIELDS[action] ?? [],
      isWholeRow,
    }),
  })
}

export const normalizeAiProposalList = (items) => {
  if (!Array.isArray(items)) return []
  return items
    .map((item, index) => normalizeAiProposal(item, index))
    .filter(Boolean)
    .map((proposal) => Object.freeze(proposal))
}

/* ── Conversations ────────────────────────────────────────────────────────────── */

/** A whole conversation: its messages, plus whatever identifies it. */
export const normalizeAiConversation = (payload) => {
  if (!isPlainObject(payload) && !Array.isArray(payload)) return null

  const response = isPlainObject(payload) ? payload : { messages: payload }
  const messages = normalizeAiMessageList(readAiMessagePayload(response))

  return Object.freeze({
    id: readString(response, 'id', 'conversationId', 'conversation_id'),
    messages,
    updatedAt: readString(response, 'updatedAt', 'updated_at'),
  })
}

/**
 * One entry in the history sidebar.
 *
 * A row without an id is dropped. The id is what a selection is: selecting a history
 * entry means "load this conversation", and an entry that cannot be named cannot be
 * loaded — it would produce a row that highlights and then silently shows whatever was
 * already open. Better to not render it than to render a control that goes nowhere.
 *
 * `title` is whatever the backend chose to call the conversation. `lastMessage` is a
 * preview only and is deliberately truncated hard: the sidebar shows enough to recognise
 * a conversation, and a long reply does not need to be readable in a 220px column.
 */
export const normalizeAiConversationSummary = (raw, index = 0) => {
  if (!isPlainObject(raw)) return null

  const id = readAiIdentifier(raw?.id ?? raw?.conversationId ?? raw?.conversation_id)
  if (id === null) return null

  return Object.freeze({
    id,
    key: id,
    title: readString(raw, 'title', 'name', 'summary') ?? null,
    lastMessage: readString(raw, 'lastMessage', 'last_message', 'preview')?.slice(0, 140) ?? null,
    messageCount:
      Number.isInteger(raw?.messageCount ?? raw?.message_count)
        ? raw.messageCount ?? raw.message_count
        : null,
    updatedAt: readString(raw, 'updatedAt', 'updated_at', 'lastMessageAt', 'last_message_at'),
    isActive: Boolean(raw?.isActive ?? raw?.active),
    _position: index,
  })
}

export const normalizeAiConversationSummaryList = (items) => {
  if (!Array.isArray(items)) return []
  return items
    .map((item, index) => normalizeAiConversationSummary(item, index))
    .filter(Boolean)
}

/** Accepts a bare array or a `{ data: [...] }` / `{ conversations: [...] }` envelope. */
export const readAiConversationListPayload = (response) => {
  const candidate = response?.data ?? response
  if (Array.isArray(candidate)) return candidate
  if (Array.isArray(candidate?.conversations)) return candidate.conversations
  if (Array.isArray(candidate?.items)) return candidate.items
  return []
}

/** Newest first. A history sidebar that mixes dates has to be scanned, not read. */
export const sortAiConversationSummaries = (summaries) => {
  const time = (summary) => {
    const value = summary?.updatedAt ? new Date(summary.updatedAt).getTime() : Number.NaN
    return Number.isNaN(value) ? -Infinity : value
  }
  return Object.freeze(
    [...(summaries ?? [])].sort((a, b) => {
      const difference = time(b) - time(a)
      // Undated rows keep the order the backend sent, so a list with no timestamps at all
      // is not shuffled into an arbitrary sequence on every render.
      if (Number.isNaN(difference)) return (a?._position ?? 0) - (b?._position ?? 0)
      return difference
    }),
  )
}

/* ── Suggestions ──────────────────────────────────────────────────────────────── */

/**
 * Example prompts, and the action each one is meant to become.
 *
 * These are *prompts the user can type*, not replies and not promises. They are shown
 * as examples so the architecture is visible and so a user can compose a request
 * before the backend exists; prefilling the composer with one is a text operation and
 * sends nothing.
 *
 * `action` is the intent this prompt expresses. It is not executed, and nothing here
 * turns a prompt into a request.
 *
 * One prompt per declared action, so the chip list is also a map of what the assistant
 * can be asked to change. `prompt` is the Azerbaijani text — the product's default
 * language — and `promptKey` is what a component actually renders, so switching to
 * English does not leave six Azerbaijani chips on an otherwise English page. The
 * literal is the fallback for a dictionary that has not caught up yet.
 */
export const AI_EXAMPLE_PROMPTS = Object.freeze([
  {
    id: 'createSite',
    action: AI_ACTION.CREATE_SITE,
    promptKey: 'aiAssistant.examples.createSite',
    prompt: 'Mənə biznes saytı yarat',
  },
  {
    id: 'createPage',
    action: AI_ACTION.CREATE_PAGE,
    promptKey: 'aiAssistant.examples.createPage',
    prompt: 'Yeni səhifə əlavə et',
  },
  {
    id: 'addSection',
    action: AI_ACTION.ADD_SECTION,
    promptKey: 'aiAssistant.examples.addSection',
    prompt: 'Hero bölməsi yarat',
  },
  {
    id: 'updateBlock',
    action: AI_ACTION.UPDATE_BLOCK,
    promptKey: 'aiAssistant.examples.updateBlock',
    prompt: 'Seçilmiş blokun mətnini dəyiş',
  },
  {
    id: 'updateTheme',
    action: AI_ACTION.UPDATE_THEME,
    promptKey: 'aiAssistant.examples.updateTheme',
    prompt: 'Saytın rənglərini dəyiş',
  },
  {
    id: 'createForm',
    action: AI_ACTION.CREATE_FORM,
    promptKey: 'aiAssistant.examples.createForm',
    prompt: 'Əlaqə forması əlavə et',
  },
  {
    id: 'createModel',
    action: AI_ACTION.CREATE_MODEL,
    promptKey: 'aiAssistant.examples.createModel',
    prompt: 'Məlumat bazası modeli yarat',
  },
  {
    id: 'publishSite',
    action: AI_ACTION.PUBLISH_SITE,
    promptKey: 'aiAssistant.examples.publishSite',
    prompt: 'Saytı yayımla',
  },
])

const AI_EXAMPLE_PROMPT_IDS = new Set(AI_EXAMPLE_PROMPTS.map((item) => item.id))

/**
 * Normalizes a suggestion from the backend.
 *
 * Refuses one with no prompt text: a suggestion chip with nothing on it is not a
 * suggestion. The id is checked against the declared prompts only to keep the chip
 * stable across renders, and a suggestion the portal has not seen is still shown —
 * a genuinely new suggestion from the backend is a feature, not an error.
 */
export const normalizeAiSuggestion = (raw, index = 0) => {
  if (!isPlainObject(raw)) return null

  const prompt = typeof raw?.prompt === 'string' ? raw.prompt.trim() : readString(raw, 'text')
  if (!prompt) return null

  const id = readString(raw, 'id', 'key')
  const action = readString(raw, 'action', 'type')
  const known = AI_EXAMPLE_PROMPT_IDS.has(id)

  return Object.freeze({
    id: id ?? `suggestion-${index}`,
    key: id ?? `suggestion-${index}`,
    prompt: prompt.slice(0, AI_MESSAGE_MAX_LENGTH),
    action: isKnownAiAction(action) ? action : null,
    isExample: known,
  })
}

export const normalizeAiSuggestionList = (items) => {
  if (!Array.isArray(items)) return []
  return items
    .map((item, index) => normalizeAiSuggestion(item, index))
    .filter(Boolean)
    .map((suggestion) => Object.freeze(suggestion))
}

/** Accepts a bare array or a `{ data: [...] }` / `{ suggestions: [...] }` envelope. */
export const readAiSuggestionPayload = (response) => {
  const candidate = response?.data ?? response
  if (Array.isArray(candidate)) return candidate
  if (Array.isArray(candidate?.suggestions)) return candidate.suggestions
  if (Array.isArray(candidate?.items)) return candidate.items
  return []
}

/* ── Presentation helpers ─────────────────────────────────────────────────────── */

/** Message time, or null when the backend sent none or an unusable one. */
export const getAiMessageDate = (message) => {
  if (!message?.createdAt) return null
  const date = new Date(message.createdAt)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Conversation time, read the same way a message time is read. */
export const getAiConversationDate = (summary) => {
  if (!summary?.updatedAt) return null
  const date = new Date(summary.updatedAt)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * A formatted time, or null.
 *
 * Null rather than a default: a message whose timestamp could not be read says so,
 * because a bubble labelled with the current time is a timestamp nobody sent.
 */
export const formatAiMessageDate = (message, locale) => {
  const date = getAiMessageDate(message)
  if (!date) return null
  return date.toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * How a history row is labelled.
 *
 * Prefers the backend's own title, then the first thing the user said, then nothing. The
 * third case is not a gap to paper over with "Conversation 3": a row with no label at
 * all and an accessible name from `lastMessage` is honest, whereas an invented
 * sequence number implies a naming scheme the backend never agreed to.
 */
export const getAiConversationLabel = (summary) => summary?.title ?? summary?.lastMessage ?? null

/** Only the user can be typing. The AI never appears as the sender. */
export const isAiUserMessage = (message) => message?.role === AI_ROLE.USER

export const isAiAssistantMessage = (message) => message?.role === AI_ROLE.ASSISTANT

export const isAiNoticeMessage = (message) => message?.role === AI_ROLE.NOTICE

/**
 * Every pending proposal across a conversation.
 *
 * Derived from the messages rather than stored, so a proposal cannot survive its
 * message being removed and cannot be shown in one place and applied in another.
 */
export const getPendingAiProposals = (messages = []) => {
  if (!Array.isArray(messages)) return Object.freeze([])
  const proposals = messages.flatMap((message) => message?.proposals ?? [])
  return Object.freeze(proposals.filter(isPendingAiProposal))
}

/** One line describing a change, built from its action and its known fields. */
export const summarizeAiProposal = (proposal, t) => {
  if (!proposal) return null
  const name = proposal.fields.find((field) => field.key === 'name' || field.key === 'title')
  const label = t(AI_ACTION_LABEL_KEYS[proposal.action])
  return name ? `${label} — ${name.value}` : label
}
