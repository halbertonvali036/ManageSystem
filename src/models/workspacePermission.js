/**
 * Workspace permission foundation — what each role may do inside a workspace.
 *
 * ── What this file is ─────────────────────────────────────────────────────────
 *
 * This is the frontend's *vocabulary* for workspace capabilities. It answers two
 * questions and nothing else:
 *   1. Which workspace actions exist (the list the rest of the product maps onto).
 *   2. Which role holds which action.
 *
 * ── What this file is not ─────────────────────────────────────────────────────
 *
 * It is NOT authorization. Hiding a button is a presentation decision; the backend
 * has to enforce every rule again, because anything in the browser can be bypassed
 * by calling the endpoint directly. Every check here is therefore advisory and is
 * documented as such — see the note on `hasWorkspacePermission`.
 *
 * ── Rules ─────────────────────────────────────────────────────────────────────
 *
 * - An unknown role holds nothing. A role this file does not declare is not a role
 *   it can reason about, so it is denied rather than guessed.
 * - An unknown action is denied for every role, so a typo in a caller cannot
 *   accidentally widen access.
 * - The list is closed. A capability is not "allowed" simply because it is missing
 *   from this file; it is denied. New capabilities have to be declared here on
 *   purpose, alongside the copy that explains them.
 * - A viewer is not the absence of a feature — it is read access, and this file only
 *   names mutating actions. So an empty viewer column is the correct answer, not a
 *   missing one.
 */

import { MEMBER_ROLE, MEMBER_ROLES } from '@/models/member'

// ── Workspace actions ─────────────────────────────────────────────────────────

/**
 * The workspace capabilities a role can hold.
 *
 * These map one-to-one onto the existing workspace sections, so a permission never
 * describes something the product does not already have:
 *   manageWorkspace     → workspace settings
 *   manageSites         → create / delete sites
 *   editSite            → the site editor and its settings
 *   publish             → the publishing flow
 *   manageDatabase      → schema builder and records
 *   manageIntegrations  → external services
 *   manageBilling       → plan and payment
 *   manageMembers       → this section
 */
export const WORKSPACE_ACTION = Object.freeze({
  MANAGE_WORKSPACE: 'manageWorkspace',
  MANAGE_SITES: 'manageSites',
  EDIT_SITE: 'editSite',
  PUBLISH: 'publish',
  MANAGE_DATABASE: 'manageDatabase',
  MANAGE_INTEGRATIONS: 'manageIntegrations',
  MANAGE_BILLING: 'manageBilling',
  MANAGE_MEMBERS: 'manageMembers',
})

/**
 * @typedef {Object} WorkspaceActionDefinition
 * @property {string} key           Machine key, also the translation key suffix.
 * @property {string} labelKey      Translation key for the row label.
 * @property {string} descriptionKey Translation key for the one-line explanation.
 *
 * @typedef {Object} WorkspaceRoleDefinition
 * @property {string} role        One of MEMBER_ROLE.
 * @property {string} labelKey     Translation key for the column header.
 * @property {string} descriptionKey Translation key for what the role is for.
 */

const ACTION_DEFINITIONS = Object.freeze([
  {
    key: WORKSPACE_ACTION.MANAGE_WORKSPACE,
    labelKey: 'workspaceMembers.permissions.manageWorkspace',
    descriptionKey: 'workspaceMembers.permissions.manageWorkspaceHint',
  },
  {
    key: WORKSPACE_ACTION.MANAGE_SITES,
    labelKey: 'workspaceMembers.permissions.manageSites',
    descriptionKey: 'workspaceMembers.permissions.manageSitesHint',
  },
  {
    key: WORKSPACE_ACTION.EDIT_SITE,
    labelKey: 'workspaceMembers.permissions.editSite',
    descriptionKey: 'workspaceMembers.permissions.editSiteHint',
  },
  {
    key: WORKSPACE_ACTION.PUBLISH,
    labelKey: 'workspaceMembers.permissions.publish',
    descriptionKey: 'workspaceMembers.permissions.publishHint',
  },
  {
    key: WORKSPACE_ACTION.MANAGE_DATABASE,
    labelKey: 'workspaceMembers.permissions.manageDatabase',
    descriptionKey: 'workspaceMembers.permissions.manageDatabaseHint',
  },
  {
    key: WORKSPACE_ACTION.MANAGE_INTEGRATIONS,
    labelKey: 'workspaceMembers.permissions.manageIntegrations',
    descriptionKey: 'workspaceMembers.permissions.manageIntegrationsHint',
  },
  {
    key: WORKSPACE_ACTION.MANAGE_BILLING,
    labelKey: 'workspaceMembers.permissions.manageBilling',
    descriptionKey: 'workspaceMembers.permissions.manageBillingHint',
  },
  {
    key: WORKSPACE_ACTION.MANAGE_MEMBERS,
    labelKey: 'workspaceMembers.permissions.manageMembers',
    descriptionKey: 'workspaceMembers.permissions.manageMembersHint',
  },
])

/** Every declared action, in display order. */
export const WORKSPACE_ACTIONS = Object.freeze(
  ACTION_DEFINITIONS.map((definition) => definition.key)
)

const ACTION_KEYS_SET = new Set(WORKSPACE_ACTIONS)

