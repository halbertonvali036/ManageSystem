import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'

const ANNOUNCEMENTS_PATH = '/announcements'
const STUDENT_ANNOUNCEMENTS_PATH = '/student/announcements'

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
  if (params.audience) {
    query.set('audience', params.audience)
  }
  if (params.status) {
    query.set('status', params.status)
  }
  if (params.academicYearId) {
    query.set('academicYearId', params.academicYearId)
  }
  if (params.semesterId) {
    query.set('semesterId', params.semesterId)
  }
  if (params.classId) {
    query.set('classId', params.classId)
  }
  if (params.courseId) {
    query.set('courseId', params.courseId)
  }
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

const toList = (response) => (Array.isArray(response) ? response : response?.data ?? [])

const getAnnouncements = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  const response = await httpClient.get(`${ANNOUNCEMENTS_PATH}${buildQuery(params)}`)
  return toList(response)
}

const getAnnouncement = async (id) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${ANNOUNCEMENTS_PATH}/${id}`)
  return response
}

const createAnnouncement = async (announcement) => {
  ensureBackendConnection()
  const response = await httpClient.post(ANNOUNCEMENTS_PATH, announcement)
  return response
}

const updateAnnouncement = async (id, announcement) => {
  ensureBackendConnection()
  const response = await httpClient.put(`${ANNOUNCEMENTS_PATH}/${id}`, announcement)
  return response
}

const deleteAnnouncement = async (id) => {
  ensureBackendConnection()
  const response = await httpClient.delete(`${ANNOUNCEMENTS_PATH}/${id}`)
  return response
}

const getStudentAnnouncements = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  const response = await httpClient.get(
    `${STUDENT_ANNOUNCEMENTS_PATH}${buildQuery(params)}`,
  )
  return toList(response)
}

export default {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getStudentAnnouncements,
}