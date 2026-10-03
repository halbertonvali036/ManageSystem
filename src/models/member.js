/**
 * Member model — the people behind a workspace, and the roles they hold there.
 *
 * ── What a member is here ─────────────────────────────────────────────────────
 *
 * A member row is a *record the backend owns*. This file describes its shape, the
 * roles a workspace can grant and the states an invitation can be in. It does not
 * send an email, does not create an account and does not grant access to anything.
 *
 * Rules enforced by this file:
 * - A member is only ever returned when the backend actually sent it. There is no
 *   catalog to fall back on and no sample row: a member list with a placeholder in it
 *   would put a stranger's name on a permissions screen.
 * - `status` is read from the backend. A pending invitation reads as `invited`, never
 *   as an active member with a join date nobody has.
 * - A role this file does not declare is refused rather than coerced, so a caller can
 *   never store or render a role whose permissions nobody has looked at.
 * - `name` is optional. A member who has not accepted yet has no display name, and an
 *   absent name is shown as "not provided" rather than invented from the email.
 *
 * ── Reuse over duplication ────────────────────────────────────────────────────
 *
 * Roles here are *workspace* roles. They are deliberately separate from the platform
 * roles in `utils/roles.js`: being an application `admin` says nothing about what you
 * may do inside somebody's workspace. Conflating the two would let a platform role
 * silently become a workspace grant.
 */

// ── Workspace roles ───────────────────────────────────────────────────────────

/**
 * The roles a workspace can grant, from most to least.
 *
 * OWNER  — the account that created the workspace. One per workspace.
 * ADMIN  — runs the workspace: settings, sites, database, integrations, people.
 * EDITOR — changes and publishes site content. Touches nothing else.
 * VIEWER — reads what already exists. Grants no action at all.
 *
 * What each role may actually do lives in `models/workspacePermission.js`; this file
 * only names them.
 */
export const MEMBER_ROLE = Object.freeze({
  OWNER: 'owner',
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
})

/** Every role, in display order. */
export const MEMBER_ROLES = Object.freeze(Object.values(MEMBER_ROLE))

/** Translation key for each role label. Never hard-coded in a component. */
export const MEMBER_ROLE_LABEL_KEYS = Object.freeze({
  [MEMBER_ROLE.OWNER]: 'workspaceMembers.role.owner',
  [MEMBER_ROLE.ADMIN]: 'workspaceMembers.role.admin',
  [MEMBER_ROLE.EDITOR]: 'workspaceMembers.role.editor',
  [MEMBER_ROLE.VIEWER]: 'workspaceMembers.role.viewer',
})

/** Badge variant per role, so a role chip looks the same everywhere. */
export const MEMBER_ROLE_VARIANTS = Object.freeze({
  [MEMBER_ROLE.OWNER]: 'owner',
  [MEMBER_ROLE.ADMIN]: 'admin',
  [MEMBER_ROLE.EDITOR]: 'editor',
  [MEMBER_ROLE.VIEWER]: 'viewer',
})

/**
 * Roles an invitation can grant.
 *
 * `owner` is absent on purpose: a workspace has exactly one owner, and that account is
 * the one that created it. Offering "invite as owner" would describe a transfer of
 * ownership, which is a different action with different consequences, so it is not
 * available from an invite form.
 */
export const INVITABLE_MEMBER_ROLES = Object.freeze([
  MEMBER_ROLE.ADMIN,
  MEMBER_ROLE.EDITOR,
  MEMBER_ROLE.VIEWER,
])

/**
 * Roles a role select may offer when changing somebody's role.
 *
 * Same reason as above — and the current role is filtered out at render time, so the
 * control never lists a choice that would be a no-op.
 */
export const ASSIGNABLE_MEMBER_ROLES = INVITABLE_MEMBER_ROLES

/** The role used when nothing is stated. Never guessed from an email domain. */
export const DEFAULT_MEMBER_ROLE = MEMBER_ROLE.VIEWER

const MEMBER_ROLE_SET = new Set(MEMBER_ROLES)

export const isKnownMemberRole = (role) => MEMBER_ROLE_SET.has(role)

/**
 * Reads a role an invitation or a role change may grant, or null.
 *
 * `owner` is refused here rather than at each call site, so there is exactly one
 * place that decides ownership is not grantable — a rule that is easy to get subtly
 * wrong when it is repeated.
 */
export const readAssignableMemberRole = (value) =>
  ASSIGNABLE_MEMBER_ROLES.includes(value) ? value : null

/**
 * Reads a role, or null when the payload states none this file knows.
 *
 * Returns null rather than a default: a member whose role is unrecognised is a state
 * the UI has to surface, not one to paper over with the most restrictive role, because
 * that would hide a backend contract mismatch.
 */
export const readMemberRole = (raw) => {
  const value = raw?.role
  return typeof value === 'string' && MEMBER_ROLE_SET.has(value) ? value : null
}

// ── Invitation states ─────────────────────────────────────────────────────────

