import { ACADEMIC_YEAR_STATUS } from '@/models/academicYear'

export const toAcademicYearFormValues = (initial = {}) => ({
  name: initial.name ?? initial.academicYear ?? '',
  startDate: initial.startDate ?? '',
  endDate: initial.endDate ?? '',
  status: initial.status ?? ACADEMIC_YEAR_STATUS.UPCOMING,
})

export const toAcademicYearPayload = (values) => ({
  name: values.name.trim(),
  startDate: values.startDate,
  endDate: values.endDate,
  status: values.status,
})