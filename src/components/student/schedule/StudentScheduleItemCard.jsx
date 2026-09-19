import { Link } from 'react-router-dom'
import { BookOpen, Clock, MapPin, UserRound } from 'lucide-react'
import ClassStatusBadge from '@/components/classes/ClassStatusBadge'
import {
  formatScheduleClassName,
  formatScheduleCourseName,
  formatScheduleRoom,
  formatScheduleTimeRange,
  resolveScheduleClassId,
} from '@/models/schedule'

const resolveCourseId = (item) => {
  const raw = item.course
  if (typeof raw === 'object' && raw) {
    return raw.id ?? raw.courseId ?? null
  }
  return item.courseId ?? item.course?.courseId ?? null
}

const formatScheduleTeacherName = (item) => {
  if (typeof item.teacherName === 'string' && item.teacherName.trim()) {
    return item.teacherName
  }
  const teacher = item.teacher
  if (!teacher) {
    return '—'
  }
  if (typeof teacher === 'string') {
    return teacher
  }
  return teacher.fullName || teacher.name || '—'
}

function StudentScheduleItemCard({ item, showDate = false }) {
  const classId = resolveScheduleClassId(item)
  const courseId = resolveCourseId(item)

  return (
    <article
      className="student-schedule-item"
      aria-label={formatScheduleClassName(item)}
    >
      <div className="student-schedule-item__time">
        <Clock size={14} aria-hidden="true" />
        <span>{formatScheduleTimeRange(item)}</span>
        {item.status ? <ClassStatusBadge status={item.status} /> : null}
      </div>

      <h3 className="student-schedule-item__class">
        {formatScheduleClassName(item)}
      </h3>

      <p className="student-schedule-item__course">
        {formatScheduleCourseName(item)}
      </p>

      <p className="student-schedule-item__teacher">
        <UserRound size={14} aria-hidden="true" />
        <span>{formatScheduleTeacherName(item)}</span>
      </p>

      <p className="student-schedule-item__room">
        <MapPin size={14} aria-hidden="true" />
        <span>Room {formatScheduleRoom(item)}</span>
      </p>

      {showDate ? (
        <p className="student-schedule-item__date">
          {item.date || item.day || item.dayOfWeek || ''}
        </p>
      ) : null}

      <div className="student-schedule-item__actions">
        {classId ? (
          <Link
            to={`/student/classes/${classId}`}
            className="btn btn--compact btn--icon-left"
          >
            View Class
          </Link>
        ) : null}
        {courseId ? (
          <Link
            to={`/student/courses/${courseId}`}
            className="btn btn--compact btn--icon-left"
          >
            <BookOpen size={14} aria-hidden="true" />
            View Course
          </Link>
        ) : (
          <Link
            to="/student/courses"
            className="btn btn--compact btn--icon-left"
          >
            <BookOpen size={14} aria-hidden="true" />
            My Courses
          </Link>
        )}
      </div>
    </article>
  )
}

export default StudentScheduleItemCard