/**
 * Where a member sits between "invited" and "working here".
 *
 * INVITED    — the backend reported an invitation that has not been accepted. There
 *              is no `joinedAt` for this state and the UI does not draw one.
 * ACTIVE     — the backend reported an accepted membership.
 * SUSPENDED  — the backend reported a membership that is on hold. It keeps the row
 *              and the role, so the history stays readable.
 */
export const MEMBER_STATUS = Object.freeze({
  INVITED: 'invited',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
})

export const MEMBER_STATUSES = Object.freeze(Object.values(MEMBER_STATUS))

export const MEMBER_STATUS_LABEL_KEYS = Object.freeze({
  [MEMBER_STATUS.INVITED]: 'workspaceMembers.status.invited',
  [MEMBER_STATUS.ACTIVE]: 'workspaceMembers.status.active',
  [MEMBER_STATUS.SUSPENDED]: 'workspaceMembers.status.suspended',
})

/** Badge variant per status, kept separate from the role palette on purpose. */
export const MEMBER_STATUS_VARIANTS = Object.freeze({
  [MEMBER_STATUS.INVITED]: 'invited',
  [MEMBER_STATUS.ACTIVE]: 'active',
  [MEMBER_STATUS.SUSPENDED]: 'suspended',
})

const MEMBER_STATUS_SET = new Set(MEMBER_STATUSES)

export const isKnownMemberStatus = (status) => MEMBER_STATUS_SET.has(status)

/**
 * The status to display when the backend states none.
 *
 * A membership the backend sent without a status is treated as `invited`, not
 * `active`: the optimistic reading of "no state" would put someone on the list as
 * working here on the strength of an invitation that may never have been accepted.
 */
export const readMemberStatus = (raw) => {
  const value = raw?.status
  return typeof value === 'string' && MEMBER_STATUS_SET.has(value)
    ? value
    : MEMBER_STATUS.INVITED
}

// ── Normalization ─────────────────────────────────────────────────────────────

const readString = (payload, ...keys) => {
  for (const key of keys) {
    const value = payload?.[key]
    if (typeof value === 'string' && value.trim()) return value
  }
  return null
}

/**
 * Maps a raw API record onto a Member.
 *
 * Returns null for a non-object or for a row with no usable email: an address is the
 * one field every member record must have, and a row without one cannot be shown,
 * acted on or invited — rendering it would put a nameless line in a permissions list.
 *
 * An email is lower-cased so the same person cannot appear twice under two casings,
 * and so a duplicate check is a plain comparison.
 */
export const normalizeMember = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const email = readString(raw, 'email', 'mail')
  if (!email) {
    return null
  }

  const role = readMemberRole(raw)
  if (!role) {
    return null
  }

  return {
    id: readString(raw, 'id', 'memberId', 'member_id') ?? email,
    // Null when the platform account has not resolved a name yet. Never faked.
    userId: readString(raw, 'userId', 'user_id'),
    name: readString(raw, 'name', 'displayName', 'display_name', 'fullName', 'full_name'),
    email: email.toLowerCase(),
    role,
    status: readMemberStatus(raw),
    // Timestamps are passed through untouched. `joinedAt` stays null for an
    // invitation that has not been accepted, so nothing on screen implies a join.
    invitedAt: readString(raw, 'invitedAt', 'invited_at'),
    joinedAt: readString(raw, 'joinedAt', 'joined_at'),
  }
}

/** Maps a backend list onto members, dropping malformed rows. */
export const normalizeMemberList = (items) => {
  if (!Array.isArray(items)) return []
  return items.map(normalizeMember).filter(Boolean)
}

// ── Presentation helpers ──────────────────────────────────────────────────────

/** Two-letter initials for the avatar, from the name and falling back to the email. */
export const getMemberInitials = (member) => {
  const source = member?.name?.trim() || member?.email?.split('@')[0] || ''
  const parts = source.split(/[\s._-]+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

/** True when the invitation has not been accepted — the only state with no join date. */
export const isPendingMember = (member) =>
  member?.status === MEMBER_STATUS.INVITED

/**
 * Formats a member timestamp for display, in the active language.
 *
 * Same shape as `formatWorkspaceDate`, so a date on this page reads like every other
 * date in the product. An absent or unparseable value returns null so the caller can
 * leave the line out — a row never invents a date the backend did not state.
 */
export const formatMemberDate = (value, locale) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)
}

// ── Ordering ──────────────────────────────────────────────────────────────────

const ROLE_ORDER = new Map(MEMBER_ROLES.map((role, index) => [role, index]))

/**
 * Deterministic order for the list: owners first, then by name, then by email.
 *
 * The email tiebreak is what makes this stable — two people can share a display name,
 * and a list that reorders itself between renders reads as though something changed.
 * No member is ever invented to fill a position.
 */
export const sortMembers = (members = []) =>
  [...members].sort((a, b) => {
    const roleDelta = (ROLE_ORDER.get(a.role) ?? 0) - (ROLE_ORDER.get(b.role) ?? 0)
    if (roleDelta !== 0) return roleDelta

    const nameA = (a.name ?? '').toLowerCase()
    const nameB = (b.name ?? '').toLowerCase()
    if (nameA !== nameB) return nameA.localeCompare(nameB)

    return a.email.localeCompare(b.email)
  })

