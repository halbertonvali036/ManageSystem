import { Link } from 'react-router-dom'
import { CalendarRange, ShieldCheck } from 'lucide-react'

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

function AdminDashboardIntro({ user, currentAcademicYear, currentSemester }) {
  const greeting = `Good ${getPartOfDay()}${user?.name ? `, ${user.name}` : ''}`

  const showPeriod = Boolean(currentAcademicYear || currentSemester)

  return (
    <div className="dashboard__intro">
      <p className="dashboard__greeting">{greeting}</p>
      <p className="dashboard__subtitle">
        Here&rsquo;s a snapshot of your institution&rsquo;s students, teachers,
        courses, schedule, and activity.
      </p>
      <div className="dashboard__context">
        <span className="dashboard-role">
          <ShieldCheck size={14} aria-hidden="true" />
          Administration
        </span>
        {showPeriod ? (
          <div className="dashboard-period">
            <CalendarRange
              size={14}
              className="dashboard-period__icon"
              aria-hidden="true"
            />
            {currentAcademicYear ? (
              <Link to="/academic-years" className="dashboard-period__link">
                {currentAcademicYear}
              </Link>
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

export default AdminDashboardIntro