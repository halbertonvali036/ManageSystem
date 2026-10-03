/**
 * Activity model — the event stream behind `Fəaliyyət`, and the single activity
 * model for the whole product.
 *
 * ── Why this file is shared ────────────────────────────────────────────────────
 *
 * A workspace activity log and a platform-wide Admin audit log are the same shape:
 * somebody (or the system) did something, to something, at a time. Writing the
 * vocabulary twice is how the two drift apart — one side grows a type the other
 * cannot render, and an audit trail that silently drops events is worse than no
 * trail. So the vocabulary, the normalizer and the filters live here, and both
 * callers (a workspace and the admin portal) pass a different *scope* to the
 * service. Nothing in this file is scoped to either one.
 *
 * ── Rules ─────────────────────────────────────────────────────────────────────
 *
 * - An event exists only because the backend recorded it. There is no sample event,
 *   no "recent activity" seed and no relative-time filler: an audit log that contains
 *   invented rows is not a weaker audit log, it is a false one.
 * - The type list is *closed*. An event whose type this file does not declare is
 *   dropped rather than filed under a neighbouring type, because guessing would
 *   misreport what happened. A new event kind means adding it here on purpose,
 *   alongside the copy that describes it.
 * - An actor is optional. Deployments, scheduled jobs and webhooks act on their own,
 *   and a log that credits a person for a machine action is worse than one that says
 *   "system". A missing actor is never replaced with the signed-in user.
 * - A target is optional in the same way, and a link is only kept when it is a local
 *   route in this portal — never an arbitrary URL from a payload.
 * - `metadata` is passed through as sent, primitives only, and never merged with
 *   anything this file made up.
 * - Nothing here writes. Recording an event is the backend's job.
 */

/* ── Scopes ──────────────────────────────────────────────────────────────────── */

/**
 * Where an event stream is read from.
 *
 * Same model, two windows onto it: a workspace sees its own stream, the admin
 * portal sees everything. The scope chooses the endpoint, never the shape.
 */
export const ACTIVITY_SCOPE = Object.freeze({
  WORKSPACE: 'workspace',
  PLATFORM: 'platform',
})

/* ── Event types ─────────────────────────────────────────────────────────────── */

/**
 * The events this portal can describe.
 *
 * Each maps onto a module that already exists, so a type always describes something
 * the product really does. The list is a *prepared vocabulary* for the backend to
 * record against — declaring a type does not create an event.
 *
 * `*.changed` covers a state transition on that object (a domain pointed at a
 * hostname, a deployment finished, a schema altered). The finer-grained
 * create/edit/publish kinds are separated for the site and member flows, where the
 * difference between "made" and "changed" is the thing an operator asks about.
 */
export const ACTIVITY_TYPE = Object.freeze({
  WORKSPACE_CREATED: 'workspace.created',
  WORKSPACE_UPDATED: 'workspace.updated',
  SITE_CREATED: 'site.created',
  SITE_UPDATED: 'site.updated',
  SITE_PUBLISHED: 'site.published',
  MEMBER_INVITED: 'member.invited',
  MEMBER_ROLE_CHANGED: 'member.role_changed',
  MEMBER_REMOVED: 'member.removed',
  MODEL_CHANGED: 'model.changed',
  RECORD_CHANGED: 'record.changed',
  INTEGRATION_CHANGED: 'integration.changed',
  DOMAIN_CHANGED: 'domain.changed',
  DEPLOYMENT_CHANGED: 'deployment.changed',
  BILLING_CHANGED: 'billing.changed',
  SECURITY_CHANGED: 'security.changed',
})

/** Every declared type, in a stable display order. */
export const ACTIVITY_TYPES = Object.freeze(Object.values(ACTIVITY_TYPE))

const ACTIVITY_TYPE_SET = new Set(ACTIVITY_TYPES)

export const isKnownActivityType = (type) => ACTIVITY_TYPE_SET.has(type)

/**
 * Reads a type, or null when the payload states none this file knows.
 *
 * Null rather than a default: a caller that receives null drops the row instead of
 * showing an event under a type the backend never sent.
 */
export const readActivityType = (raw) => {
  const value = typeof raw === 'string' ? raw : raw?.type ?? raw?.action
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()
  return ACTIVITY_TYPE_SET.has(normalized) ? normalized : null
}

/**
 * The group an event belongs to, used for colour and for the type filter.
 *
 * Declared before the maps below that derive from it, and grouping itself is
 * derived from the type id rather than declared a second time — so a new type
 * cannot land in a group nobody chose for it.
 */
