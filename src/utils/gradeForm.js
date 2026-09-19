import { toDateInputValue } from '@/utils/dateInput'

export const toGradeFormValues = (initial = {}) => ({
  studentId: initial.studentId ?? '',
  classId: initial.classId ?? '',
  courseId: initial.courseId ?? '',
  assessmentType: initial.assessmentType ?? '',
  assessmentName: initial.assessmentName ?? '',
  score: initial.score ?? '',
  maximumScore: initial.maximumScore ?? '',
  date: initial.date ?? toDateInputValue(new Date()),
  notes: initial.notes ?? '',
})

export const normalizeGradeNumber = (value) => {
  if (value === '' || value === null || value === undefined) {
    return null
  }
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export const toGradePayload = (values) => ({
  studentId: values.studentId,
  classId: values.classId,
  courseId: values.courseId,
  assessmentType: values.assessmentType,
  assessmentName: values.assessmentName.trim(),
  score: normalizeGradeNumber(values.score),
  maximumScore: normalizeGradeNumber(values.maximumScore),
  date: values.date,
  notes: values.notes.trim(),
})