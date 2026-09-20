import { CalendarDays, CalendarRange, GraduationCap } from 'lucide-react'
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

  return (
    <div className="dashboard__intro">
      <p className="dashboard__greeting">{greeting}</p>
      <p className="dashboard__subtitle">
        Here&rsquo;s an overview of your classes, students, assessments, schedule,
        and grades.
      </p>
      <div className="dashboard-chips">
        <span className="dashboard-chip">
          <GraduationCap size={14} aria-hidden="true" />
          {TEACHER_PORTAL_LABEL}
        </span>
        {currentAcademicYear ? (
          <span className="dashboard-chip">
            <CalendarRange size={14} aria-hidden="true" />
            {currentAcademicYear}
          </span>
        ) : null}
        {currentSemester ? (
          <span className="dashboard-chip">
            <CalendarDays size={14} aria-hidden="true" />
            {currentSemester}
          </span>
        ) : null}
      </div>
    </div>
  )
}

export default TeacherDashboardIntro