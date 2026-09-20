import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'

const TEACHER_CLASSES_PATH = '/teacher/classes'
const TEACHER_STUDENTS_PATH = '/teacher/students'
const TEACHER_ATTENDANCE_PATH = '/teacher/attendance'
const TEACHER_GRADES_PATH = '/teacher/grades'
const TEACHER_ASSESSMENTS_PATH = '/teacher/assessments'
const TEACHER_SCHEDULE_PATH = '/teacher/schedule'

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
  if (params.status) {
    query.set('status', params.status)
  }
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

const getMyClasses = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  const response = await httpClient.get(
    `${TEACHER_CLASSES_PATH}${buildQuery(params)}`,
  )
  return Array.isArray(response) ? response : response.data ?? []
}

const getMyClass = async (id) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${TEACHER_CLASSES_PATH}/${id}`)
  return response
}

const getMyClassStudents = async (id) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${TEACHER_CLASSES_PATH}/${id}/students`)
  return Array.isArray(response) ? response : response.data ?? []
}

const buildStudentQuery = (params) => {
  const query = new URLSearchParams()
  if (params.search) {
    query.set('search', params.search)
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

const getMyStudents = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  const response = await httpClient.get(
    `${TEACHER_STUDENTS_PATH}${buildStudentQuery(params)}`,
  )
  return Array.isArray(response) ? response : response.data ?? []
}

const getMyStudent = async (id) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${TEACHER_STUDENTS_PATH}/${id}`)
  return response
}

const getMyStudentAttendance = async (id) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${TEACHER_STUDENTS_PATH}/${id}/attendance`)
  return Array.isArray(response) ? response : response.data ?? []
}

const getMyStudentGrades = async (id) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${TEACHER_STUDENTS_PATH}/${id}/grades`)
  return Array.isArray(response) ? response : response.data ?? []
}

const buildAttendanceQuery = (params) => {
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

const getMyAttendance = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  const response = await httpClient.get(
    `${TEACHER_ATTENDANCE_PATH}${buildAttendanceQuery(params)}`,
  )
  return Array.isArray(response) ? response : response.data ?? []
}

const getMyClassAttendance = async (classId, date) => {
  ensureBackendConnection()
  const response = await httpClient.get(
    `${TEACHER_CLASSES_PATH}/${classId}/attendance${
      date ? `?date=${encodeURIComponent(date)}` : ''
    }`,
  )
  return Array.isArray(response) ? response : response.data ?? []
}

const saveMyClassAttendance = async (classId, date, records) => {
  ensureBackendConnection()
  const response = await httpClient.post(`${TEACHER_ATTENDANCE_PATH}/bulk`, {
    classId,
    date,
    records,
  })
  return response
}

const buildGradeQuery = (params) => {
  const query = new URLSearchParams()
  if (params.search) {
    query.set('search', params.search)
  }
  if (params.studentId) {
    query.set('studentId', params.studentId)
  }
  if (params.classId) {
    query.set('classId', params.classId)
  }
  if (params.courseId) {
    query.set('courseId', params.courseId)
  }
  if (params.assessmentType) {
    query.set('assessmentType', params.assessmentType)
  }
  if (params.assessmentId) {
    query.set('assessmentId', params.assessmentId)
  }
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

const getMyGrades = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  const response = await httpClient.get(
    `${TEACHER_GRADES_PATH}${buildGradeQuery(params)}`,
  )
  return Array.isArray(response) ? response : response.data ?? []
}

const createMyGrade = async (grade) => {
  ensureBackendConnection()
  const response = await httpClient.post(TEACHER_GRADES_PATH, grade)
  return response
}

const saveMyBulkGrades = async (context, records) => {
  ensureBackendConnection()
  const response = await httpClient.post(`${TEACHER_GRADES_PATH}/bulk`, {
    ...context,
    records,
  })
  return response
}

const buildAssessmentQuery = (params) => {
  const query = new URLSearchParams()
  if (params.search) {
    query.set('search', params.search)
  }
  if (params.type) {
    query.set('type', params.type)
  }
  if (params.status) {
    query.set('status', params.status)
  }
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

const getMyAssessments = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  const response = await httpClient.get(
    `${TEACHER_ASSESSMENTS_PATH}${buildAssessmentQuery(params)}`,
  )
  return Array.isArray(response) ? response : response.data ?? []
}

const getMyAssessment = async (id) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${TEACHER_ASSESSMENTS_PATH}/${id}`)
  return response
}

const buildScheduleQuery = (params) => {
  const query = new URLSearchParams()
  if (params.date) {
    query.set('date', params.date)
  }
  if (params.weekStart) {
    query.set('weekStart', params.weekStart)
  }
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

const getMySchedule = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  const response = await httpClient.get(
    `${TEACHER_SCHEDULE_PATH}${buildScheduleQuery(params)}`,
  )
  return Array.isArray(response) ? response : response.data ?? []
}

const getMyScheduleByDate = async (date) => {
  if (!config.api.baseUrl) {
    return []
  }
  return getMySchedule({ date })
}

const getMyScheduleByWeek = async (startDate) => {
  if (!config.api.baseUrl) {
    return []
  }
  return getMySchedule({ weekStart: startDate })
}

const teacherService = {
  getMyClasses,
  getMyClass,
  getMyClassStudents,
  getMyStudents,
  getMyStudent,
  getMyStudentAttendance,
  getMyStudentGrades,
  getMyAttendance,
  getMyClassAttendance,
  saveMyClassAttendance,
  getMyGrades,
  createMyGrade,
  saveMyBulkGrades,
  getMyAssessments,
  getMyAssessment,
  getMySchedule,
  getMyScheduleByDate,
  getMyScheduleByWeek,
}

export default teacherService