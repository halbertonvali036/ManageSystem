import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'

const ACADEMIC_YEARS_PATH = '/academic-years'

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
  if (params.status) {
    query.set('status', params.status)
  }
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

const getAcademicYears = async (params = {}) => {
  if (!config.api.baseUrl) {
    return []
  }
  const response = await httpClient.get(
    `${ACADEMIC_YEARS_PATH}${buildQuery(params)}`,
  )
  return Array.isArray(response) ? response : response.data ?? []
}

const getAcademicYear = async (id) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${ACADEMIC_YEARS_PATH}/${id}`)
  return response
}

const createAcademicYear = async (academicYear) => {
  ensureBackendConnection()
  const response = await httpClient.post(ACADEMIC_YEARS_PATH, academicYear)
  return response
}

const updateAcademicYear = async (id, academicYear) => {
  ensureBackendConnection()
  const response = await httpClient.put(
    `${ACADEMIC_YEARS_PATH}/${id}`,
    academicYear,
  )
  return response
}

const deleteAcademicYear = async (id) => {
  ensureBackendConnection()
  await httpClient.delete(`${ACADEMIC_YEARS_PATH}/${id}`)
}

const getSemesters = async (academicYearId) => {
  if (!config.api.baseUrl || !academicYearId) {
    return []
  }
  const response = await httpClient.get(
    `${ACADEMIC_YEARS_PATH}/${academicYearId}/semesters`,
  )
  return Array.isArray(response) ? response : response.data ?? []
}

const createSemester = async (academicYearId, semester) => {
  ensureBackendConnection()
  const response = await httpClient.post(
    `${ACADEMIC_YEARS_PATH}/${academicYearId}/semesters`,
    semester,
  )
  return response
}

const updateSemester = async (academicYearId, semesterId, semester) => {
  ensureBackendConnection()
  const response = await httpClient.put(
    `${ACADEMIC_YEARS_PATH}/${academicYearId}/semesters/${semesterId}`,
    semester,
  )
  return response
}

const deleteSemester = async (academicYearId, semesterId) => {
  ensureBackendConnection()
  await httpClient.delete(
    `${ACADEMIC_YEARS_PATH}/${academicYearId}/semesters/${semesterId}`,
  )
}

const academicYearsService = {
  getAcademicYears,
  getAcademicYear,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  getSemesters,
  createSemester,
  updateSemester,
  deleteSemester,
}

export default academicYearsService