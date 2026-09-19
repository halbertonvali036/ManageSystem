import { BookOpen, Eye, Pencil, Trash2 } from 'lucide-react'
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
  { key: 'actions', label: 'Actions' },
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

function EmptyState() {
  return (
    <Card>
      <div className="table-state">
        <BookOpen className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">No courses yet</h3>
        <p className="table-state__text">
          Course records will appear here once data is available.
        </p>
      </div>
    </Card>
  )
}

function CoursesTable({
  courses,
  isLoading,
  error,
  onRetry,
  onView,
  onEdit,
  onDelete,
}) {
  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={onRetry} />
  }

  if (courses.length === 0) {
    return <EmptyState />
  }

  const deleteDisabled = !onDelete

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
              <td className="courses-table__id">{course.courseCode}</td>
              <td className="courses-table__name">{course.name}</td>
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
                  <button
                    type="button"
                    className="courses-table__action"
                    aria-label="Edit course"
                    title="Edit course"
                    onClick={(event) => {
                      event.stopPropagation()
                      onEdit(course)
                    }}
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="courses-table__action courses-table__action--danger"
                    aria-label={
                      deleteDisabled
                        ? 'Delete course will be available later'
                        : 'Delete course'
                    }
                    title={
                      deleteDisabled
                        ? 'Delete becomes available in a later milestone'
                        : 'Delete course'
                    }
                    disabled={deleteDisabled}
                    onClick={
                      deleteDisabled
                        ? undefined
                        : (event) => {
                            event.stopPropagation()
                            onDelete(course)
                          }
                    }
                  >
                    <Trash2 size={16} aria-hidden="true" />
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

export default CoursesTable