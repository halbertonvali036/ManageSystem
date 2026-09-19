import { useCallback, useMemo, useRef, useState } from 'react'
import teacherService from '@/services/teacherService'
import { BackendNotConnectedError } from '@/services/httpClient'
import { getSubmitFeedback } from '@/utils/apiErrors'
import { toDateInputValue } from '@/utils/dateInput'

const toRow = (record, index) => ({
  key: record.id || index,
  studentId:
    record.studentId ||
    record.student?.studentId ||
    record.student?.id ||
    '',
  studentName:
    record.studentName ||
    record.student?.fullName ||
    record.student?.name ||
    (typeof record.student === 'string' ? record.student : '') ||
    'Unnamed student',
  status: record.status || '',
  checkInTime: record.checkInTime || '',
  notes: record.notes || '',
})

const toSaveRecords = (rows) =>
  rows.map((row) => ({
    studentId: row.studentId,
    status: row.status,
    checkInTime: row.checkInTime,
    notes: row.notes,
  }))

function useTeacherAttendanceMarking() {
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedDate, setSelectedDate] = useState(() =>
    toDateInputValue(new Date()),
  )
  const [rows, setRows] = useState([])
  const [snapshot, setSnapshot] = useState([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [unavailable, setUnavailable] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [validationMessage, setValidationMessage] = useState(null)
  const [savedSuccessfully, setSavedSuccessfully] = useState(false)
  const loadInFlightRef = useRef(false)

  const dirty = useMemo(
    () => JSON.stringify(rows) !== JSON.stringify(snapshot),
    [rows, snapshot],
  )

  const handleClassChange = (classId) => {
    setSelectedClassId(classId)
    setRows([])
    setSnapshot([])
    setLoadError(null)
    setUnavailable(false)
    setSaveError(null)
    setValidationMessage(null)
    setSavedSuccessfully(false)
  }

  const handleDateChange = (date) => {
    setSelectedDate(date)
    setRows([])
    setSnapshot([])
    setLoadError(null)
    setUnavailable(false)
    setSaveError(null)
    setValidationMessage(null)
    setSavedSuccessfully(false)
  }

  const loadStudents = useCallback(async () => {
    if (loadInFlightRef.current) {
      return { ok: false }
    }
    setLoadError(null)
    setUnavailable(false)
    setSaveError(null)
    setValidationMessage(null)
    setSavedSuccessfully(false)

    if (!selectedClassId) {
      setLoadError('Select a class to load students.')
      return { ok: false }
    }
    if (!selectedDate) {
      setLoadError('Select a date to load students.')
      return { ok: false }
    }

    loadInFlightRef.current = true
    setIsLoadingStudents(true)
    try {
      const records = await teacherService.getMyClassAttendance(
        selectedClassId,
        selectedDate,
      )
      const nextRows = (Array.isArray(records) ? records : []).map(toRow)
      setRows(nextRows)
      setSnapshot(JSON.parse(JSON.stringify(nextRows)))
      return { ok: true }
    } catch (error) {
      if (error instanceof BackendNotConnectedError) {
        setUnavailable(true)
        setLoadError(
          'Student data will be available when the backend API is connected.',
        )
      } else {
        setLoadError(error?.message ?? 'Could not load students for this class.')
      }
      return { ok: false }
    } finally {
      loadInFlightRef.current = false
      setIsLoadingStudents(false)
    }
  }, [selectedClassId, selectedDate])

  const updateRow = useCallback((index, patch) => {
    setRows((prev) =>
      prev.map((row, currentIndex) =>
        currentIndex === index ? { ...row, ...patch } : row,
      ),
    )
    setSaveError(null)
    setValidationMessage(null)
    setSavedSuccessfully(false)
  }, [])

  const markAllPresent = useCallback(() => {
    setRows((prev) => prev.map((row) => ({ ...row, status: 'present' })))
    setSaveError(null)
    setValidationMessage(null)
    setSavedSuccessfully(false)
  }, [])

  const markAllAbsent = useCallback(() => {
    setRows((prev) => prev.map((row) => ({ ...row, status: 'absent' })))
    setSaveError(null)
    setValidationMessage(null)
    setSavedSuccessfully(false)
  }, [])

  const resetAll = useCallback(() => {
    setRows((prev) =>
      prev.map((row) => {
        const original = snapshot[row.key]
        return {
          ...row,
          status:
            original?.status !== undefined && original?.status !== null
              ? original.status
              : '',
          checkInTime:
            original?.checkInTime !== undefined && original?.checkInTime !== null
              ? original.checkInTime
              : '',
          notes:
            original?.notes !== undefined && original?.notes !== null
              ? original.notes
              : '',
        }
      }),
    )
    setSaveError(null)
    setValidationMessage(null)
    setSavedSuccessfully(false)
  }, [snapshot])

  const save = useCallback(async () => {
    if (!selectedClassId) {
      setValidationMessage('Select a class before saving attendance.')
      return { ok: false }
    }
    if (rows.length === 0) {
      setValidationMessage('Load students before saving attendance.')
      return { ok: false }
    }
    const missingStatuses = rows.some((row) => !row.status)
    if (missingStatuses) {
      setValidationMessage(
        'Every student must have a status before saving attendance.',
      )
      return { ok: false }
    }
    setSaveError(null)
    setValidationMessage(null)
    setSavedSuccessfully(false)
    setIsSaving(true)
    try {
      await teacherService.saveMyClassAttendance(
        selectedClassId,
        selectedDate,
        toSaveRecords(rows),
      )
      setSnapshot(JSON.parse(JSON.stringify(rows)))
      setSavedSuccessfully(true)
      return { ok: true }
    } catch (error) {
      const feedback =
        error instanceof BackendNotConnectedError
          ? { message: 'Backend API is not connected yet. Attendance cannot be saved.' }
          : getSubmitFeedback(error, 'Could not save attendance.')
      setSaveError(feedback.message)
      return { ok: false }
    } finally {
      setIsSaving(false)
    }
  }, [selectedClassId, selectedDate, rows])

  return {
    selectedClassId,
    selectedDate,
    handleClassChange,
    handleDateChange,
    rows,
    isLoadingStudents,
    loadError,
    unavailable,
    loadStudents,
    updateRow,
    markAllPresent,
    markAllAbsent,
    resetAll,
    isSaving,
    saveError,
    validationMessage,
    savedSuccessfully,
    dirty,
    save,
  }
}

export default useTeacherAttendanceMarking