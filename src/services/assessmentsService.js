import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'

const ASSESSMENTS_PATH = '/assessments'

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
  if (params.courseId) {
    query.set('courseId', params.courseId)
  }
  if (params.classId) {
    query.set('classId', params.classId)
  }
  if (params.type) {
    query.set('type', params.type)
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

const getAssessments = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  const response = await httpClient.get(
    `${ASSESSMENTS_PATH}${buildQuery(params)}`,
  )
  return Array.isArray(response) ? response : response.data ?? []
}

const getAssessment = async (id) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${ASSESSMENTS_PATH}/${id}`)
  return response
}

const createAssessment = async (assessment) => {
  ensureBackendConnection()
  const response = await httpClient.post(ASSESSMENTS_PATH, assessment)
  return response
}

const updateAssessment = async (id, assessment) => {
  ensureBackendConnection()
  const response = await httpClient.put(`${ASSESSMENTS_PATH}/${id}`, assessment)
  return response
}

const deleteAssessment = async (id) => {
  ensureBackendConnection()
  await httpClient.delete(`${ASSESSMENTS_PATH}/${id}`)
}

const assessmentsService = {
  getAssessments,
  getAssessment,
  createAssessment,
  updateAssessment,
  deleteAssessment,
}

export default assessmentsService