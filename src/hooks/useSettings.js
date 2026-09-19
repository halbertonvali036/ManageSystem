import { useCallback, useEffect, useRef, useState } from 'react'
import settingsService from '@/services/settingsService'
import { BackendNotConnectedError } from '@/services/httpClient'
import { createDefaultSettings, toSettingsValues } from '@/models/settings'

const SAVE_UNAVAILABLE_MESSAGE =
  'Backend API is not connected yet. Settings cannot be saved.'

const getSaveErrorMessage = (error) => {
  if (error instanceof BackendNotConnectedError) {
    return SAVE_UNAVAILABLE_MESSAGE
  }
  return error?.message ?? 'Could not save settings.'
}

function useSettings() {
  const [values, setValues] = useState(createDefaultSettings)
  const [baseline, setBaseline] = useState(createDefaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [backendUnavailable, setBackendUnavailable] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saved, setSaved] = useState(false)
  const saveInFlightRef = useRef(false)

  const applyLoadedValues = (data) => {
    const normalized = data
      ? toSettingsValues(data)
      : createDefaultSettings()
    setValues(normalized)
    setBaseline(normalized)
    setBackendUnavailable(false)
    setSaveError(null)
    setSaved(false)
  }

  const handleLoadFailure = (requestError) => {
    if (requestError instanceof BackendNotConnectedError) {
      setBackendUnavailable(true)
      return
    }
    setLoadError(requestError?.message ?? 'Could not load settings.')
  }

  useEffect(() => {
    let isActive = true
    settingsService
      .getSettings()
      .then((data) => {
        if (!isActive) {
          return
        }
        applyLoadedValues(data)
      })
      .catch((requestError) => {
        if (!isActive) {
          return
        }
        handleLoadFailure(requestError)
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })
    return () => {
      isActive = false
    }
  }, [])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setLoadError(null)
    setBackendUnavailable(false)
    settingsService
      .getSettings()
      .then(applyLoadedValues)
      .catch(handleLoadFailure)
      .finally(() => setIsLoading(false))
  }, [])

  const dirty = JSON.stringify(values) !== JSON.stringify(baseline)

  const updateValue = useCallback((field, value) => {
    setValues((previous) => ({ ...previous, [field]: value }))
    setSaveError(null)
    setSaved(false)
  }, [])

  const reset = useCallback(() => {
    setValues(baseline)
    setSaveError(null)
    setSaved(false)
  }, [baseline])

  const save = useCallback(async () => {
    if (saveInFlightRef.current) {
      return false
    }
    saveInFlightRef.current = true
    setIsSaving(true)
    setSaveError(null)
    setSaved(false)
    try {
      await settingsService.updateSettings(values)
      setBaseline(values)
      setSaved(true)
      return true
    } catch (error) {
      setSaveError(getSaveErrorMessage(error))
      return false
    } finally {
      saveInFlightRef.current = false
      setIsSaving(false)
    }
  }, [values])

  return {
    values,
    isLoading,
    loadError,
    backendUnavailable,
    refetch,
    dirty,
    isSaving,
    saveError,
    saved,
    updateValue,
    save,
    reset,
  }
}

export default useSettings