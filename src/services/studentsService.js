import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'

const STUDENTS_PATH = '/students'

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
  if (params.classId) {
    query.set('classId', params.classId)
  }
  if (params.status) {
    query.set('status', params.status)
  }
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

const getStudents = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  const response = await httpClient.get(`${STUDENTS_PATH}${buildQuery(params)}`)
  return Array.isArray(response) ? response : response.data ?? []
}

const getStudent = async (id) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${STUDENTS_PATH}/${id}`)
  return response
}

const createStudent = async (student) => {
  ensureBackendConnection()
  const response = await httpClient.post(STUDENTS_PATH, student)
  return response
}

const updateStudent = async (id, student) => {
  ensureBackendConnection()
  const response = await httpClient.put(`${STUDENTS_PATH}/${id}`, student)
  return response
}

const deleteStudent = async (id) => {
  ensureBackendConnection()
  await httpClient.delete(`${STUDENTS_PATH}/${id}`)
}

const getStudentsByClass = async (classId) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${STUDENTS_PATH}/class/${classId}`)
  return response
}

const studentsService = {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsByClass,
}

export default studentsService