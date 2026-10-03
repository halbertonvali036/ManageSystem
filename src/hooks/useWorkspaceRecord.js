import { useCallback, useEffect, useState } from 'react'
import databaseService from '@/services/databaseService'

const NOT_FOUND = { key: null, record: null, error: null }

/**
 * Loads one record of one model.
 *
 * `fields` is required so the record is normalized against the model schema: a
 * response cannot introduce columns the model does not declare. Returns null
 * while the API is absent, which the page renders as "not found" rather than as
 * an empty record it would then offer to save.
 */
function useWorkspaceRecord(workspaceId, modelId, recordId, fields = [], { enabled = true } = {}) {
  const [reloadToken, setReloadToken] = useState(0)
  const [result, setResult] = useState(NOT_FOUND)

  const schemaKey = (fields ?? []).map((field) => field.key).join('|')

  const requestKey =
    enabled && workspaceId && modelId && recordId
      ? `${workspaceId}|${modelId}|${recordId}|${schemaKey}|${reloadToken}`
      : null

  useEffect(() => {
    if (requestKey === null) {
      return undefined
    }

    let isActive = true

    databaseService
      .getRecord(workspaceId, modelId, recordId, fields)
      .then((record) => {
        if (isActive) {
          setResult({ key: requestKey, record, error: null })
        }
      })
      .catch((error) => {
        if (isActive) {
          setResult({ key: requestKey, record: null, error })
        }
      })

    return () => {
      isActive = false
    }
  }, [requestKey, workspaceId, modelId, recordId]) // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = useCallback(() => {
    if (!enabled || !workspaceId || !modelId || !recordId) return
    setReloadToken((token) => token + 1)
  }, [enabled, workspaceId, modelId, recordId])

  const isMatched = result.key === requestKey

  return {
    record: isMatched ? result.record : null,
    isLoading: requestKey !== null && !isMatched,
    error: isMatched ? result.error : null,
    refetch,
  }
}

export default useWorkspaceRecord