export const ACTIVITY_TYPE_GROUP = Object.freeze({
  WORKSPACE: 'workspace',
  SITE: 'site',
  MEMBER: 'member',
  MODEL: 'model',
  RECORD: 'record',
  INTEGRATION: 'integration',
  DOMAIN: 'domain',
  DEPLOYMENT: 'deployment',
  BILLING: 'billing',
  SECURITY: 'security',
  SYSTEM: 'system',
})

const ACTIVITY_TYPE_GROUP_SET = new Set(Object.values(ACTIVITY_TYPE_GROUP))

export function getActivityTypeGroup(type) {
  const prefix = String(type ?? '').split('.')[0]
  return ACTIVITY_TYPE_GROUP_SET.has(prefix) ? prefix : ACTIVITY_TYPE_GROUP.SYSTEM
}

/** Translation key per type. The UI never hard-codes an event name. */
export const ACTIVITY_TYPE_LABEL_KEYS = Object.freeze(
  Object.fromEntries(ACTIVITY_TYPES.map((type) => [type, `workspaceActivity.type.${type}`])),
)

/** Chip variant per type, so the same event always looks the same. */
export const ACTIVITY_TYPE_VARIANTS = Object.freeze(
  Object.fromEntries(ACTIVITY_TYPES.map((type) => [type, getActivityTypeGroup(type)])),
)

/** Icon name per type; the component maps it to a real icon. */
export const ACTIVITY_TYPE_ICONS = Object.freeze(
  Object.fromEntries(ACTIVITY_TYPES.map((type) => [type, getActivityTypeGroup(type)])),
)

/** Group order used by the type filter, so its options are never arbitrary. */
const ACTIVITY_TYPE_GROUPS_ORDER = Object.freeze([
  ACTIVITY_TYPE_GROUP.WORKSPACE,
  ACTIVITY_TYPE_GROUP.SITE,
  ACTIVITY_TYPE_GROUP.MEMBER,
  ACTIVITY_TYPE_GROUP.RECORD,
  ACTIVITY_TYPE_GROUP.MODEL,
  ACTIVITY_TYPE_GROUP.INTEGRATION,
  ACTIVITY_TYPE_GROUP.DOMAIN,
  ACTIVITY_TYPE_GROUP.DEPLOYMENT,
  ACTIVITY_TYPE_GROUP.BILLING,
  ACTIVITY_TYPE_GROUP.SECURITY,
  ACTIVITY_TYPE_GROUP.SYSTEM,
])

/** Every group the declared types actually cover, in display order. */
export const ACTIVITY_TYPE_GROUPS = Object.freeze(
  ACTIVITY_TYPE_GROUPS_ORDER.filter((group) =>
    ACTIVITY_TYPES.some((type) => getActivityTypeGroup(type) === group),
  ),
)

/* ── Normalization ───────────────────────────────────────────────────────────── */

const readString = (payload, ...keys) => {
  for (const key of keys) {
    const value = payload?.[key]
    if (typeof value === 'string' && value.trim()) return value
  }
  return null
}

/**
 * The person or system behind an event.
 *
 * Returns null when the payload states no actor. That is a real state — a scheduled
 * deployment has no human behind it — and it is displayed as "system" rather than
 * being attributed to whoever happens to be signed in.
 */
export const normalizeActivityActor = (raw) => {
  if (!raw || typeof raw !== 'object') return null

  const id = readString(raw, 'id', 'userId', 'user_id', 'memberId', 'member_id')
  const name = readString(raw, 'name', 'displayName', 'display_name', 'fullName', 'full_name')
  const email = readString(raw, 'email')
  const role = readString(raw, 'role')

  // An actor needs at least one way to be identified to be worth showing.
  if (!id && !name && !email) return null

  return {
    id,
    name,
    email: email ? email.toLowerCase() : null,
    role,
  }
}

/**
 * What the event happened to.
 *
 * `path` is only kept when it is a local route in this portal. A payload cannot
 * hand the UI an external or protocol-relative URL to render as a link, so anything
 * that is not a plain absolute local path is dropped.
 */
export const normalizeActivityTarget = (raw) => {
  if (!raw || typeof raw !== 'object') return null

  const type = readString(raw, 'type', 'kind', 'resource')
  const id = readString(raw, 'id', 'recordId', 'record_id')
  const label = readString(raw, 'label', 'name', 'title')
  const path = readLocalPath(readString(raw, 'path', 'route', 'href'))

  if (!type && !id && !label && !path) return null

  return { type, id, label, path }
}

