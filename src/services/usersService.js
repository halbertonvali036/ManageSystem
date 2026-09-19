import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'

const USERS_PATH = '/users'

const ensureBackendConnection = () => {
  if (!config.api.baseUrl) {
    throw new BackendNotConnectedError()
  }
}

const buildQuery = (params = {}) => {
  const query = new URLSearchParams()
  if (params.search) {
    query.set('search', params.search)
  }
  if (params.role) {
    query.set('role', params.role)
  }
  if (params.status) {
    query.set('status', params.status)
  }
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

const getUsers = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  const response = await httpClient.get(`${USERS_PATH}${buildQuery(params)}`)
  return Array.isArray(response) ? response : response.data ?? []
}

const getUser = async (id) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${USERS_PATH}/${id}`)
  return response
}

const createUser = async (user) => {
  ensureBackendConnection()
  const response = await httpClient.post(USERS_PATH, user)
  return response
}

const updateUser = async (id, user) => {
  ensureBackendConnection()
  const response = await httpClient.put(`${USERS_PATH}/${id}`, user)
  return response
}

const deleteUser = async (id) => {
  ensureBackendConnection()
  await httpClient.delete(`${USERS_PATH}/${id}`)
}

const activateUser = async (id) => {
  ensureBackendConnection()
  await httpClient.post(`${USERS_PATH}/${id}/activate`)
}

const deactivateUser = async (id) => {
  ensureBackendConnection()
  await httpClient.post(`${USERS_PATH}/${id}/deactivate`)
}

const usersService = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
}

export default usersService