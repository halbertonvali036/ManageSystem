import { useCallback, useEffect, useMemo, useState } from 'react'
import activityService, { isActivityBackendConnected } from '@/services/activityService'
import {
  ACTIVITY_FILTER_ALL,
  ACTIVITY_SCOPE,
  countActivityByType,
  filterActivity,
  getActivityActors,
  isActivityFiltered,
  sortActivity,
} from '@/models/activity'
import { summarizeUsage } from '@/models/usage'

/**
 * Loads a scope's activity stream, usage figures and plan limits, and owns the
 * filters for the event list.
 *
 * Three reads, because they are three different facts: what happened, how much is
 * being consumed, and how much of the plan is left. They are fetched together for
 * the page's sake but kept in separate slots, so a workspace that reports events
 * but not usage still shows its trail with honest "unavailable" tiles beside it.
 *
 * Every filter runs over what has been loaded. None of them triggers a request, and
 * none of them can widen the result: a filter matching nothing yields an empty list.
 *
 * @param {string|null} workspaceId  Scope to the workspace, or null for the platform stream.
 * @param {string}      [scope]      `workspace` (default) or `platform`.
 * @param {boolean}     [enabled]
 */
function useActivity(workspaceId, { scope, enabled = true } = {}) {
  const resolvedScope = scope ?? (workspaceId ? ACTIVITY_SCOPE.WORKSPACE : ACTIVITY_SCOPE.PLATFORM)

  const [revision, setRevision] = useState(0)
  const [result, setResult] = useState({ key: null, events: [], usage: null, limits: null, error: null })

  const [type, setType] = useState(ACTIVITY_FILTER_ALL)
  const [actorId, setActorId] = useState(ACTIVITY_FILTER_ALL)
  const [query, setQuery] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const requestKey = enabled ? `${resolvedScope}|${workspaceId ?? ''}|${revision}` : null

  useEffect(() => {
    if (requestKey === null) {
      return undefined
    }

    let isActive = true

    // `allSettled` on purpose: usage and limits are optional extras, and one of
    // them being missing must not hide the activity trail, which is the page's
    // primary content.
    Promise.allSettled([
      activityService.getActivity({ workspaceId, scope: resolvedScope }),
      workspaceId ? activityService.getUsage(workspaceId) : Promise.resolve(null),
      workspaceId ? activityService.getUsageLimits(workspaceId) : Promise.resolve(null),
    ]).then(([activityResult, usageResult, limitsResult]) => {
      if (!isActive) return

      const failed = [activityResult, usageResult, limitsResult].find(
        (outcome) => outcome.status === 'rejected',
      )

      setResult({
        key: requestKey,
        events: activityResult.status === 'fulfilled' ? activityResult.value : [],
        usage: usageResult.status === 'fulfilled' ? usageResult.value : null,
        limits: limitsResult.status === 'fulfilled' ? limitsResult.value : null,
        error: failed ? failed.reason : null,
      })
    })

    return () => {
      isActive = false
    }
  }, [requestKey, workspaceId, resolvedScope])

  const isMatched = result.key === requestKey
  const events = useMemo(() => (isMatched ? sortActivity(result.events) : []), [isMatched, result.events])

  const filters = useMemo(
    () => ({ type, actorId, query, from, to }),
    [type, actorId, query, from, to],
  )

  const visibleEvents = useMemo(() => filterActivity(events, filters), [events, filters])

  /**
   * The people who actually appear in this trail.
   *
   * Derived from the loaded events, not from the member list: the filter can only
   * offer somebody who did something recorded here. With no events there is nobody
   * to offer, which is more honest than a dropdown of members who never acted.
   */
  const actors = useMemo(() => getActivityActors(events), [events])

  const typeCounts = useMemo(() => countActivityByType(events), [events])
  const usage = isMatched ? result.usage : null
  const limits = isMatched ? result.limits : null
  const usageSummary = useMemo(() => summarizeUsage(usage, limits), [usage, limits])

  const refetch = useCallback(() => {
    if (!enabled) return
    setRevision((value) => value + 1)
  }, [enabled])

  const clearFilters = useCallback(() => {
    setType(ACTIVITY_FILTER_ALL)
    setActorId(ACTIVITY_FILTER_ALL)
    setQuery('')
    setFrom('')
    setTo('')
  }, [])

  return {
    events,
    visibleEvents,
    actors,
    typeCounts,
    usage,
    limits,
    usageSummary,
    isLoading: requestKey !== null && !isMatched,
    error: isMatched ? result.error : null,
    /**
     * True when no backend is configured, which is different from "no events were
     * recorded". The page says which of the two it is showing.
     */
    isUnavailable: isMatched && !isActivityBackendConnected(),
    type,
    setType,
    actorId,
    setActorId,
    query,
    setQuery,
    from,
    setFrom,
    to,
    setTo,
    isFiltered: isActivityFiltered(filters),
    clearFilters,
    refetch,
  }
}

export default useActivity
