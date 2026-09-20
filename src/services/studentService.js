import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'

const STUDENT_PATH = '/student'

const ensureBackendConnection = () => {
  if (!config.api.baseUrl) {
    throw new BackendNotConnectedError()
  }
}

const buildQuery = (params = {}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value)
    }
  })
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

const toList = (response) => (Array.isArray(response) ? response : response?.data ?? [])

const getMyCourses = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  const response = await httpClient.get(
    `${STUDENT_PATH}/courses${buildQuery(params)}`,
  )
  return toList(response)
}

const getMyCourse = async (id) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${STUDENT_PATH}/courses/${id}`)
  return response
}

const getMyClasses = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  const response = await httpClient.get(
    `${STUDENT_PATH}/classes${buildQuery(params)}`,
  )
  return toList(response)
}

const getMyClass = async (id) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${STUDENT_PATH}/classes/${id}`)
  return response
}

const getMySchedule = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  const response = await httpClient.get(
    `${STUDENT_PATH}/schedule${buildQuery(params)}`,
  )
  return toList(response)
}

const getMyAttendance = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  const response = await httpClient.get(
    `${STUDENT_PATH}/attendance${buildQuery(params)}`,
  )
  return toList(response)
}

const getMyAttendanceRecord = async (id) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${STUDENT_PATH}/attendance/${id}`)
  return response
}

const getMyGrades = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  const response = await httpClient.get(
    `${STUDENT_PATH}/grades${buildQuery(params)}`,
  )
  return toList(response)
}

const getMyGrade = async (id) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${STUDENT_PATH}/grades/${id}`)
  return response
}

const getMyAssessments = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  const response = await httpClient.get(
    `${STUDENT_PATH}/assessments${buildQuery(params)}`,
  )
  return toList(response)
}

const getMyProfile = async () => {
  if (!config.api.baseUrl) {
    return null
  }
  const response = await httpClient.get(`${STUDENT_PATH}/profile`)
  return response
}

const updateMyProfile = async (data) => {
  ensureBackendConnection()
  const response = await httpClient.put(`${STUDENT_PATH}/profile`, data)
  return response
}

const changeMyPassword = async (data) => {
  ensureBackendConnection()
  const response = await httpClient.put(`${STUDENT_PATH}/change-password`, data)
  return response
}

const getMyDashboard = async () => {
  const [courses, classes, schedule, attendance, grades, profile] =
    await Promise.all([
      getMyCourses(),
      getMyClasses(),
      getMySchedule(),
      getMyAttendance(),
      getMyGrades(),
      getMyProfile(),
    ])
  return { courses, classes, schedule, attendance, grades, profile }
}

const studentService = {
  getMyDashboard,
  getMyCourses,
  getMyCourse,
  getMyClasses,
  getMyClass,
  getMySchedule,
  getMyAttendance,
  getMyAttendanceRecord,
  getMyGrades,
  getMyGrade,
  getMyAssessments,
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
}

export default studentService