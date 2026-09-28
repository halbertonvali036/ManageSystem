import { useCallback, useEffect, useMemo, useState } from 'react'
import notificationsService from '@/services/notificationsService'
import { BackendNotConnectedError, getRequestErrorMessage } from '@/services/httpClient'
import {
  createNotificationPreferencesDraft,
  hasNotificationPreferenceChanges,
  toNotificationPreferences,
} from '@/models/notificationPreferences'

/**
 * Notification preference state.
 *
 * `saved` is only ever set from a backend response. While no backend exists
 * `saved` stays `null`, which is rendered as "not loaded" rather than as a set
 * of preferences the user supposedly has. The draft is local form state and is
 * never persisted or presented as a confirmation.
 */
function useNotificationPreferences() {
  const [saved, setSaved] = useState(null)
  const [draft, setDraft] = useState(() => createNotificationPreferencesDraft())
  const [isLoading, setIsLoading] = useState(true)
  const [isAvailable, setIsAvailable] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [isSaved, setIsSaved] = useState(false)

  const fetchPreferences = useCallback(
    () =>
      notificationsService
        .getNotificationPreferences()
        .then((preferences) => {
          setSaved(preferences)
          setIsAvailable(preferences !== null)
          setLoadError(null)
          if (preferences) {
            setDraft((current) => ({ ...current, ...preferences }))
          }
        })
        .catch((error) => {
          setLoadError(error)
          setIsAvailable(false)
        })
        .finally(() => {
          setIsLoading(false)
        }),
    [],
  )

  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setLoadError(null)
    fetchPreferences()
  }, [fetchPreferences])

  const setPreference = useCallback((key, value) => {
    setIsSaved(false)
    setSaveError(null)
    setDraft((current) => ({ ...current, [key]: value }))
  }, [])

  const dirty = useMemo(() => hasNotificationPreferenceChanges(draft, saved), [draft, saved])

  const save = useCallback(async () => {
    if (isSaving) {
      return false
    }
    setIsSaving(true)
    setSaveError(null)
    setIsSaved(false)
    try {
      const response = await notificationsService.updateNotificationPreferences(draft)
      const normalized = toNotificationPreferences(response)
      if (normalized) {
        setSaved(normalized)
        setDraft((current) => ({ ...current, ...normalized }))
      }
      setIsSaved(true)
      return true
    } catch (error) {
      setSaveError(error)
      return false
    } finally {
      setIsSaving(false)
    }
  }, [draft, isSaving])

  const reset = useCallback(() => {
    setDraft({ ...createNotificationPreferencesDraft(), ...(saved ?? {}) })
    setSaveError(null)
    setIsSaved(false)
  }, [saved])

  return {
    draft,
    saved,
    dirty,
    isLoading,
    isAvailable,
    loadError,
    isSaving,
    isSaved,
    saveError: saveError
      ? saveError instanceof BackendNotConnectedError
        ? 'Notification preferences cannot be saved: the notification service is not connected.'
        : getRequestErrorMessage(saveError)
      : null,
    isSaveUnavailable: saveError instanceof BackendNotConnectedError,
    setPreference,
    save,
    reset,
    refetch,
  }
}

export default useNotificationPreferences
