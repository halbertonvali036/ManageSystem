import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'

const SCHEDULES_PATH = '/schedules'

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
  if (params.dayOfWeek) {
    query.set('dayOfWeek', params.dayOfWeek)
  }
  if (params.status) {
    query.set('status', params.status)
  }
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

const getSchedules = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  const response = await httpClient.get(`${SCHEDULES_PATH}${buildQuery(params)}`)
  return Array.isArray(response) ? response : response.data ?? []
}

const getSchedule = async (id) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${SCHEDULES_PATH}/${id}`)
  return response
}

const createSchedule = async (scheduleEntry) => {
  ensureBackendConnection()
  const response = await httpClient.post(SCHEDULES_PATH, scheduleEntry)
  return response
}

const updateSchedule = async (id, scheduleEntry) => {
  ensureBackendConnection()
  const response = await httpClient.put(`${SCHEDULES_PATH}/${id}`, scheduleEntry)
  return response
}

const deleteSchedule = async (id) => {
  ensureBackendConnection()
  await httpClient.delete(`${SCHEDULES_PATH}/${id}`)
}

const schedulesService = {
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
}

export default schedulesService