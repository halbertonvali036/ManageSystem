const EMPTY_FORM_VALUES = {
  teacherId: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  department: '',
  subject: '',
  hireDate: '',
  status: '',
}

export const toTeacherFormValues = (teacher = EMPTY_FORM_VALUES) => ({
  teacherId: teacher.teacherId ?? '',
  firstName: teacher.firstName ?? '',
  lastName: teacher.lastName ?? '',
  email: teacher.email ?? '',
  phone: teacher.phone ?? '',
  dateOfBirth: teacher.dateOfBirth ?? '',
  gender: teacher.gender ?? '',
  department: teacher.department ?? '',
  subject: teacher.subject ?? '',
  hireDate: teacher.hireDate ?? '',
  status: teacher.status ?? '',
})