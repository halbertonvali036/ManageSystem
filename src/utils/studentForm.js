const EMPTY_FORM_VALUES = {
  studentId: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  className: '',
  status: '',
}

export const toStudentFormValues = (student = EMPTY_FORM_VALUES) => ({
  studentId: student.studentId ?? '',
  firstName: student.firstName ?? '',
  lastName: student.lastName ?? '',
  email: student.email ?? '',
  phone: student.phone ?? '',
  dateOfBirth: student.dateOfBirth ?? '',
  gender: student.gender ?? '',
  className: student.className ?? '',
  status: student.status ?? '',
})