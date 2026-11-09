import { useCallback, useMemo, useState, useEffect } from 'react'
import templateService from '@/services/templateService'

const DEMO_AVAILABILITY = Object.freeze({
  status: 'demo',
  available: true,
  backendTemplate: null,
})

const LOADING_AVAILABILITY = Object.freeze({
  status: 'loading',
  available: false,
  backendTemplate: null,
})

const CATALOG_UNAVAILABLE_AVAILABILITY = Object.freeze({
  status: 'catalog-unavailable',
  available: false,
  backendTemplate: null,
})

const MISSING_AVAILABILITY = Object.freeze({
  status: 'missing',
  available: false,
  backendTemplate: null,
})

/**
 * Loads the backend template catalogue and answers availability questions for
 * the static frontend templates.
 *
 * Demo mode (no `VITE_API_BASE_URL`) stays exactly as it was: every frontend
 * template is available and no catalogue request is made. With a real backend,
 * only a successfully loaded catalogue can make a template available, which is
 * what keeps an unknown id out of a create request.
 */
function useTemplateCatalog() {
  const isBackendConnected = templateService.isBackendConnected()
  const [reloadToken, setReloadToken] = useState(0)
  const [state, setState] = useState(() => {
    const cached = isBackendConnected ? templateService.getCachedTemplates() : []
    return {
      status: !isBackendConnected ? 'demo' : cached.length ? 'ready' : 'loading',
      templates: cached,
      error: null,
    }
  })

  useEffect(() => {
    if (!isBackendConnected) {
      return undefined
    }

    let isActive = true

    templateService
      .listTemplates()
      .then((templates) => {
        if (isActive) {
          setState({ status: 'ready', templates, error: null })
        }
      })
      .catch((error) => {
        if (isActive) {
          setState({ status: 'error', templates: [], error })
        }
      })

    return () => {
      isActive = false
    }
  }, [isBackendConnected, reloadToken])

  const isLoading = state.status === 'loading'
  const isCatalogAvailable =
    !isBackendConnected || (state.status === 'ready' && state.templates.length > 0)
  const isCatalogUnavailable = isBackendConnected && !isLoading && !isCatalogAvailable

  const getAvailability = useCallback(
    (frontendId) => {
      if (!isBackendConnected) {
        return DEMO_AVAILABILITY
      }
      if (state.status === 'loading') {
        return LOADING_AVAILABILITY
      }
      if (state.status === 'error' || state.templates.length === 0) {
        return CATALOG_UNAVAILABLE_AVAILABILITY
      }

      const backendTemplate =
        state.templates.find((template) => template.templateId === frontendId) ?? null
      if (!backendTemplate) {
        return MISSING_AVAILABILITY
      }

      return { status: 'available', available: true, backendTemplate }
    },
    [isBackendConnected, state.status, state.templates],
  )

  const firstAvailableTemplateId = useMemo(() => {
    if (!isBackendConnected) {
      return null
    }
    return (
      state.templates
        .map((template) => template.templateId)
        .find((templateId) => typeof templateId === 'string') ?? null
    )
  }, [isBackendConnected, state.templates])

  const refetch = useCallback(() => {
    templateService.clearTemplateCache()
    setState((current) => ({ ...current, status: 'loading', error: null }))
    setReloadToken((token) => token + 1)
  }, [])

  return {
    isBackendConnected,
    isLoading,
    isCatalogAvailable,
    isCatalogUnavailable,
    templates: state.templates,
    error: state.error,
    firstAvailableTemplateId,
    getAvailability,
    refetch,
  }
}

export default useTemplateCatalog
