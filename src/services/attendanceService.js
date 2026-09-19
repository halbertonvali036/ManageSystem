import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'

const ATTENDANCE_PATH = '/attendance'

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
  if (params.date) {
    query.set('date', params.date)
  }
  if (params.classId) {
    query.set('classId', params.classId)
  }
  if (params.status) {
    query.set('status', params.status)
  }
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

const getAttendance = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  const response = await httpClient.get(`${ATTENDANCE_PATH}${buildQuery(params)}`)
  return Array.isArray(response) ? response : response.data ?? []
}

const getAttendanceById = async (id) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${ATTENDANCE_PATH}/${id}`)
  return response
}

const createAttendance = async (data) => {
  ensureBackendConnection()
  const response = await httpClient.post(ATTENDANCE_PATH, data)
  return response
}

const updateAttendance = async (id, data) => {
  ensureBackendConnection()
  const response = await httpClient.put(`${ATTENDANCE_PATH}/${id}`, data)
  return response
}

const deleteAttendance = async (id) => {
  ensureBackendConnection()
  await httpClient.delete(`${ATTENDANCE_PATH}/${id}`)
}

const getAttendanceByClass = async (classId, date) => {
  ensureBackendConnection()
  const response = await httpClient.get(
    `${ATTENDANCE_PATH}/class/${classId}${date ? `?date=${encodeURIComponent(date)}` : ''}`,
  )
  return response
}

const saveBulkAttendance = async (classId, date, records) => {
  ensureBackendConnection()
  const response = await httpClient.post(
    `${ATTENDANCE_PATH}/bulk`,
    { classId, date, records },
  )
  return response
}

const attendanceService = {
  getAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceByClass,
  saveBulkAttendance,
}

export default attendanceService