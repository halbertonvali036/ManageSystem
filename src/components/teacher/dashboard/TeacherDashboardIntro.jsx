import { CalendarRange, GraduationCap } from 'lucide-react'
import { TEACHER_PORTAL_LABEL } from '@/utils/teacherConstants'

const getPartOfDay = () => {
  const hour = new Date().getHours()
  if (hour < 12) {
    return 'morning'
  }
  if (hour < 17) {
    return 'afternoon'
  }
  return 'evening'
}

function TeacherDashboardIntro({ user, currentAcademicYear, currentSemester }) {
  const greeting = `Good ${getPartOfDay()}${user?.name ? `, ${user.name}` : ''}`

  const showPeriod = Boolean(currentAcademicYear || currentSemester)

  return (
    <div className="dashboard__intro">
      <p className="dashboard__greeting">{greeting}</p>
      <p className="dashboard__subtitle">
        Here&rsquo;s an overview of your classes, students, assessments, schedule,
        and grades.
      </p>
      <div className="dashboard__context">
        <span className="dashboard-role">
          <GraduationCap size={14} aria-hidden="true" />
          {TEACHER_PORTAL_LABEL}
        </span>
        {showPeriod ? (
          <div className="dashboard-period">
            <CalendarRange
              size={14}
              className="dashboard-period__icon"
              aria-hidden="true"
            />
            {currentAcademicYear ? (
              <span className="dashboard-period__value">
                {currentAcademicYear}
              </span>
            ) : null}
            {currentAcademicYear && currentSemester ? (
              <span className="dashboard-period__sep" aria-hidden="true">
                ·
              </span>
            ) : null}
            {currentSemester ? (
              <span className="dashboard-period__value">
                {currentSemester}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default TeacherDashboardIntro