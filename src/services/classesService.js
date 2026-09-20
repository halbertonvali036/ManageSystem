import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'

const CLASSES_PATH = '/classes'

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
  if (params.academicYear) {
    query.set('academicYear', params.academicYear)
  }
  if (params.semester) {
    query.set('semester', params.semester)
  }
  if (params.status) {
    query.set('status', params.status)
  }
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

const getClasses = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  const response = await httpClient.get(`${CLASSES_PATH}${buildQuery(params)}`)
  return Array.isArray(response) ? response : response.data ?? []
}

const getClass = async (id) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${CLASSES_PATH}/${id}`)
  return response
}

const createClass = async (classData) => {
  ensureBackendConnection()
  const response = await httpClient.post(CLASSES_PATH, classData)
  return response
}

const updateClass = async (id, classData) => {
  ensureBackendConnection()
  const response = await httpClient.put(`${CLASSES_PATH}/${id}`, classData)
  return response
}

const deleteClass = async (id) => {
  ensureBackendConnection()
  await httpClient.delete(`${CLASSES_PATH}/${id}`)
}

const classesService = {
  getClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,
}

export default classesService