export const isKnownWorkspaceAction = (action) => ACTION_KEYS_SET.has(action)

export const getWorkspaceActionDefinition = (action) =>
  ACTION_DEFINITIONS.find((definition) => definition.key === action) ?? null

// ── Role vocabulary ───────────────────────────────────────────────────────────

/**
 * What each role is for, in one line each.
 *
 * The copy lives in the locale files; this only holds the keys, so the file stays
 * locale-free and the UI resolves them with the active language.
 */
export const WORKSPACE_ROLE_DEFINITIONS = Object.freeze({
  [MEMBER_ROLE.OWNER]: {
    role: MEMBER_ROLE.OWNER,
    labelKey: 'workspaceMembers.role.owner',
    descriptionKey: 'workspaceMembers.roleDescription.owner',
  },
  [MEMBER_ROLE.ADMIN]: {
    role: MEMBER_ROLE.ADMIN,
    labelKey: 'workspaceMembers.role.admin',
    descriptionKey: 'workspaceMembers.roleDescription.admin',
  },
  [MEMBER_ROLE.EDITOR]: {
    role: MEMBER_ROLE.EDITOR,
    labelKey: 'workspaceMembers.role.editor',
    descriptionKey: 'workspaceMembers.roleDescription.editor',
  },
  [MEMBER_ROLE.VIEWER]: {
    role: MEMBER_ROLE.VIEWER,
    labelKey: 'workspaceMembers.role.viewer',
    descriptionKey: 'workspaceMembers.roleDescription.viewer',
  },
})

export const getWorkspaceRoleDefinition = (role) =>
  WORKSPACE_ROLE_DEFINITIONS[role] ?? null

// ── Grants ────────────────────────────────────────────────────────────────────

/**
 * Which actions each role holds.
 *
 * Billing is deliberately absent from `admin`: the plan and payment method belong to
 * the account that pays for the workspace, and handing them to a second role would
 * mean a payment change could be made by someone who is not the owner. Everything
 * else an admin needs to run the workspace, they have.
 *
 * An editor can change and publish a site but cannot create or delete one, and
 * cannot reach the schema, the integrations or the people. A viewer holds no action
 * in this list at all — see the note at the top of the file.
 */
const ROLE_GRANTS = Object.freeze({
  [MEMBER_ROLE.OWNER]: WORKSPACE_ACTIONS,
  [MEMBER_ROLE.ADMIN]: Object.freeze(
    WORKSPACE_ACTIONS.filter((action) => action !== WORKSPACE_ACTION.MANAGE_BILLING)
  ),
  [MEMBER_ROLE.EDITOR]: Object.freeze([
    WORKSPACE_ACTION.EDIT_SITE,
    WORKSPACE_ACTION.PUBLISH,
  ]),
  [MEMBER_ROLE.VIEWER]: Object.freeze([]),
})

/** Frozen lookup so callers cannot widen a role by mutating the table. */
const ROLE_GRANT_SETS = Object.freeze(
  Object.fromEntries(
    Object.entries(ROLE_GRANTS).map(([role, actions]) => [
      role,
      new Set(actions),
    ])
  )
)

/** Actions a role holds, in the declared display order. Empty for an unknown role. */
export const getRolePermissions = (role) => Object.freeze([...(ROLE_GRANTS[role] ?? [])])

/**
 * True when a role holds an action.
 *
 * ADVISORY ONLY. This decides whether the UI may *offer* something; it never decides
 * whether the request is allowed. The backend is the only authority — an unknown
 * role is denied here and must also be denied there.
 */
export const hasWorkspacePermission = (role, action) =>
  ROLE_GRANT_SETS[role]?.has(action) ?? false

/** A role holds every declared action. Used only for the "full access" summary. */
export const hasFullWorkspaceAccess = (role) =>
  getRolePermissions(role).length === WORKSPACE_ACTIONS.length

/**
 * The actions a role does *not* hold.
 *
 * Expressed as a subtraction rather than as a second hand-written table, so the two
 * can never drift apart: a permission removed from the grants disappears here by
 * itself.
 */
export const getMissingRolePermissions = (role) =>
  Object.freeze(
    WORKSPACE_ACTIONS.filter((action) => !hasWorkspacePermission(role, action))
  )

/**
 * One table row per action, each carrying what every role may do with it.
 *
 * The matrix is the honest presentation of the grant table: an empty cell means the
 * role does not hold the action, and nothing in this file can render a check that
 * the grant table does not contain.
 */
export const getWorkspacePermissionMatrix = () =>
  Object.freeze(
    ACTION_DEFINITIONS.map((definition) =>
      Object.freeze({
        action: definition.key,
        labelKey: definition.labelKey,
        descriptionKey: definition.descriptionKey,
        roles: Object.freeze(
          Object.fromEntries(
            MEMBER_ROLES.map((role) => [role, hasWorkspacePermission(role, definition.key)])
          )
        ),
      })
    )
  )

/**
 * Count of declared actions a role holds, for the summary strip.
 *
 * Denominator is `WORKSPACE_ACTIONS.length`, not the number a role happens to hold,
 * so a role can never report "3 of 3" by holding the three it was given.
 */
export const countRolePermissions = (role) => getRolePermissions(role).length
