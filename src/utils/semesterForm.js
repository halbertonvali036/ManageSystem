import { SEMESTER_STATUS } from '@/models/semester'

export const toSemesterFormValues = (initial = {}) => ({
  name: initial.name ?? initial.semester ?? '',
  startDate: initial.startDate ?? '',
  endDate: initial.endDate ?? '',
  status: initial.status ?? SEMESTER_STATUS.UPCOMING,
})

export const toSemesterPayload = (values) => ({
  name: values.name.trim(),
  startDate: values.startDate,
  endDate: values.endDate,
  status: values.status,
})