import { useCallback, useEffect, useState } from 'react'
import adminPlatformService from '@/services/adminPlatformService'
import { BackendNotConnectedError } from '@/services/httpClient'

/** Ignore stale responses after a filter change, retry or route transition. */
export default function useAdminResource(resource, { search = '', role = '', status = '' } = {}) {
  const [revision, setRevision] = useState(0)
  const key = JSON.stringify([resource, search, role, status, revision])
  const [result, setResult] = useState({ data: null, state: 'loading', key: null })
  useEffect(() => {
    let active = true
    const request = resource === 'overview' ? adminPlatformService.getOverview()
      : resource === 'settings' ? adminPlatformService.getSettings()
        : adminPlatformService.getCollection(resource, { search, role, status })
    request.then(data => {
      if (active) setResult({ data, state: 'ready', key })
    }).catch(error => {
      if (active) setResult({ data: null, state: error instanceof BackendNotConnectedError ? 'unavailable' : 'error', key })
    })
    return () => { active = false }
  }, [resource, search, role, status, key])
  const retry = useCallback(() => setRevision(value => value + 1), [])
  return { ...(result.key === key ? result : { data: null, state: 'loading' }), retry }
}
