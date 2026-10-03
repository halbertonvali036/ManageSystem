import config from '@/config'
import httpClient from '@/services/httpClient'
import {
  ACTIVITY_SCOPE,
  normalizeActivityList,
  readActivityPayload,
} from '@/models/activity'
import { normalizeUsage, normalizeUsageLimits } from '@/models/usage'

/**
 * Activity & usage service — the read side of `Fəaliyyət`.
 *
 * Follows the same read contract as memberService: with no backend connected these
 * calls resolve to an empty list or null instead of throwing, so the page can render
 * an honest "nothing recorded yet" state rather than an error. A list that is empty
 * because nothing happened and a list that cannot be read are different facts, and
 * the UI is able to say which one it is showing.
 *
 * There are no writes here. Recording an event is the backend's job: an activity log
 * the browser can append to is not an activity log, it is a local scratchpad that
 * loses everything on reload.
 *
 * This service serves two callers from one implementation — a workspace and, later,
 * the platform-wide admin audit view. The scope picks the endpoint; the model, the
 * normalization and the filters are the same objects in both cases, so the two
 * views cannot drift into describing the same event differently.
 */

const isBackendConnected = () => Boolean(config.api.baseUrl)

/**
 * Whether a backend is configured at all.
 *
 * Exported so a caller can tell "the API sent me no events" (an empty list) from
 * "there is no API" (unavailable). That distinction decides whether a page shows an
 * empty trail or an unavailable notice, and guessing it would be a small lie in one
 * direction or the other.
 */
export const isActivityBackendConnected = isBackendConnected

const WORKSPACE_ACTIVITY_PATH = (workspaceId) => `/workspaces/${workspaceId}/activity`
const WORKSPACE_USAGE_PATH = (workspaceId) => `/workspaces/${workspaceId}/usage`
const WORKSPACE_USAGE_LIMITS_PATH = (workspaceId) => `${WORKSPACE_USAGE_PATH(workspaceId)}/limits`

/**
 * The platform-wide stream, on the `/admin/audit` route the notification model
 * already reserves for exactly this. Declared once so a future admin page does not
 * invent a second path for the same events.
 */
const PLATFORM_ACTIVITY_PATH = '/admin/audit'

/** Resolves the scope to an endpoint. An unknown scope is refused, not guessed. */
const activityPath = (scope, workspaceId) => {
  if (scope === ACTIVITY_SCOPE.PLATFORM) return PLATFORM_ACTIVITY_PATH
  if (scope === ACTIVITY_SCOPE.WORKSPACE && workspaceId) {
    return WORKSPACE_ACTIVITY_PATH(workspaceId)
  }
  return null
}

/**
 * The recorded events for a scope.
 *
 * `query` may carry narrowing parameters (`type`, `actorId`, `from`, `to`, `page`) so
 * a backend that can page or narrow the stream server-side may do so. Nothing here
 * depends on it: the client filters whatever rows it receives, so a backend that
 * ignores these parameters still produces a correct, if shorter, page. Rows the
 * model cannot describe are dropped, and with no backend the result is an empty
 * list — never a placeholder event.
 */
const getActivity = async ({ workspaceId, scope, query } = {}) => {
  const resolvedScope = scope ?? (workspaceId ? ACTIVITY_SCOPE.WORKSPACE : ACTIVITY_SCOPE.PLATFORM)
  const basePath = activityPath(resolvedScope, workspaceId)

  if (!isBackendConnected() || !basePath) {
    return []
  }

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== null && value !== undefined && value !== '') {
      params.set(key, String(value))
    }
  }
  const search = params.toString()

  return normalizeActivityList(
    readActivityPayload(await httpClient.get(search ? `${basePath}?${search}` : basePath)),
  )
}

/**
 * What the workspace is consuming, or null when it has not been reported.
 *
 * Null is the honest answer here, not zero: an unreported usage figure must not
 * become "0 websites" on a billing-shaped screen. `normalizeUsage` returns one entry
 * per declared metric, with `value: null` for the ones the backend did not send.
 */
const getUsage = async (workspaceId) => {
  if (!isBackendConnected() || !workspaceId) {
    return null
  }
  return normalizeUsage(await httpClient.get(WORKSPACE_USAGE_PATH(workspaceId)))
}

/**
 * The plan's ceilings for those metrics, or null when the plan states none.
 *
 * Separate from `getUsage` because they come from different places and arrive at
 * different times: usage is a measurement, a limit is a contract. Joining them here
 * would mean inventing one when the backend has only the other.
 */
const getUsageLimits = async (workspaceId) => {
  if (!isBackendConnected() || !workspaceId) {
    return null
  }
  return normalizeUsageLimits(await httpClient.get(WORKSPACE_USAGE_LIMITS_PATH(workspaceId)))
}

const activityService = {
  getActivity,
  getUsage,
  getUsageLimits,
}

export default activityService
