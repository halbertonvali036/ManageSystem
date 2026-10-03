import { ROLES } from '@/utils/roles'
import {
  ACCOUNT_NAV_ITEMS,
  ADMIN_NAV_ITEMS,
  getWorkspaceNavItems,
} from '@/utils/constants'

/**
 * Account destinations the palette can jump to.
 *
 * Every entry is a route, so the palette offers exactly the account destinations
 * the sidebar lists. Profile is here even though the rail shows it as the pinned
 * identity block: the palette is a search box, and a destination it cannot reach
 * would read as a missing page rather than as a deliberate placement.
 */
const ACCOUNT_COMMANDS = Object.freeze(
  ACCOUNT_NAV_ITEMS.map((item) => ({ ...item, isAccount: true })),
)

/**
 * The palette indexes exactly what the sidebar renders.
 *
 * Built from the same groups rather than from a hand-kept second list, so a
 * destination cannot be searchable in the palette and missing from the rail, or
 * the other way round. Workspace-scoped commands follow the workspace currently
 * open, which is why the palette takes a workspace id rather than a flat list.
 */
export const getCommandsForRole = (role, workspaceId) => {
  const product = role === ROLES.ADMIN ? ADMIN_NAV_ITEMS : getWorkspaceNavItems(workspaceId)
  return [...product, ...ACCOUNT_COMMANDS]
}

export const isAccountCommand = (command) => command?.isAccount === true

const normalize = (value) => value.trim().toLowerCase()

/**
 * Searches both the visible label and the route, so a visitor can type either
 * "websites" or "/sites".
 */
export const filterCommands = (commands, query, getLabel) => {
  const needle = normalize(query)
  if (!needle) {
    return commands
  }
  return commands.filter((command) => {
    const label = getLabel(command)
    const haystack = normalize(`${label} ${command.path}`)
    return haystack.includes(needle)
  })
}

export const findCommandByPath = (commands, path) =>
  commands.find((command) => command.path === path)