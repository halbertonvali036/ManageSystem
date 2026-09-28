import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'

const REPORTS_PATH = '/reports'

const ensureBackendConnection = () => {
  if (!config.api.baseUrl) {
    throw new BackendNotConnectedError()
  }
}

const buildReportQuery = (filters = {}) => {
  const query = new URLSearchParams()
  const params = [
    ['startDate', filters.dateFrom],
    ['endDate', filters.dateTo],
    ['studentId', filters.studentId],
    ['classId', filters.classId],
    ['courseId', filters.courseId],
    ['status', filters.status],
    ['academicYear', filters.academicYear],
    ['semester', filters.semester],
  ]
  params.forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      query.set(key, String(value))
    }
  })
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

const requestReport = (segment, filters) => {
  ensureBackendConnection()
  return httpClient.get(`${REPORTS_PATH}/${segment}${buildReportQuery(filters)}`)
}

const getStudentReport = async (filters) => requestReport('students', filters)

const getAttendanceReport = async (filters) =>
  requestReport('attendance', filters)

const getGradeReport = async (filters) => requestReport('grades', filters)

const getCourseReport = async (filters) => requestReport('courses', filters)

const getClassReport = async (filters) => requestReport('classes', filters)

const reportsService = {
  getStudentReport,
  getAttendanceReport,
  getGradeReport,
  getCourseReport,
  getClassReport,
}

export default reportsService