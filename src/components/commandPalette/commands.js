import { ROLES } from '@/utils/roles'
import {
  BILLING_PATH,
  SECURITY_PATH,
  WORKSPACE_NAV_ITEMS,
  LEGACY_ACADEMIC_NAV_ITEMS,
} from '@/utils/constants'

/**
 * Command palette sources.
 *
 * Normal platform users get the website-builder navigation. The internal admin
 * additionally gets the legacy academic items so the area stays reachable from
 * search while it exists. Legacy academic roles keep their own portals.
 */
const NAV_BY_ROLE = Object.freeze({
  [ROLES.USER]: WORKSPACE_NAV_ITEMS,
  [ROLES.ADMIN]: [
    ...WORKSPACE_NAV_ITEMS,
    ...LEGACY_ACADEMIC_NAV_ITEMS.map((item) => ({ ...item, isLegacy: true })),
  ],
})

const ACCOUNT_COMMANDS = Object.freeze([
  { key: 'billing', path: BILLING_PATH },
  { key: 'security', path: SECURITY_PATH },
])

const ACCOUNT_COMMAND_PATHS = new Set(ACCOUNT_COMMANDS.map((item) => item.path))

export const isAccountCommand = (path) => ACCOUNT_COMMAND_PATHS.has(path)

export const getCommandsForRole = (role) => NAV_BY_ROLE[role] ?? WORKSPACE_NAV_ITEMS

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
