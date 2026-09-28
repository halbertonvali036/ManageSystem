const EMPTY_FORM_VALUES = {
  courseCode: '',
  name: '',
  description: '',
  department: '',
  credits: '',
  status: '',
}

export const toCourseFormValues = (course = EMPTY_FORM_VALUES) => ({
  courseCode: course.courseCode ?? '',
  name: course.name ?? course.courseName ?? '',
  description: course.description ?? '',
  department: course.department ?? '',
  credits: course.credits != null ? String(course.credits) : '',
  status: course.status ?? '',
})
