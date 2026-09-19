import { SUBJECT_STATUS } from '@/models/subject'

export const toSubjectFormValues = (initial = {}) => ({
  code: initial.subjectCode ?? initial.code ?? '',
  name: initial.name ?? initial.subjectName ?? '',
  departmentId: initial.departmentId ?? initial.department?.id ?? '',
  description: initial.description ?? '',
  status: initial.status ?? SUBJECT_STATUS.ACTIVE,
})

export const toSubjectPayload = (values) => ({
  subjectCode: values.code.trim(),
  name: values.name.trim(),
  departmentId: values.departmentId || null,
  description: values.description.trim(),
  status: values.status,
})