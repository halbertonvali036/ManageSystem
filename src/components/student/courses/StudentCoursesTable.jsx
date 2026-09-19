import { BookOpen, Eye } from 'lucide-react'
import Card from '@/components/common/Card'
import CourseStatusBadge from '@/components/courses/CourseStatusBadge'
import { formatCourseTeacherName } from '@/models/course'

const COLUMNS = [
  { key: 'courseCode', label: 'Course Code' },
  { key: 'name', label: 'Course Name' },
  { key: 'department', label: 'Department' },
  { key: 'teacher', label: 'Teacher' },
  { key: 'credits', label: 'Credits' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '' },
]

function LoadingState() {
  return (
    <Card>
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        Loading courses&hellip;
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state table-state--error">
        <h3 className="table-state__title">Failed to load courses</h3>
        <p className="table-state__text">{message}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      </div>
    </Card>
  )
}

function EmptyState({ hasActiveFilters, onClearFilters }) {
  return (
    <Card>
      <div className="table-state">
        <BookOpen className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">
          {hasActiveFilters ? 'No matching courses' : 'No courses yet'}
        </h3>
        <p className="table-state__text">
          {hasActiveFilters
            ? 'Try adjusting your search or filters.'
            : 'Courses you are enrolled in will appear here.'}
        </p>
        {hasActiveFilters ? (
          <button
            type="button"
            className="btn btn--icon-left"
            onClick={onClearFilters}
          >
            Clear filters
          </button>
        ) : null}
      </div>
    </Card>
  )
}

function StudentCoursesTable({
  courses,
  isLoading,
  error,
  onRetry,
  onView,
  hasActiveFilters,
  onClearFilters,
}) {
  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={onRetry} />
  }

  if (courses.length === 0) {
    return (
      <EmptyState
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
      />
    )
  }

  return (
    <div className="table-responsive">
      <table className="courses-table">
        <thead>
          <tr>
            {COLUMNS.map((column) => (
              <th key={column.key} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr
              key={course.id}
              className="courses-table__row"
              onClick={() => onView(course)}
            >
              <td className="courses-table__id">
                {course.courseCode || '—'}
              </td>
              <td className="courses-table__name">{course.name || '—'}</td>
              <td>{course.department || '—'}</td>
              <td>{formatCourseTeacherName(course)}</td>
              <td className="courses-table__credits">
                {course.credits != null ? course.credits : '—'}
              </td>
              <td>
                <CourseStatusBadge status={course.status} />
              </td>
              <td>
                <div className="courses-table__actions">
                  <button
                    type="button"
                    className="courses-table__action"
                    aria-label="View course"
                    title="View course"
                    onClick={(event) => {
                      event.stopPropagation()
                      onView(course)
                    }}
                  >
                    <Eye size={16} aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default StudentCoursesTable