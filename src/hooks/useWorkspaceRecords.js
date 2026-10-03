import { useCallback, useEffect, useMemo, useState } from 'react'
import databaseService from '@/services/databaseService'
import {
  ALL_RECORDS_FILTER,
  filterRecords,
  getRecordFilterOptions,
  NO_RECORD_SORT,
  RECORD_SORT_DIRECTION,
  sortRecords,
} from '@/models/record'

const NO_RECORDS = Object.freeze([])

/**
 * Loads the records of one model and owns the search / filter / sort state.
 *
 * All three operate on the records that were actually read: nothing is fetched
 * per keystroke and nothing is invented to fill a result. Without a backend the
 * list is empty, so the honest empty state renders and the toolbar stays inert.
 *
 * `fields` is the model's field list. It is required, because the schema decides
 * the columns, the searchable text and the sortable types.
 */
function useWorkspaceRecords(workspaceId, modelId, fields = [], { enabled = true } = {}) {
  const [reloadToken, setReloadToken] = useState(0)
  const [result, setResult] = useState({
    key: null,
    records: NO_RECORDS,
    error: null,
  })

  const [query, setQuery] = useState('')
  const [filterField, setFilterField] = useState('')
  const [filterValue, setFilterValue] = useState(ALL_RECORDS_FILTER)
  const [sort, setSort] = useState({
    key: NO_RECORD_SORT,
    direction: RECORD_SORT_DIRECTION.ASC,
  })

  // Fields arrive with the model, so a schema change has to restart the load
  // rather than keep the previous column set.
  const schemaKey = (fields ?? []).map((field) => field.key).join('|')

  const requestKey =
    enabled && workspaceId && modelId
      ? `${workspaceId}|${modelId}|${schemaKey}|${reloadToken}`
      : null

  useEffect(() => {
    if (requestKey === null) {
      return undefined
    }

    let isActive = true

    databaseService
      .getRecords(workspaceId, modelId, fields)
      .then((records) => {
        if (isActive) {
          setResult({ key: requestKey, records, error: null })
        }
      })
      .catch((error) => {
        if (isActive) {
          setResult({ key: requestKey, records: NO_RECORDS, error })
        }
      })

    return () => {
      isActive = false
    }
  }, [requestKey, workspaceId, modelId]) // eslint-disable-line react-hooks/exhaustive-deps

  const isLoading = requestKey !== null && result.key !== requestKey
  const records = result.key === requestKey ? result.records : NO_RECORDS

  const refetch = useCallback(() => {
    if (!enabled || !workspaceId || !modelId) return
    setReloadToken((token) => token + 1)
  }, [enabled, workspaceId, modelId])

  // Options come from the loaded rows only, so the filter can never offer a
  // value that has no record behind it in this page.
  const filterOptions = useMemo(
    () => getRecordFilterOptions(records, filterField),
    [records, filterField]
  )

  const visibleRecords = useMemo(() => {
    const matched = filterRecords(
      records,
      { query, fieldKey: filterField, value: filterValue },
      fields
    )
    return sortRecords(matched, { key: sort.key, direction: sort.direction }, fields)
  }, [records, query, filterField, filterValue, sort, fields])

  const isFiltered =
    query.trim().length > 0 ||
    filterValue !== ALL_RECORDS_FILTER ||
    sort.key !== NO_RECORD_SORT

  const clearFilters = useCallback(() => {
    setQuery('')
    setFilterField('')
    setFilterValue(ALL_RECORDS_FILTER)
    setSort({ key: NO_RECORD_SORT, direction: RECORD_SORT_DIRECTION.ASC })
  }, [])

  /**
   * Clicking the active column flips the direction; a new column starts
   * ascending. One state object, so the key and its direction can never disagree
   * and a double-invoked update cannot flip twice.
   */
  const toggleSort = useCallback((key) => {
    setSort((previous) =>
      previous.key === key
        ? {
            key,
            direction:
              previous.direction === RECORD_SORT_DIRECTION.ASC
                ? RECORD_SORT_DIRECTION.DESC
                : RECORD_SORT_DIRECTION.ASC,
          }
        : { key, direction: RECORD_SORT_DIRECTION.ASC }
    )
  }, [])

  /** Sets an explicit sort from the toolbar's two selects. */
  const applySort = useCallback((key, direction) => {
    setSort({
      key,
      direction:
        direction === RECORD_SORT_DIRECTION.DESC
          ? RECORD_SORT_DIRECTION.DESC
          : RECORD_SORT_DIRECTION.ASC,
    })
  }, [])

  return {
    records,
    visibleRecords,
    total: records.length,
    isLoading,
    error: result.key === requestKey ? result.error : null,
    query,
    setQuery,
    filterField,
    setFilterField,
    filterValue,
    setFilterValue,
    filterOptions,
    sortKey: sort.key,
    sortDirection: sort.direction,
    toggleSort,
    applySort,
    isFiltered,
    clearFilters,
    refetch,
  }
}

export default useWorkspaceRecords
