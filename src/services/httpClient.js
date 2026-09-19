import config from '@/config'

export class RequestError extends Error {
  constructor(message, { status = null, data = null } = {}) {
    super(message)
    this.name = 'RequestError'
    this.status = status
    this.data = data
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
  const url = `${config.api.baseUrl}${path}`
  const headers = { ...DEFAULT_HEADERS, ...options.headers }

  const response = await fetch(url, { ...options, headers })

  if (!response.ok) {
    const data = await parseResponseBody(response)
    throw new RequestError(data?.message ?? `Request failed with status ${response.status}`, {
      status: response.status,
      data,
    })
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
}

export default httpClient