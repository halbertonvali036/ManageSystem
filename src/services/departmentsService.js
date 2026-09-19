import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'

const DEPARTMENTS_PATH = '/departments'

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

const getDepartments = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  const response = await httpClient.get(`${DEPARTMENTS_PATH}${buildQuery(params)}`)
  return Array.isArray(response) ? response : response.data ?? []
}

const getDepartment = async (id) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${DEPARTMENTS_PATH}/${id}`)
  return response
}

const createDepartment = async (department) => {
  ensureBackendConnection()
  const response = await httpClient.post(DEPARTMENTS_PATH, department)
  return response
}

const updateDepartment = async (id, department) => {
  ensureBackendConnection()
  const response = await httpClient.put(`${DEPARTMENTS_PATH}/${id}`, department)
  return response
}

const deleteDepartment = async (id) => {
  ensureBackendConnection()
  await httpClient.delete(`${DEPARTMENTS_PATH}/${id}`)
}

const departmentsService = {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
}

export default departmentsService