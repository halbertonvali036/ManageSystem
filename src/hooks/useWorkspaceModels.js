import { useCallback, useEffect, useMemo, useState } from 'react'
import databaseService from '@/services/databaseService'
import {
  countModelFields,
  filterModels,
} from '@/models/database'

const NO_MODELS = Object.freeze([])

/**
 * Loads every model in a workspace's schema.
 *
 * Mirrors useWorkspaceSites, but scoped to the schema instead of the sites. The
 * search filter happens on already-loaded data. Without a backend the list is
 * empty and the honest empty state renders — no sample model is invented.
 */
function useWorkspaceModels(workspaceId, { enabled = true } = {}) {
  const [reloadToken, setReloadToken] = useState(0)
  const [result, setResult] = useState({
    key: null,
    models: NO_MODELS,
    error: null,
  })

  const [query, setQuery] = useState('')

  const requestKey =
    enabled && workspaceId ? `${workspaceId}|${reloadToken}` : null

  useEffect(() => {
    if (requestKey === null) {
      return undefined
    }

    let isActive = true

    databaseService
      .getModels(workspaceId)
      .then((models) => {
        if (isActive) {
          setResult({ key: requestKey, models, error: null })
        }
      })
      .catch((error) => {
        if (isActive) {
          setResult({ key: requestKey, models: NO_MODELS, error })
        }
      })

    return () => {
      isActive = false
    }
  }, [requestKey, workspaceId])

  const isLoading = requestKey !== null && result.key !== requestKey
  const models = result.key === requestKey ? result.models : NO_MODELS

  const refetch = useCallback(() => {
    if (!enabled || !workspaceId) return
    setReloadToken((token) => token + 1)
  }, [enabled, workspaceId])

  const visibleModels = useMemo(() => filterModels(models, { query }), [models, query])

  const isFiltered = query.trim().length > 0

  const clearFilters = useCallback(() => {
    setQuery('')
  }, [])

  return {
    models,
    visibleModels,
    total: models.length,
    fieldCount: countModelFields(models),
    isLoading,
    error: result.key === requestKey ? result.error : null,
    query,
    setQuery,
    isFiltered,
    clearFilters,
    refetch,
  }
}

export default useWorkspaceModels