/** Accepts only `/section/...` style local routes. Never `//host`, `http:`, `\`. */
const readLocalPath = (value) => {
  if (!value) return null
  if (!value.startsWith('/')) return null
  if (value.startsWith('//')) return null
  if (/[\\:\s]/.test(value)) return null
  return value
}

/**
 * Extra fields the backend attached, primitives only.
 *
 * Passed through as sent, with a hard cap on both the number of keys and the length
 * of each value so a payload cannot flood the row. Nothing is renamed, defaulted or
 * invented: a key that is absent stays absent.
 */
const MAX_METADATA_KEYS = 8
const MAX_METADATA_VALUE_LENGTH = 120

export const normalizeActivityMetadata = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null

  const entries = Object.entries(raw)
    .filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value))
    .slice(0, MAX_METADATA_KEYS)
    .map(([key, value]) => [
      key,
      typeof value === 'string' ? value.slice(0, MAX_METADATA_VALUE_LENGTH) : value,
    ])

  return entries.length > 0 ? Object.fromEntries(entries) : null
}

/**
 * Maps a raw record onto an Activity.
 *
 * Returns null — and the row is dropped — when the record has no id or a type this
 * file does not declare. Those are the two fields a row is meaningless without: an
 * event with no id cannot be reacted to, and an event of unknown kind cannot be
 * described without guessing.
 *
 * @typedef {Object} Activity
 * @property {string} id
 * @property {string} type            One of ACTIVITY_TYPE.
 * @property {Object|null} actor      { id, name, email, role } — null when the system acted.
 * @property {Object|null} target     { type, id, label, path } — null when nothing was addressed.
 * @property {string|null} description Backend-supplied sentence, used verbatim when present.
 * @property {string|null} createdAt   ISO date string, passed through untouched.
 * @property {Object|null} metadata   Primitives exactly as sent.
 */
export const normalizeActivity = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null

  const id = readString(raw, 'id', 'eventId', 'event_id', '_id')
  if (!id) return null

  const type = readActivityType(raw)
  if (!type) return null

  return {
    id,
    type,
    actor: normalizeActivityActor(raw.actor ?? raw.user ?? raw.performedBy),
    target: normalizeActivityTarget(raw.target ?? raw.resource ?? raw.subject),
    description: readString(raw, 'description', 'message', 'summary'),
    createdAt: readString(raw, 'createdAt', 'created_at', 'occurredAt', 'occurred_at', 'timestamp'),
    metadata: normalizeActivityMetadata(raw.metadata ?? raw.meta ?? raw.data),
  }
}

/** Maps a backend page onto events, dropping rows this model cannot describe. */
export const normalizeActivityList = (items) => {
  if (!Array.isArray(items)) return []
  return items.map(normalizeActivity).filter(Boolean)
}

/**
 * Accepts either a bare array or a `{ data: [...] }` / `{ events: [...] }` envelope.
 *
 * Several services in this portal unwrap `response.data`, and a paged activity feed
 * is likely to arrive wrapped. Unwrapping here keeps that concern out of the model.
 */
export const readActivityPayload = (response) => {
  const candidate = response?.data ?? response
  if (Array.isArray(candidate)) return candidate
  if (Array.isArray(candidate?.events)) return candidate.events
  if (Array.isArray(candidate?.items)) return candidate.items
  if (Array.isArray(candidate?.results)) return candidate.results
  return []
}

/* ── Dates ───────────────────────────────────────────────────────────────────── */

/** Parsed event time, or null when the backend sent none or an unusable one. */
export const getActivityDate = (event) => {
  if (!event?.createdAt) return null
  const date = new Date(event.createdAt)
  return Number.isNaN(date.getTime()) ? null : date
}

/** ISO string for `<time dateTime>`, or null. */
export const getActivityDateTime = (event) => getActivityDate(event)?.toISOString() ?? null

