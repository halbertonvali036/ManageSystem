import { ArrowLeft, Award, BarChart3, BookOpen, CalendarDays, School } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '@/components/common/Card'
import InfoItem from '@/components/common/InfoItem'
import CourseStatusBadge from '@/components/courses/CourseStatusBadge'
import { formatCourseTeacherName } from '@/models/course'

function RelatedSection({ icon: Icon, title, description, to, actionLabel }) {
  return (
    <Card title={title}>
      <div className="widget-empty">
        <Icon size={24} className="widget-empty__icon" aria-hidden="true" />
        <p className="widget-empty__title">Nothing to show yet</p>
        <p className="widget-empty__text">{description}</p>
        <Link to={to} className="form__link">
          {actionLabel}
        </Link>
      </div>
    </Card>
  )
}

function StudentCourseProfile({ course, onBack }) {
  const credits = course.credits != null ? course.credits : null
  const hasAcademicPeriod = Boolean(course.semester || course.academicYear)

  return (
    <div className="course-details details-page">
      <div className="details-toolbar">
        <button type="button" className="btn btn--icon-left" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to My Courses
        </button>
      </div>

      <Card className="course-profile__header">
        <span className="course-profile__avatar" aria-hidden="true">
          <BookOpen size={26} />
        </span>
        <div className="course-profile__identity">
          <h2 className="course-profile__name">
            {course.name || 'Unnamed course'}
          </h2>
          <p className="course-profile__meta">
            Course Code:{' '}
            <span className="course-profile__meta-value">
              {course.courseCode || '—'}
            </span>
          </p>
        </div>
        <div className="course-profile__status">
          <CourseStatusBadge status={course.status} />
        </div>
      </Card>

      <div className="course-details__grid">
        <Card title="Basic Information">
          <dl className="info-grid">
            <InfoItem label="Course Code">{course.courseCode || '—'}</InfoItem>
            <InfoItem label="Course Name">{course.name || '—'}</InfoItem>
          </dl>
        </Card>

        <Card title="Academic Information">
          <dl className="info-grid">
            <InfoItem label="Department">{course.department || '—'}</InfoItem>
            <InfoItem label="Assigned Teacher">
              {formatCourseTeacherName(course)}
            </InfoItem>
          </dl>
        </Card>

        <Card title="Credits &amp; Status">
          <dl className="info-grid">
            <InfoItem label="Credits">{credits ?? '—'}</InfoItem>
            <InfoItem label="Status">
              <CourseStatusBadge status={course.status} />
            </InfoItem>
          </dl>
        </Card>

        {hasAcademicPeriod ? (
          <Card title="Academic Period">
            <dl className="info-grid">
              {course.semester ? (
                <InfoItem label="Semester">{course.semester}</InfoItem>
              ) : null}
              {course.academicYear ? (
                <InfoItem label="Academic Year">{course.academicYear}</InfoItem>
              ) : null}
            </dl>
          </Card>
        ) : null}

        <Card title="Description">
          {course.description ? (
            <p className="course-profile__description">{course.description}</p>
          ) : (
            <p className="course-profile__description course-profile__description--empty">
              No description provided.
            </p>
          )}
        </Card>
      </div>

      <div className="course-details__grid course-details__sections">
        <RelatedSection
          icon={School}
          title="Related Classes"
          description="Classes linked to this course will be listed here."
          to="/student/classes"
          actionLabel="View My Classes"
        />
        <RelatedSection
          icon={CalendarDays}
          title="Schedule"
          description="This course&rsquo;s schedule will appear here."
          to="/student/schedule"
          actionLabel="View Schedule"
        />
        <RelatedSection
          icon={BarChart3}
          title="Attendance Summary"
          description="Your attendance for this course will appear here."
          to="/student/attendance"
          actionLabel="View Attendance"
        />
        <RelatedSection
          icon={Award}
          title="Grade Summary"
          description="Grades published for this course will appear here."
          to="/student/grades"
          actionLabel="View Grades"
        />
      </div>
    </div>
  )
}

export default StudentCourseProfile