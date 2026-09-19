import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'

const TEACHERS_PATH = '/teachers'

const ensureBackendConnection = () => {
  if (!config.api.baseUrl) {
    throw new BackendNotConnectedError()
  }
}

const buildQuery = (params) => {
  const query = new URLSearchParams()
  if (params.search) {
    query.set('search', params.search)
  }
  if (params.department) {
    query.set('department', params.department)
  }
  if (params.status) {
    query.set('status', params.status)
  }
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

const getTeachers = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  const response = await httpClient.get(`${TEACHERS_PATH}${buildQuery(params)}`)
  return Array.isArray(response) ? response : response.data ?? []
}

const getTeacher = async (id) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${TEACHERS_PATH}/${id}`)
  return response
}

const createTeacher = async (teacher) => {
  ensureBackendConnection()
  const response = await httpClient.post(TEACHERS_PATH, teacher)
  return response
}

const updateTeacher = async (id, teacher) => {
  ensureBackendConnection()
  const response = await httpClient.put(`${TEACHERS_PATH}/${id}`, teacher)
  return response
}

const deleteTeacher = async (id) => {
  ensureBackendConnection()
  await httpClient.delete(`${TEACHERS_PATH}/${id}`)
}

const teachersService = {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
}

export default teachersService