/** Readable, locale-aware stamp, or null when there is no real time to show. */
export const formatActivityDate = (event, locale) => {
  const date = getActivityDate(event)
  if (!date) return null
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

/* ── Ordering ────────────────────────────────────────────────────────────────── */

/**
 * Newest first, with undated events last.
 *
 * An event whose timestamp could not be read keeps its place at the end rather than
 * being given a date: sorting it to "now" would put a machine event at the top of a
 * trail and imply it just happened. Ties fall back to the id so the order is stable
 * between renders.
 */
export const sortActivity = (events = []) =>
  [...events].sort((a, b) => {
    const timeA = getActivityDate(a)?.getTime() ?? null
    const timeB = getActivityDate(b)?.getTime() ?? null

    if (timeA === null && timeB === null) return String(a.id).localeCompare(String(b.id))
    if (timeA === null) return 1
    if (timeB === null) return -1

    if (timeB !== timeA) return timeB - timeA
    return String(a.id).localeCompare(String(b.id))
  })

/* ── Filters ─────────────────────────────────────────────────────────────────── */

export const ACTIVITY_FILTER_ALL = 'all'

/** Parses a `<input type="date">` value into a timestamp, or null when unusable. */
export const parseActivityDateBoundary = (value, { endOfDay = false } = {}) => {
  if (typeof value !== 'string' || !value.trim()) return null

  // A bare `YYYY-MM-DD` is read in UTC so the same string means the same instant
  // regardless of the viewer's timezone; a full ISO string is used as given.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`)
    : new Date(value)

  return Number.isNaN(date.getTime()) ? null : date.getTime()
}

/**
 * True when the event falls inside an inclusive date range.
 *
 * An event with no readable time is kept when a range is active: dropping it would
 * hide a real recorded event because of a parsing failure, and the row itself
 * already shows that it has no date. With no range, everything passes.
 */
export const isActivityInRange = (event, { from = '', to = '' } = {}) => {
  if (!from && !to) return true

  const time = getActivityDate(event)?.getTime() ?? null
  if (time === null) return true

  const lower = parseActivityDateBoundary(from)
  const upper = parseActivityDateBoundary(to, { endOfDay: true })

  if (lower !== null && time < lower) return false
  if (upper !== null && time > upper) return false
  return true
}

/** Case-insensitive match over the description, the target and the actor. */
export const activityMatchesQuery = (event, query) => {
  const needle = String(query ?? '').trim().toLowerCase()
  if (!needle) return true

  const haystack = [
    event?.description,
    event?.target?.label,
    event?.target?.type,
    event?.actor?.name,
    event?.actor?.email,
    event?.type,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())

  return haystack.some((value) => value.includes(needle))
}

/** True when the event is attributed to one member. A system event never is. */
export const isActivityByActor = (event, actorId) => {
  if (!actorId || actorId === ACTIVITY_FILTER_ALL) return true
  return event?.actor?.id === actorId
}

/**
 * Filters the loaded events by type, member, date range and search term.
 *
 * Everything runs over what was loaded. No filter here triggers a request, and a
 * filter that matches nothing yields an empty list rather than falling back to the
 * unfiltered one.
 */
export const filterActivity = (
  events = [],
  { type = ACTIVITY_FILTER_ALL, actorId = ACTIVITY_FILTER_ALL, query = '', from = '', to = '' } = {},
) =>
  events.filter((event) => {
    const matchesType = type === ACTIVITY_FILTER_ALL || event.type === type
    return (
      matchesType &&
      isActivityByActor(event, actorId) &&
      isActivityInRange(event, { from, to }) &&
      activityMatchesQuery(event, query)
    )
  })

/** True when anything other than "show everything" is selected. */
export const isActivityFiltered = ({ type, actorId, query, from, to } = {}) =>
  (type !== undefined && type !== ACTIVITY_FILTER_ALL) ||
  (actorId !== undefined && actorId !== ACTIVITY_FILTER_ALL) ||
  Boolean(String(query ?? '').trim()) ||
  Boolean(String(from ?? '').trim()) ||
  Boolean(String(to ?? '').trim())

/* ── Derived summaries ───────────────────────────────────────────────────────── */

/**
 * The distinct actors present in the loaded events, for the member filter.
 *
 * Derived from the events themselves rather than fetched, so the filter can only
 * ever offer a person who actually appears in this trail — and with no events it
 * offers nobody, instead of listing every member of the workspace.
 */
export const getActivityActors = (events = []) => {
  const seen = new Map()

  for (const event of events) {
    const actor = event?.actor
    if (!actor?.id || seen.has(actor.id)) continue
    seen.set(actor.id, actor)
  }

  return [...seen.values()].sort((a, b) =>
    (a.name ?? a.email ?? '').localeCompare(b.name ?? b.email ?? ''),
  )
}

/** How many loaded events carry each type — a count of real rows, never a guess. */
export const countActivityByType = (events = []) => {
  const counts = Object.fromEntries(ACTIVITY_TYPES.map((type) => [type, 0]))
  for (const event of events) {
    if (counts[event.type] !== undefined) counts[event.type] += 1
  }
  return counts
}

/** How many loaded events fall in each type group. */
export const countActivityByGroup = (events = []) => {
  const counts = Object.fromEntries(ACTIVITY_TYPE_GROUPS.map((group) => [group, 0]))
  for (const event of events) {
    const group = getActivityTypeGroup(event.type)
    if (counts[group] !== undefined) counts[group] += 1
  }
  return counts
}
