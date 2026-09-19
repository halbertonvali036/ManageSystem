const EMPTY_FORM_VALUES = {
  courseCode: '',
  name: '',
  description: '',
  department: '',
  teacher: '',
  credits: '',
  status: '',
}

const resolveTeacherValue = (course) => {
  if (course.teacherId) {
    return course.teacherId
  }
  const teacher = course.teacher
  if (typeof teacher === 'string') {
    return teacher
  }
  return teacher?.id ?? teacher?.teacherId ?? ''
}

export const toCourseFormValues = (course = EMPTY_FORM_VALUES) => ({
  courseCode: course.courseCode ?? '',
  name: course.name ?? course.courseName ?? '',
  description: course.description ?? '',
  department: course.department ?? '',
  teacher: resolveTeacherValue(course),
  credits: course.credits != null ? String(course.credits) : '',
  status: course.status ?? '',
})