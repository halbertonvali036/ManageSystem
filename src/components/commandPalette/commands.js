import { ROLES } from '@/utils/roles'
import { SIDEBAR_ITEMS } from '@/utils/constants'
import { TEACHER_NAV_ITEMS } from '@/utils/teacherConstants'
import { STUDENT_NAV_ITEMS } from '@/utils/studentConstants'

export const COMMANDS_BY_ROLE = Object.freeze({
  [ROLES.ADMIN]: SIDEBAR_ITEMS,
  [ROLES.TEACHER]: TEACHER_NAV_ITEMS,
  [ROLES.STUDENT]: STUDENT_NAV_ITEMS,
})

export const getCommandsForRole = (role) => COMMANDS_BY_ROLE[role] ?? []

const normalize = (value) => value.trim().toLowerCase()

export const findCommandByPath = (commands, path) =>
  commands.find((command) => command.path === path)

export const filterCommands = (commands, query) => {
  const needle = normalize(query)
  if (!needle) {
    return commands
  }
  return commands.filter((command) => {
    const haystack = normalize(`${command.label} ${command.path}`)
    return haystack.includes(needle)
  })
}