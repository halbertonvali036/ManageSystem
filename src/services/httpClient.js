import config from '@/config'

export const HTTP_STATUS = Object.freeze({
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
})

export const ERROR_CODE = Object.freeze({
  NETWORK: 'NETWORK',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION: 'VALIDATION',
  SERVER: 'SERVER',
  UNKNOWN: 'UNKNOWN',
})

const DEFAULT_STATUS_MESSAGES = Object.freeze({
  [ERROR_CODE.UNAUTHORIZED]: 'Your session has expired. Please sign in again.',
  [ERROR_CODE.FORBIDDEN]: 'You do not have permission to perform this action.',
  [ERROR_CODE.NOT_FOUND]: 'The requested resource could not be found.',
  [ERROR_CODE.VALIDATION]: 'Please review the highlighted fields and try again.',
  [ERROR_CODE.SERVER]: 'Something went wrong on our end. Please try again.',
  [ERROR_CODE.NETWORK]: 'Network request failed. Please check your connection.',
})

const codeForStatus = (status) => {
  if (status === HTTP_STATUS.UNAUTHORIZED) {
    return ERROR_CODE.UNAUTHORIZED
  }
  if (status === HTTP_STATUS.FORBIDDEN) {
    return ERROR_CODE.FORBIDDEN
  }
  if (status === HTTP_STATUS.NOT_FOUND) {
    return ERROR_CODE.NOT_FOUND
  }
  if (status === HTTP_STATUS.UNPROCESSABLE_ENTITY) {
    return ERROR_CODE.VALIDATION
  }
  if (status >= 500) {
    return ERROR_CODE.SERVER
  }
  return ERROR_CODE.UNKNOWN
}

export const getRequestErrorCode = (error) => {
  if (error?.code) {
    return error.code
  }
  if (error instanceof RequestError) {
    return codeForStatus(error.status)
  }
  return ERROR_CODE.UNKNOWN
}

export const getRequestErrorMessage = (error) =>
  error?.message ??
  DEFAULT_STATUS_MESSAGES[getRequestErrorCode(error)] ??
  'Something went wrong. Please try again.'

export class RequestError extends Error {
  constructor(message, { status = null, data = null, code = null } = {}) {
    super(message)
    this.name = 'RequestError'
    this.status = status
    this.data = data
    this.code = code
  }
}

export class BackendNotConnectedError extends Error {
  constructor(message = 'Backend API is not connected yet.') {
    super(message)
    this.name = 'BackendNotConnectedError'
  }
}

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}

const parseResponseBody = async (response) => {
  try {
    return await response.json()
  } catch {
    return null
  }
}

const request = async (path, options = {}) => {
  if (!config.api.baseUrl) throw new BackendNotConnectedError()
  const url = `${config.api.baseUrl}${path}`
  const headers = { ...DEFAULT_HEADERS, ...options.headers }
  if (typeof FormData !== 'undefined' && options.body instanceof FormData) {
    // The browser must set the multipart boundary itself.
    delete headers['Content-Type']
  }

  let response
  try {
    response = await fetch(url, { ...options, headers })
  } catch {
    const networkErrorCode = ERROR_CODE.NETWORK
    throw new RequestError(DEFAULT_STATUS_MESSAGES[networkErrorCode], {
      code: networkErrorCode,
    })
  }

  if (!response.ok) {
    const data = await parseResponseBody(response)
    const code = codeForStatus(response.status)
    throw new RequestError(
      data?.message ?? DEFAULT_STATUS_MESSAGES[code] ?? `Request failed with status ${response.status}`,
      { status: response.status, data, code },
    )
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

const httpClient = {
  get: (path, options = {}) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options = {}) =>
    request(path, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (path, body, options = {}) =>
    request(path, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body, options = {}) =>
    request(path, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path, options = {}) => request(path, { ...options, method: 'DELETE' }),
  /**
   * Multipart upload. The JSON content type is dropped for these requests so the
   * browser can add the multipart boundary itself.
   */
  upload: (path, formData, options = {}) =>
    request(path, { ...options, method: 'POST', body: formData }),
}

export default httpClient
