import { ListChecks, Plus, Search, X } from 'lucide-react'
import { GRADE_ASSESSMENT_TYPE_LABELS } from '@/models/grade'

const ASSESSMENT_OPTIONS = [
  { value: 'all', label: 'All types' },
  ...Object.entries(GRADE_ASSESSMENT_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
]

const studentLabel = (student) =>
  student.fullName ||
  student.name ||
  [student.firstName, student.lastName].filter(Boolean).join(' ') ||
  student.studentId ||
  student.id

const studentValue = (student) => student.id ?? student.studentId ?? student

const classLabel = (classRecord) =>
  classRecord.name ||
  classRecord.className ||
  classRecord.classCode ||
  classRecord

const classValue = (classRecord) =>
  classRecord.id ?? classRecord.classCode ?? classRecord

const courseLabel = (course) =>
  course.name || course.courseName || course.courseCode || course

const courseValue = (course) => course.id ?? course.courseCode ?? course

function GradesToolbar({
  search,
  onSearchChange,
  students = [],
  studentFilter,
  onStudentChange,
  classes = [],
  classFilter,
  onClassChange,
  courses = [],
  courseFilter,
  onCourseChange,
  assessmentFilter,
  onAssessmentChange,
  onClearFilters,
  onAddGrade,
  onBulkGradeEntry,
}) {
  const hasActiveFilters =
    search !== '' ||
    studentFilter !== 'all' ||
    classFilter !== 'all' ||
    courseFilter !== 'all' ||
    assessmentFilter !== 'all'

  return (
    <div className="students-toolbar students-toolbar--data">
      <div className="students-toolbar__filters">
        <div className="search-input">
          <Search className="search-input__icon" size={18} aria-hidden="true" />
          <input
            type="search"
            className="search-input__field"
            placeholder="Search student, ID or course&hellip;"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Search grades"
          />
        </div>

        <select
          className="field-select"
          value={studentFilter}
          onChange={(event) => onStudentChange(event.target.value)}
          aria-label="Filter by student"
        >
          {students.length > 0 ? (
            <>
              <option value="all">All students</option>
              {students.map((student) => (
                <option key={studentValue(student)} value={studentValue(student)}>
                  {studentLabel(student)}
                </option>
              ))}
            </>
          ) : (
            <option value="all">All students</option>
          )}
        </select>

        <select
          className="field-select"
          value={classFilter}
          onChange={(event) => onClassChange(event.target.value)}
          aria-label="Filter by class"
        >
          {classes.length > 0 ? (
            <>
              <option value="all">All classes</option>
              {classes.map((classRecord) => (
                <option
                  key={classValue(classRecord)}
                  value={classValue(classRecord)}
                >
                  {classLabel(classRecord)}
                </option>
              ))}
            </>
          ) : (
            <option value="all">All classes</option>
          )}
        </select>

        <select
          className="field-select"
          value={courseFilter}
          onChange={(event) => onCourseChange(event.target.value)}
          aria-label="Filter by course"
        >
          {courses.length > 0 ? (
            <>
              <option value="all">All courses</option>
              {courses.map((course) => (
                <option key={courseValue(course)} value={courseValue(course)}>
                  {courseLabel(course)}
                </option>
              ))}
            </>
          ) : (
            <option value="all">All courses</option>
          )}
        </select>

        <select
          className="field-select"
          value={assessmentFilter}
          onChange={(event) => onAssessmentChange(event.target.value)}
          aria-label="Filter by assessment type"
        >
          {ASSESSMENT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {hasActiveFilters ? (
          <button
            type="button"
            className="btn btn--icon-left"
            onClick={onClearFilters}
          >
            <X size={16} aria-hidden="true" />
            Clear
          </button>
        ) : null}
      </div>

      <div className="students-toolbar__actions">
        <button
          type="button"
          className="btn btn--icon-left"
          onClick={onBulkGradeEntry}
        >
          <ListChecks size={18} aria-hidden="true" />
          Bulk Grade Entry
        </button>
        <button
          type="button"
          className="btn btn--primary btn--icon-left students-toolbar__add"
          onClick={onAddGrade}
        >
          <Plus size={18} aria-hidden="true" />
          Add Grade
        </button>
      </div>
    </div>
  )
}

export default GradesToolbar
