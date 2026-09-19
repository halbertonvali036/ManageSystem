import { useCallback, useMemo, useRef, useState } from 'react'
import teacherService from '@/services/teacherService'
import { BackendNotConnectedError } from '@/services/httpClient'
import { getSubmitFeedback } from '@/utils/apiErrors'
import { toDateInputValue } from '@/utils/dateInput'
import { normalizeGradeNumber } from '@/utils/gradeForm'

const toRow = (record, index) => ({
  key: record.id ?? record.studentId ?? index,
  studentId:
    record.studentId ||
    record.student?.studentId ||
    record.student?.id ||
    '',
  studentName:
    record.studentName ||
    record.student?.fullName ||
    (typeof record.student === 'string' ? record.student : '') ||
    [record.student?.firstName, record.student?.lastName].filter(Boolean).join(' ') ||
    'Unnamed student',
  score: '',
  notes: '',
})

const toSaveRecords = (rows) =>
  rows.map((row) => ({
    studentId: row.studentId,
    score: normalizeGradeNumber(row.score),
    notes: row.notes,
  }))

function useTeacherBulkGrades() {
  const [classId, setClassId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [assessmentType, setAssessmentType] = useState('')
  const [assessmentName, setAssessmentName] = useState('')
  const [maxScore, setMaxScore] = useState('')
  const [date, setDate] = useState(() => toDateInputValue(new Date()))

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

  const resetTransient = useCallback(() => {
    setLoadError(null)
    setUnavailable(false)
    setSaveError(null)
    setValidationMessage(null)
    setSavedSuccessfully(false)
  }, [])

  const handleContextChange = useCallback(
    (field, value) => {
      switch (field) {
        case 'classId':
          setClassId(value)
          setRows([])
          setSnapshot([])
          break
        case 'courseId':
          setCourseId(value)
          break
        case 'assessmentType':
          setAssessmentType(value)
          break
        case 'assessmentName':
          setAssessmentName(value)
          break
        case 'maxScore':
          setMaxScore(value)
          break
        case 'date':
          setDate(value)
          break
        default:
          break
      }
      resetTransient()
    },
    [resetTransient],
  )

  const loadStudents = useCallback(async () => {
    if (loadInFlightRef.current) {
      return { ok: false }
    }
    resetTransient()

    if (!classId) {
      setLoadError('Select a class to load students.')
      return { ok: false }
    }

    loadInFlightRef.current = true
    setIsLoadingStudents(true)
    try {
      const records = await teacherService.getMyClassStudents(classId)
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
  }, [classId, resetTransient])

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

  const clearScores = useCallback(() => {
    setRows((prev) => prev.map((row) => ({ ...row, score: '' })))
    setSaveError(null)
    setValidationMessage(null)
    setSavedSuccessfully(false)
  }, [])

  const resetChanges = useCallback(() => {
    setRows((prev) =>
      prev.map((row) => {
        const original = snapshot.find((item) => item.key === row.key)
        return {
          ...row,
          score: original?.score ?? '',
          notes: original?.notes ?? '',
        }
      }),
    )
    setSaveError(null)
    setValidationMessage(null)
    setSavedSuccessfully(false)
  }, [snapshot])

  const save = useCallback(async () => {
    if (!classId) {
      setValidationMessage('Select a class before saving grades.')
      return { ok: false }
    }
    if (!courseId) {
      setValidationMessage('Select a course before saving grades.')
      return { ok: false }
    }
    if (!assessmentType) {
      setValidationMessage('Select an assessment type before saving grades.')
      return { ok: false }
    }
    if (!assessmentName.trim()) {
      setValidationMessage('Enter an assessment name before saving grades.')
      return { ok: false }
    }
    const maximum = normalizeGradeNumber(maxScore)
    if (maximum === null || maximum <= 0) {
      setValidationMessage('Maximum score must be a number greater than 0.')
      return { ok: false }
    }
    if (!date) {
      setValidationMessage('Select a date before saving grades.')
      return { ok: false }
    }
    if (rows.length === 0) {
      setValidationMessage('Load students before saving grades.')
      return { ok: false }
    }
    if (rows.some((row) => normalizeGradeNumber(row.score) === null)) {
      setValidationMessage(
        'Every student needs a numerical score before saving grades.',
      )
      return { ok: false }
    }
    if (rows.some((row) => normalizeGradeNumber(row.score) > maximum)) {
      setValidationMessage('A score cannot exceed the maximum score.')
      return { ok: false }
    }

    setSaveError(null)
    setValidationMessage(null)
    setSavedSuccessfully(false)
    setIsSaving(true)
    try {
      await teacherService.saveMyBulkGrades(
        {
          classId,
          courseId,
          assessmentType,
          assessmentName: assessmentName.trim(),
          maxScore: maximum,
          date,
        },
        toSaveRecords(rows),
      )
      setSnapshot(JSON.parse(JSON.stringify(rows)))
      setSavedSuccessfully(true)
      return { ok: true }
    } catch (error) {
      const feedback =
        error instanceof BackendNotConnectedError
          ? { message: 'Backend API is not connected yet. Grades cannot be saved.' }
          : getSubmitFeedback(error, 'Could not save grades.')
      setSaveError(feedback.message)
      return { ok: false }
    } finally {
      setIsSaving(false)
    }
  }, [classId, courseId, assessmentType, assessmentName, maxScore, date, rows])

  return {
    classId,
    courseId,
    assessmentType,
    assessmentName,
    maxScore,
    date,
    handleContextChange,
    rows,
    isLoadingStudents,
    loadError,
    unavailable,
    loadStudents,
    updateRow,
    clearScores,
    resetChanges,
    isSaving,
    saveError,
    validationMessage,
    savedSuccessfully,
    dirty,
    save,
  }
}

export default useTeacherBulkGrades