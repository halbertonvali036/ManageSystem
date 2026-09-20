import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'

const ENROLLMENTS_PATH = '/enrollments'

const ensureBackendConnection = () => {
  if (!config.api.baseUrl) {
    throw new BackendNotConnectedError()
  }
}

const getClassStudents = async (classId) => {
  ensureBackendConnection()
  const response = await httpClient.get(
    `${ENROLLMENTS_PATH}?classId=${encodeURIComponent(classId)}`,
  )
  return Array.isArray(response) ? response : response.data ?? []
}

const getStudentEnrollments = async (studentId) => {
  ensureBackendConnection()
  const response = await httpClient.get(
    `${ENROLLMENTS_PATH}?studentId=${encodeURIComponent(studentId)}`,
  )
  return Array.isArray(response) ? response : response.data ?? []
}

const enrollStudents = async (classId, studentIds) => {
  ensureBackendConnection()
  const response = await httpClient.post(ENROLLMENTS_PATH, {
    classId,
    studentIds,
  })
  return response
}

const removeStudentFromClass = async (classId, studentId) => {
  ensureBackendConnection()
  await httpClient.delete(
    `${ENROLLMENTS_PATH}/class/${encodeURIComponent(classId)}/student/${encodeURIComponent(studentId)}`,
  )
}

const enrollmentsService = {
  getClassStudents,
  getStudentEnrollments,
  enrollStudents,
  removeStudentFromClass,
}

export default enrollmentsService