// ── Search / filter / counts ──────────────────────────────────────────────────

/** Case-insensitive match on name, email and role. */
export const memberMatchesQuery = (member, query) => {
  const needle = query.trim().toLowerCase()
  if (!needle) return true

  return [member.name, member.email, member.role]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(needle))
}

export const MEMBER_FILTER_ALL = 'all'

/**
 * Filters the loaded list by role, status and search term.
 *
 * Runs over loaded rows only; nothing here queries the server.
 */
export const filterMembers = (
  members = [],
  { query = '', role = MEMBER_FILTER_ALL, status = MEMBER_FILTER_ALL } = {}
) =>
  members.filter((member) => {
    const matchesRole = role === MEMBER_FILTER_ALL || member.role === role
    const matchesStatus = status === MEMBER_FILTER_ALL || member.status === status
    return matchesRole && matchesStatus && memberMatchesQuery(member, query)
  })

/** Counts per role, for the summary. Derived from loaded rows only. */
export const countMembersByRole = (members = []) => {
  const counts = Object.fromEntries(MEMBER_ROLES.map((role) => [role, 0]))
  for (const member of members) {
    if (counts[member.role] !== undefined) {
      counts[member.role] += 1
    }
  }
  return counts
}

/** Counts per status, for the summary. Derived from loaded rows only. */
export const countMembersByStatus = (members = []) => {
  const counts = Object.fromEntries(MEMBER_STATUSES.map((status) => [status, 0]))
  for (const member of members) {
    if (counts[member.status] !== undefined) {
      counts[member.status] += 1
    }
  }
  return counts
}

// ── Action availability ───────────────────────────────────────────────────────

/**
 * Which actions the UI may offer for one member.
 *
 * This is a *presentation* guard derived from the reported state, not permission
 * logic — see `models/workspacePermission.js` for that, and note that both are
 * advisory next to the backend. Its only job is to avoid offering the one control
 * that cannot be honest: changing or removing the workspace owner.
 */
export const getMemberActions = (member) => {
  if (!member) {
    return { canChangeRole: false, canRemove: false, canResendInvite: false }
  }

  const isOwner = member.role === MEMBER_ROLE.OWNER

  return {
    // Ownership transfer is a different action from a role change, so the owner's
    // role is never editable here.
    canChangeRole: !isOwner,
    canRemove: !isOwner,
    // Resending only makes sense while the invitation is still outstanding.
    canResendInvite: isPendingMember(member),
  }
}

// ── Invite draft ──────────────────────────────────────────────────────────────

/**
 * True when a string is shaped like an email address.
 *
 * Shape only. Whether the address belongs to someone who can be invited is the
 * backend's answer — this file does not check a domain or an account.
 */
export const isPlausibleMemberEmail = (value) => {
  const email = String(value ?? '').trim().toLowerCase()
  return email.length > 0 && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Validates the invite form and builds the payload.
 *
 * Shape and consistency only. A duplicate of an address already on the list is
 * rejected here so the user gets an immediate answer instead of a round trip — but a
 * clean form does not mean the invitation was sent, only that it is well formed.
 * Anything unknown to this model (an existing platform account, a blocked address,
 * a full seat allowance) can only be answered by the backend.
 */
export const buildInviteDraft = (inputs = {}, { existingEmails = [] } = {}) => {
  const email = String(inputs.email ?? '').trim().toLowerCase()
  const errors = {}

  if (!email) {
    errors.email = 'required'
  } else if (!isPlausibleMemberEmail(email)) {
    errors.email = 'format'
  } else if (existingEmails.map((value) => String(value).toLowerCase()).includes(email)) {
    errors.email = 'duplicate'
  }

  const role = isKnownMemberRole(inputs.role) ? inputs.role : DEFAULT_MEMBER_ROLE
  // An invitation may not grant ownership, whatever the payload claims.
  if (!INVITABLE_MEMBER_ROLES.includes(role)) {
    errors.role = 'notAssignable'
    return { email, role, errors, isValid: false }
  }

  return {
    email,
    role,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}

// ── Role-change draft ─────────────────────────────────────────────────────────

/**
 * Validates a role change and builds the payload.
 *
 * The target role must be one this model declares and one an invitation could also
 * grant, so the form can never send a role nobody has described the permissions of.
 * A change to the role the member already holds is reported as unchanged rather than
 * as an error, so the caller can skip the round trip.
 */
export const buildMemberRoleDraft = (inputs = {}, member) => {
  const errors = {}

  if (!member) {
    return { role: null, errors: { member: 'unknown' }, isValid: false, hasChanged: false }
  }

  if (member.role === MEMBER_ROLE.OWNER) {
    return {
      role: member.role,
      errors: { role: 'ownerLocked' },
      isValid: false,
      hasChanged: false,
    }
  }

  const role = readMemberRole(inputs)
  if (!role) {
    errors.role = 'unknown'
  } else if (!readAssignableMemberRole(role)) {
    errors.role = 'notAssignable'
  }

  return {
    role,
    errors,
    isValid: Object.keys(errors).length === 0,
    hasChanged: Boolean(role) && role !== member.role,
  }
}
