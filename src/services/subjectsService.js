import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'

const SUBJECTS_PATH = '/subjects'

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
  if (params.departmentId) {
    query.set('departmentId', params.departmentId)
  }
  if (params.status) {
    query.set('status', params.status)
  }
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

const getSubjects = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  const response = await httpClient.get(`${SUBJECTS_PATH}${buildQuery(params)}`)
  return Array.isArray(response) ? response : response.data ?? []
}

const getSubject = async (id) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${SUBJECTS_PATH}/${id}`)
  return response
}

const createSubject = async (subject) => {
  ensureBackendConnection()
  const response = await httpClient.post(SUBJECTS_PATH, subject)
  return response
}

const updateSubject = async (id, subject) => {
  ensureBackendConnection()
  const response = await httpClient.put(`${SUBJECTS_PATH}/${id}`, subject)
  return response
}

const deleteSubject = async (id) => {
  ensureBackendConnection()
  await httpClient.delete(`${SUBJECTS_PATH}/${id}`)
}

const subjectsService = {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
}

export default subjectsService