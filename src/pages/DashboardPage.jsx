import { BookOpen, GraduationCap, School, Users } from 'lucide-react'
import AttendanceSummary from '@/components/dashboard/AttendanceSummary'
import RecentActivity from '@/components/dashboard/RecentActivity'
import UpcomingClasses from '@/components/dashboard/UpcomingClasses'
import StatCard from '@/components/common/StatCard'
import useAuth from '@/hooks/useAuth'
import useDashboard from '@/hooks/useDashboard'

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

function DashboardPage() {
  const { summary, error, refetch } = useDashboard()
  const { user } = useAuth()

  const greeting = `Good ${getPartOfDay()}${user?.name ? `, ${user.name}` : ''}`

  const stats = [
    {
      label: 'Total Students',
      value: summary.totalStudents.toLocaleString(),
      icon: GraduationCap,
      accent: 'primary',
    },
    {
      label: 'Total Teachers',
      value: summary.totalTeachers.toLocaleString(),
      icon: Users,
      accent: 'success',
    },
    {
      label: 'Total Courses',
      value: summary.totalCourses.toLocaleString(),
      icon: BookOpen,
      accent: 'warning',
    },
    {
      label: 'Active Classes',
      value: summary.activeClasses.toLocaleString(),
      icon: School,
      accent: 'danger',
    },
  ]

  return (
    <div className="dashboard">
      {error ? (
        <div className="alert alert--error" role="alert">
          Failed to load dashboard data. ({error.message})
          <button type="button" className="btn" onClick={refetch}>
            Retry
          </button>
        </div>
      ) : null}

      <div className="dashboard__intro">
        <p className="dashboard__greeting">{greeting}</p>
        <p className="dashboard__subtitle">
          Here&rsquo;s a snapshot of your school&rsquo;s day at a glance.
        </p>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="dashboard-grid">
        <RecentActivity items={summary.recentActivity} />
        <div className="dashboard-grid__stack">
          <AttendanceSummary data={summary.attendance} />
          <UpcomingClasses items={summary.upcomingClasses} />
        </div>
      </div>
    </div>
  )
}

export default DashboardPage