import config from '@/config'
import httpClient, {
  BackendNotConnectedError,
  ERROR_CODE,
  isEndpointUnavailable,
  RequestError,
} from '@/services/httpClient'
import { SUPPORT_REQUESTS_PATH, toSupportRequestPayload } from '@/models/support'

const ensureBackendConnection = () => {
  if (!config.api.baseUrl) {
    throw new BackendNotConnectedError()
  }
}

const isBackendConnected = () => Boolean(config.api.baseUrl)

/**
 * Support / contact service.
 *
 * Prepared for a backend intake endpoint. While no backend exists the create
 * call throws `BackendNotConnectedError`, so the UI can show an honest
 * integration-pending state rather than a fake ticket number. Nothing is
 * emailed, queued or stored in the browser, and the payload never identifies
 * the user — the backend infers the account from the session.
 */
const supportService = {
  isBackendConnected,

  createSupportRequest: async (draft) => {
    ensureBackendConnection()
    const payload = toSupportRequestPayload(draft)
    if (!payload) {
      throw new RequestError('Please complete the subject, category and message.', {
        code: ERROR_CODE.VALIDATION,
      })
    }
    try {
      return await httpClient.post(SUPPORT_REQUESTS_PATH, payload)
    } catch (error) {
      // The intake endpoint is not implemented yet: 404/403/405 becomes the
      // same "integration pending" refusal the no-backend path already uses.
      if (isEndpointUnavailable(error)) {
        throw new BackendNotConnectedError(
          'Support requests are not connected yet — nothing was sent.',
        )
      }
      throw error
    }
  },
}

export default supportService
