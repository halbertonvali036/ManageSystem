import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'

const ROLES_PATH = '/roles'

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
  if (params.status) {
    query.set('status', params.status)
  }
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

const getRoles = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  const response = await httpClient.get(`${ROLES_PATH}${buildQuery(params)}`)
  return Array.isArray(response) ? response : response.data ?? []
}

const getRole = async (id) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${ROLES_PATH}/${id}`)
  return response
}

const createRole = async (role) => {
  ensureBackendConnection()
  const response = await httpClient.post(ROLES_PATH, role)
  return response
}

const updateRole = async (id, role) => {
  ensureBackendConnection()
  const response = await httpClient.put(`${ROLES_PATH}/${id}`, role)
  return response
}

const deleteRole = async (id) => {
  ensureBackendConnection()
  await httpClient.delete(`${ROLES_PATH}/${id}`)
}

const getRolePermissions = async (roleId) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${ROLES_PATH}/${roleId}/permissions`)
  return response
}

const updateRolePermissions = async (roleId, permissions) => {
  ensureBackendConnection()
  const response = await httpClient.put(`${ROLES_PATH}/${roleId}/permissions`, {
    permissions,
  })
  return response
}

const rolesService = {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  updateRolePermissions,
}

export default rolesService