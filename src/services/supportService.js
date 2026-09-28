import config from '@/config'
import httpClient, {
  BackendNotConnectedError,
  ERROR_CODE,
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
    return httpClient.post(SUPPORT_REQUESTS_PATH, payload)
  },
}

export default supportService
