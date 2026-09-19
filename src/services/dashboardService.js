import config from '@/config'
import httpClient from '@/services/httpClient'

const EMPTY_SUMMARY = {
  totalStudents: 0,
  totalTeachers: 0,
  totalCourses: 0,
  activeClasses: 0,
  attendance: null,
  recentActivity: [],
  upcomingClasses: [],
}

const getSummary = async () => {
  if (!config.api.baseUrl) {
    return EMPTY_SUMMARY
  }
  const response = await httpClient.get('/dashboard/summary')
  return { ...EMPTY_SUMMARY, ...response }
}

const dashboardService = {
  getSummary,
}

export default dashboardService