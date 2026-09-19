import { DEPARTMENT_STATUS } from '@/models/department'

export const toDepartmentFormValues = (initial = {}) => ({
  code: initial.departmentCode ?? initial.code ?? '',
  name: initial.name ?? initial.departmentName ?? '',
  description: initial.description ?? '',
  headOfDepartment:
    initial.headOfDepartmentId ?? initial.headOfDepartment?.id ?? '',
  status: initial.status ?? DEPARTMENT_STATUS.ACTIVE,
})

export const toDepartmentPayload = (values) => ({
  departmentCode: values.code.trim(),
  name: values.name.trim(),
  description: values.description.trim(),
  headOfDepartmentId: values.headOfDepartment || null,
  status: values.status,
})