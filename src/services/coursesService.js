import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'

const COURSES_PATH = '/courses'

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

const getCourses = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  const response = await httpClient.get(`${COURSES_PATH}${buildQuery(params)}`)
  return Array.isArray(response) ? response : response.data ?? []
}

const getCourse = async (id) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${COURSES_PATH}/${id}`)
  return response
}

const createCourse = async (course) => {
  ensureBackendConnection()
  const response = await httpClient.post(COURSES_PATH, course)
  return response
}

const updateCourse = async (id, course) => {
  ensureBackendConnection()
  const response = await httpClient.put(`${COURSES_PATH}/${id}`, course)
  return response
}

const deleteCourse = async (id) => {
  ensureBackendConnection()
  await httpClient.delete(`${COURSES_PATH}/${id}`)
}

const coursesService = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
}

export default coursesService