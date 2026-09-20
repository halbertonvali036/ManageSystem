import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'

const GRADES_PATH = '/grades'

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

const getGrades = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  const response = await httpClient.get(`${GRADES_PATH}${buildQuery(params)}`)
  return Array.isArray(response) ? response : response.data ?? []
}

const getGrade = async (id) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${GRADES_PATH}/${id}`)
  return response
}

const createGrade = async (grade) => {
  ensureBackendConnection()
  const response = await httpClient.post(GRADES_PATH, grade)
  return response
}

const updateGrade = async (id, grade) => {
  ensureBackendConnection()
  const response = await httpClient.put(`${GRADES_PATH}/${id}`, grade)
  return response
}

const deleteGrade = async (id) => {
  ensureBackendConnection()
  await httpClient.delete(`${GRADES_PATH}/${id}`)
}

const getGradesByStudent = async (studentId) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${GRADES_PATH}/student/${studentId}`)
  return response
}

const getGradesByClass = async (classId) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${GRADES_PATH}/class/${classId}`)
  return response
}

const getGradesByCourse = async (courseId) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${GRADES_PATH}/course/${courseId}`)
  return response
}

const saveBulkGrades = async (context, records) => {
  ensureBackendConnection()
  const response = await httpClient.post(`${GRADES_PATH}/bulk`, {
    ...context,
    records,
  })
  return response
}

const gradesService = {
  getGrades,
  getGrade,
  createGrade,
  updateGrade,
  deleteGrade,
  getGradesByStudent,
  getGradesByClass,
  getGradesByCourse,
  saveBulkGrades,
}

export default gradesService