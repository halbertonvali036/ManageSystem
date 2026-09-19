import { ATTENDANCE_STATUS_LABELS } from '@/models/attendance'
import { CLASS_STATUS_LABELS } from '@/models/class'
import { COURSE_STATUS_LABELS } from '@/models/course'
import { STUDENT_STATUS_LABELS } from '@/models/student'

export const REPORT_TYPES = Object.freeze({
  STUDENTS: 'students',
  ATTENDANCE: 'attendance',
  GRADES: 'grades',
  COURSES: 'courses',
  CLASSES: 'classes',
})

export const REPORT_FILTER_TYPES = Object.freeze({
  DATE_FROM: 'dateFrom',
  DATE_TO: 'dateTo',
  STUDENT_ID: 'studentId',
  CLASS_ID: 'classId',
  COURSE_ID: 'courseId',
  TEACHER_ID: 'teacherId',
  STATUS: 'status',
  ACADEMIC_YEAR: 'academicYear',
  SEMESTER: 'semester',
})

export const REPORT_FILTER_LABELS = Object.freeze({
  [REPORT_FILTER_TYPES.DATE_FROM]: 'From date',
  [REPORT_FILTER_TYPES.DATE_TO]: 'To date',
  [REPORT_FILTER_TYPES.STUDENT_ID]: 'Student',
  [REPORT_FILTER_TYPES.CLASS_ID]: 'Class',
  [REPORT_FILTER_TYPES.COURSE_ID]: 'Course',
  [REPORT_FILTER_TYPES.TEACHER_ID]: 'Teacher',
  [REPORT_FILTER_TYPES.STATUS]: 'Status',
  [REPORT_FILTER_TYPES.ACADEMIC_YEAR]: 'Academic year',
  [REPORT_FILTER_TYPES.SEMESTER]: 'Semester',
})

export const REPORT_CATEGORIES = Object.freeze([
  {
    key: REPORT_TYPES.STUDENTS,
    title: 'Student Reports',
    description:
      'Aggregate student records, enrollment and status information.',
  },
  {
    key: REPORT_TYPES.ATTENDANCE,
    title: 'Attendance Reports',
    description:
      'Summaries of attendance records grouped by date range and cohort.',
  },
  {
    key: REPORT_TYPES.GRADES,
    title: 'Grade Reports',
    description:
      'Grade records grouped by student, class, course or assessment.',
  },
  {
    key: REPORT_TYPES.COURSES,
    title: 'Course Reports',
    description:
      'Course details, assigned teachers and course status information.',
  },
  {
    key: REPORT_TYPES.CLASSES,
    title: 'Class Reports',
    description:
      'Class rosters, assigned teachers and class status information.',
  },
])

export const REPORT_CATEGORY_FILTERS = Object.freeze({
  [REPORT_TYPES.STUDENTS]: [
    REPORT_FILTER_TYPES.DATE_FROM,
    REPORT_FILTER_TYPES.DATE_TO,
    REPORT_FILTER_TYPES.STUDENT_ID,
    REPORT_FILTER_TYPES.CLASS_ID,
    REPORT_FILTER_TYPES.STATUS,
    REPORT_FILTER_TYPES.ACADEMIC_YEAR,
    REPORT_FILTER_TYPES.SEMESTER,
  ],
  [REPORT_TYPES.ATTENDANCE]: [
    REPORT_FILTER_TYPES.DATE_FROM,
    REPORT_FILTER_TYPES.DATE_TO,
    REPORT_FILTER_TYPES.STUDENT_ID,
    REPORT_FILTER_TYPES.CLASS_ID,
    REPORT_FILTER_TYPES.COURSE_ID,
    REPORT_FILTER_TYPES.STATUS,
    REPORT_FILTER_TYPES.ACADEMIC_YEAR,
    REPORT_FILTER_TYPES.SEMESTER,
  ],
  [REPORT_TYPES.GRADES]: [
    REPORT_FILTER_TYPES.DATE_FROM,
    REPORT_FILTER_TYPES.DATE_TO,
    REPORT_FILTER_TYPES.STUDENT_ID,
    REPORT_FILTER_TYPES.CLASS_ID,
    REPORT_FILTER_TYPES.COURSE_ID,
    REPORT_FILTER_TYPES.ACADEMIC_YEAR,
    REPORT_FILTER_TYPES.SEMESTER,
  ],
  [REPORT_TYPES.COURSES]: [
    REPORT_FILTER_TYPES.DATE_FROM,
    REPORT_FILTER_TYPES.DATE_TO,
    REPORT_FILTER_TYPES.COURSE_ID,
    REPORT_FILTER_TYPES.TEACHER_ID,
    REPORT_FILTER_TYPES.STATUS,
    REPORT_FILTER_TYPES.ACADEMIC_YEAR,
    REPORT_FILTER_TYPES.SEMESTER,
  ],
  [REPORT_TYPES.CLASSES]: [
    REPORT_FILTER_TYPES.DATE_FROM,
    REPORT_FILTER_TYPES.DATE_TO,
    REPORT_FILTER_TYPES.CLASS_ID,
    REPORT_FILTER_TYPES.TEACHER_ID,
    REPORT_FILTER_TYPES.STATUS,
    REPORT_FILTER_TYPES.ACADEMIC_YEAR,
    REPORT_FILTER_TYPES.SEMESTER,
  ],
})

export const REPORT_STATUS_OPTIONS = Object.freeze({
  [REPORT_TYPES.STUDENTS]: STUDENT_STATUS_LABELS,
  [REPORT_TYPES.ATTENDANCE]: ATTENDANCE_STATUS_LABELS,
  [REPORT_TYPES.COURSES]: COURSE_STATUS_LABELS,
  [REPORT_TYPES.CLASSES]: CLASS_STATUS_LABELS,
})

const currentYear = new Date().getFullYear()

export const ACADEMIC_YEARS = Object.freeze([
  `${currentYear - 1}-${currentYear}`,
  `${currentYear}-${currentYear + 1}`,
  `${currentYear + 1}-${currentYear + 2}`,
])

export const SEMESTER_OPTIONS = Object.freeze([
  { value: '1', label: 'Semester 1' },
  { value: '2', label: 'Semester 2' },
])

export const createReportFilters = () => ({
  [REPORT_FILTER_TYPES.DATE_FROM]: '',
  [REPORT_FILTER_TYPES.DATE_TO]: '',
  [REPORT_FILTER_TYPES.STUDENT_ID]: '',
  [REPORT_FILTER_TYPES.CLASS_ID]: '',
  [REPORT_FILTER_TYPES.COURSE_ID]: '',
  [REPORT_FILTER_TYPES.TEACHER_ID]: '',
  [REPORT_FILTER_TYPES.STATUS]: '',
  [REPORT_FILTER_TYPES.ACADEMIC_YEAR]: '',
  [REPORT_FILTER_TYPES.SEMESTER]: '',
})

/**
 * @typedef {Object} ReportResultSummaryEntry
 * @property {string} [label]
 * @property {string | number} [value]
 */

/**
 * @typedef {Object} ReportResult
 * @property {Array<{ key: string, label: string }>} columns
 * @property {Array<Object>} rows
 * @property {Array<ReportResultSummaryEntry> | null} summary
 */