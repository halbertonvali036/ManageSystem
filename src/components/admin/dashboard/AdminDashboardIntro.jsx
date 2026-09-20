import { Link } from 'react-router-dom'
import { CalendarDays, CalendarRange, ShieldCheck } from 'lucide-react'

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

  return (
    <div className="dashboard__intro">
      <p className="dashboard__greeting">{greeting}</p>
      <p className="dashboard__subtitle">
        Here&rsquo;s a snapshot of your institution&rsquo;s students, teachers,
        courses, schedule, and activity.
      </p>
      <div className="dashboard-chips">
        <span className="dashboard-chip dashboard-chip--admin">
          <ShieldCheck size={14} aria-hidden="true" />
          Administration
        </span>
        {currentAcademicYear ? (
          <Link to="/academic-years" className="dashboard-chip dashboard-chip__link">
            <CalendarRange size={14} aria-hidden="true" />
            {currentAcademicYear}
          </Link>
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

export default AdminDashboardIntro