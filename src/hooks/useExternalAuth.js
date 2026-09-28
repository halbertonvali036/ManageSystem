import { useCallback, useState } from 'react'
import authService from '@/services/authService'
import { BackendNotConnectedError } from '@/services/httpClient'
import {
  EXTERNAL_AUTH_INTENT,
  getOAuthErrorCode,
  isOAuthErrorCode,
  OAUTH_ERROR,
} from '@/models/externalAuth'

/**
 * Shared state for the "Continue with Google" action.
 *
 * The hook only asks the backend to start the flow and then hands the returned
 * authorization URL back to the caller. It never builds a URL, never stores a
 * token and never reports success on its own. While the backend is not
 * connected, `isAvailable` is `false` and any attempt resolves to the
 * backend-unavailable message, so the UI cannot present a fake sign-in.
 */
function useExternalAuth() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState(null)

  const isAvailable = authService.isExternalAuthAvailable()

  const begin = useCallback(async ({ intent = EXTERNAL_AUTH_INTENT.LOGIN, returnTo } = {}) => {
    if (isPending) {
      return false
    }

    setIsPending(true)
    setError(null)
    try {
      const { authorizationUrl } =
        intent === EXTERNAL_AUTH_INTENT.LINK
          ? await authService.linkGoogleAccount({ returnTo })
          : await authService.beginGoogleLogin({ intent, returnTo })

      window.location.assign(authorizationUrl)
      return true
    } catch (requestError) {
      if (requestError instanceof BackendNotConnectedError) {
        setError(OAUTH_ERROR.BACKEND_UNAVAILABLE)
        return false
      }
      setError(
        isOAuthErrorCode(requestError?.code)
          ? getOAuthErrorCode(requestError.code)
          : OAUTH_ERROR.UNKNOWN,
      )
      return false
    } finally {
      setIsPending(false)
    }
  }, [isPending])

  return { isAvailable, isPending, error, begin, clearError: () => setError(null) }
}

export default useExternalAuth
