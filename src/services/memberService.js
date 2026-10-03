import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'
import {
  buildInviteDraft,
  normalizeMember,
  normalizeMemberList,
  readAssignableMemberRole,
} from '@/models/member'

/**
 * Member service — the people in a workspace and the roles they hold there.
 *
 * Follows the same contract as workspaceService, domainService and
 * integrationService:
 *  - Read operations return a safe empty value ([] / null) when the backend is not
 *    connected, so the page shows an honest empty state instead of a seeded member.
 *    There is deliberately no catalog to fall back on: a member is a person, and a
 *    made-up one on a permissions screen is worse than an empty list.
 *  - Every write calls requireBackend() first and throws BackendNotConnectedError,
 *    so nothing here can report an invitation as sent, a role as changed or a member
 *    as removed when none of that happened.
 *
 * This service never sends an email and never grants access. An invitation is a
 * request the backend fulfils; if it refuses, or if no backend exists, the list stays
 * exactly as it was.
 */

const isBackendConnected = () => Boolean(config.api.baseUrl)

const requireBackend = (message) => {
  if (!isBackendConnected()) {
    throw new BackendNotConnectedError(message)
  }
}

const MEMBERS_API_PATH = (workspaceId) => `/workspaces/${workspaceId}/members`

const MEMBER_API_PATH = (workspaceId, memberId) =>
  `${MEMBERS_API_PATH(workspaceId)}/${memberId}`

/** Everyone the backend reports in a workspace. Empty while the API is absent. */
const getMembers = async (workspaceId) => {
  if (!isBackendConnected() || !workspaceId) {
    return []
  }
  return normalizeMemberList(await httpClient.get(MEMBERS_API_PATH(workspaceId)))
}

/**
 * One member, or null when absent, malformed or the API is not connected.
 *
 * A record whose role this model does not declare normalises to null rather than to
 * a guessed role, so a member with an unknown grant is not shown as someone with
 * fewer permissions than they actually have.
 */
const getMember = async (memberId, workspaceId) => {
  if (!isBackendConnected() || !workspaceId || !memberId) {
    return null
  }
  return normalizeMember(await httpClient.get(MEMBER_API_PATH(workspaceId, memberId)))
}

/**
 * Asks the backend to invite someone. Refused until a backend is available.
 *
 * The form is validated here so a malformed address or a role nobody has described
 * the permissions of never leaves the browser. Passing that check means only that the
 * invitation is well formed — whether it was sent, and whether the address belongs to
 * someone who can be invited, is entirely the backend's answer.
 */
const inviteMember = async (workspaceId, inputs = {}, { existingEmails = [] } = {}) => {
  requireBackend('Inviting a member is unavailable until the backend is connected.')

  const draft = buildInviteDraft(inputs, { existingEmails })
  if (!draft.isValid) {
    throw new Error('The invitation details are not valid.')
  }

  return normalizeMember(
    await httpClient.post(MEMBERS_API_PATH(workspaceId), {
      email: draft.email,
      role: draft.role,
    })
  )
}

/**
 * Asks the backend to change a member's role. Refused until a backend is available.
 *
 * Validated here so ownership can never be granted or taken through a role change:
 * `readAssignableMemberRole` refuses `owner` before anything is sent. The list is not
 * reordered locally — the role shown is the one the backend has on record.
 */
const updateMemberRole = async (memberId, workspaceId, role) => {
  requireBackend('Changing a member role is unavailable until the backend is connected.')

  const draft = readAssignableMemberRole(role)
  if (!draft) {
    throw new Error('The member role is not valid.')
  }

  return normalizeMember(
    await httpClient.patch(MEMBER_API_PATH(workspaceId, memberId), { role: draft })
  )
}

/** Asks the backend to remove a member. Refused until a backend is available. */
const removeMember = async (memberId, workspaceId) => {
  requireBackend('Removing a member is unavailable until the backend is connected.')

  return normalizeMember(await httpClient.delete(MEMBER_API_PATH(workspaceId, memberId)))
}

/**
 * Asks the backend to send the invitation again. Refused until a backend is available.
 *
 * Only an outstanding invitation can be resent, and only the backend knows whether the
 * first one was delivered. A refusal leaves the invitation exactly as it was rather
 * than reporting a second email that nobody sent.
 */
const resendInvite = async (memberId, workspaceId) => {
  requireBackend('Resending an invitation is unavailable until the backend is connected.')

  return normalizeMember(
    await httpClient.post(`${MEMBER_API_PATH(workspaceId, memberId)}/invite/resend`)
  )
}

const memberService = {
  getMembers,
  getMember,
  inviteMember,
  updateMemberRole,
  removeMember,
  resendInvite,
}

export default memberService
