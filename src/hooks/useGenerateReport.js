import { useCallback, useRef, useState } from 'react'
import reportsService from '@/services/reportsService'
import { BackendNotConnectedError } from '@/services/httpClient'
import { createReportFilters, REPORT_TYPES } from '@/models/report'
import { toReportResult } from '@/utils/report'

const REPORT_METHODS = {
  [REPORT_TYPES.STUDENTS]: reportsService.getStudentReport,
  [REPORT_TYPES.ATTENDANCE]: reportsService.getAttendanceReport,
  [REPORT_TYPES.GRADES]: reportsService.getGradeReport,
  [REPORT_TYPES.COURSES]: reportsService.getCourseReport,
  [REPORT_TYPES.CLASSES]: reportsService.getClassReport,
}

const getReportErrorMessage = (error) => {
  if (error instanceof BackendNotConnectedError) {
    return 'Backend API is not connected yet. Report data is unavailable.'
  }
  return error?.message ?? 'Could not generate the report.'
}

function useGenerateReport(categoryKey) {
  const [filters, setFilters] = useState(createReportFilters)
  const [status, setStatus] = useState('idle')
  const [report, setReport] = useState(null)
  const [error, setError] = useState(null)
  const inFlightRef = useRef(false)
  const method = REPORT_METHODS[categoryKey]

  const setFilter = useCallback((field, value) => {
    setFilters((previous) => ({ ...previous, [field]: value }))
    setStatus('idle')
    setReport(null)
    setError(null)
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(createReportFilters())
    setStatus('idle')
    setReport(null)
    setError(null)
  }, [])

  const generate = useCallback(async () => {
    if (!method || inFlightRef.current) {
      return
    }
    inFlightRef.current = true
    setStatus('loading')
    setError(null)
    try {
      const data = await method(filters)
      setReport(toReportResult(data))
      setStatus('ready')
    } catch (requestError) {
      setReport(null)
      setError(getReportErrorMessage(requestError))
      setStatus('error')
    } finally {
      inFlightRef.current = false
    }
  }, [method, filters])

  return {
    filters,
    setFilter,
    resetFilters,
    status,
    report,
    error,
    generate,
    isGenerating: status === 'loading',
  }
}

export default useGenerateReport