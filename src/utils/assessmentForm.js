import { ASSESSMENT_STATUS } from '@/models/assessment'
import { getAssessmentClassId, getAssessmentCourseId } from '@/models/assessment'
import { toDateInputValue } from '@/utils/dateInput'

export const toAssessmentFormValues = (initial = {}) => ({
  title: initial.title ?? '',
  type: initial.type ?? '',
  courseId: initial.courseId ?? getAssessmentCourseId(initial) ?? '',
  classId: initial.classId ?? getAssessmentClassId(initial) ?? '',
  maximumScore:
    initial.maximumScore != null ? String(initial.maximumScore) : '',
  date: initial.date ?? toDateInputValue(new Date()),
  description: initial.description ?? '',
  status: initial.status ?? ASSESSMENT_STATUS.DRAFT,
})

export const normalizeAssessmentNumber = (value) => {
  if (value === '' || value === null || value === undefined) {
    return null
  }
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export const toAssessmentPayload = (values) => ({
  title: values.title.trim(),
  type: values.type,
  courseId: values.courseId || null,
  classId: values.classId || null,
  maximumScore: normalizeAssessmentNumber(values.maximumScore),
  date: values.date,
  description: values.description.trim(),
  status: values.status,
})