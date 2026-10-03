import { useCallback, useEffect, useMemo, useState } from 'react'
import memberService from '@/services/memberService'
import {
  MEMBER_FILTER_ALL,
  MEMBER_STATUS,
  countMembersByRole,
  countMembersByStatus,
  filterMembers,
  sortMembers,
} from '@/models/member'

/**
 * Loads a workspace's members and owns the search / role / status filters.
 *
 * There is no catalog to fall back on here, unlike integrations: a member is a person
 * the backend put on record, so a workspace with no backend reports no members and the
 * list stays empty. That is the honest answer — seeding a placeholder person would put
 * a stranger's name next to a permissions table.
 *
 * All filters run over the loaded list; nothing is fetched per keystroke.
 */
function useWorkspaceMembers(workspaceId, { enabled = true } = {}) {
  const [reloadToken, setReloadToken] = useState(0)
  const [result, setResult] = useState({ key: null, members: [], error: null })

  const [query, setQuery] = useState('')
  const [role, setRole] = useState(MEMBER_FILTER_ALL)
  const [status, setStatus] = useState(MEMBER_FILTER_ALL)

  const requestKey = enabled && workspaceId ? `${workspaceId}|${reloadToken}` : null

  useEffect(() => {
    if (requestKey === null) {
      return undefined
    }

    let isActive = true

    memberService
      .getMembers(workspaceId)
      .then((members) => {
        if (isActive) {
          setResult({ key: requestKey, members, error: null })
        }
      })
      .catch((error) => {
        if (isActive) {
          setResult({ key: requestKey, members: [], error })
        }
      })

    return () => {
      isActive = false
    }
  }, [requestKey, workspaceId])

  const isMatched = result.key === requestKey
  const members = useMemo(
    () => (isMatched ? sortMembers(result.members) : []),
    [isMatched, result.members]
  )

  const refetch = useCallback(() => {
    if (!enabled || !workspaceId) return
    setReloadToken((token) => token + 1)
  }, [enabled, workspaceId])

  const visibleMembers = useMemo(
    () => filterMembers(members, { query, role, status }),
    [members, query, role, status]
  )

  const roleCounts = useMemo(() => countMembersByRole(members), [members])
  const statusCounts = useMemo(() => countMembersByStatus(members), [members])

  const isFiltered =
    query.trim().length > 0 ||
    role !== MEMBER_FILTER_ALL ||
    status !== MEMBER_FILTER_ALL

  const clearFilters = useCallback(() => {
    setQuery('')
    setRole(MEMBER_FILTER_ALL)
    setStatus(MEMBER_FILTER_ALL)
  }, [])

  return {
    members,
    visibleMembers,
    total: members.length,
    activeCount: statusCounts[MEMBER_STATUS.ACTIVE],
    invitedCount: statusCounts[MEMBER_STATUS.INVITED],
    suspendedCount: statusCounts[MEMBER_STATUS.SUSPENDED],
    roleCounts,
    statusCounts,
    isLoading: requestKey !== null && !isMatched,
    error: isMatched ? result.error : null,
    query,
    setQuery,
    role,
    setRole,
    status,
    setStatus,
    isFiltered,
    clearFilters,
    refetch,
  }
}

export default useWorkspaceMembers
