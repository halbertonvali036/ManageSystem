import { Link } from 'react-router-dom'
import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  School,
  Users,
} from 'lucide-react'
import AdminDashboardIntro from '@/components/admin/dashboard/AdminDashboardIntro'
import AssessmentsOverviewCard from '@/components/admin/dashboard/AssessmentsOverviewCard'
import AttendanceOverviewCard from '@/components/admin/dashboard/AttendanceOverviewCard'
import EnrollmentOverviewCard from '@/components/admin/dashboard/EnrollmentOverviewCard'
import ReportsQuickAccessCard from '@/components/admin/dashboard/ReportsQuickAccessCard'
import TodaysScheduleCard from '@/components/admin/dashboard/TodaysScheduleCard'
import StatCard from '@/components/common/StatCard'
import RecentAnnouncementsCard from '@/components/announcements/RecentAnnouncementsCard'
import useAdminDashboard from '@/hooks/admin/useAdminDashboard'
import useAuth from '@/hooks/useAuth'

const displayCount = (value) => (value == null ? '—' : value.toLocaleString())

function DashboardPage() {
  const { summary, errors, isLoading, refetch } = useAdminDashboard()
  const { user } = useAuth()

  const stats = [
    {
      label: 'Total Students',
      value: displayCount(summary.totalStudents),
      icon: GraduationCap,
      accent: 'primary',
      to: '/students',
    },
    {
      label: 'Total Teachers',
      value: displayCount(summary.totalTeachers),
      icon: Users,
      accent: 'success',
      to: '/teachers',
    },
    {
      label: 'Total Courses',
      value: displayCount(summary.totalCourses),
      icon: BookOpen,
      accent: 'warning',
      to: '/courses',
    },
    {
      label: 'Total Classes',
      value: displayCount(summary.totalClasses),
      icon: School,
      accent: 'danger',
      to: '/classes',
    },
  ]

  const totalEnrolled = !summary.backendAvailable
    ? null
    : summary.enrolledClasses.length === 0
      ? 0
      : summary.enrolledClasses.every((entry) => entry.count != null)
        ? summary.enrolledClasses.reduce(
            (total, entry) => total + (entry.count ?? 0),
            0,
          )
        : null

  const metrics = [
    {
      key: 'assessments',
      label: 'Active assessments',
      value: displayCount(summary.activeAssessmentsCount),
      icon: ClipboardList,
      accent: 'info',
      to: '/assessments',
    },
    {
      key: 'enrollments',
      label: 'Enrolled students',
      value: displayCount(totalEnrolled),
      icon: Users,
      accent: 'primary',
      to: '/classes',
    },
    {
      key: 'attendance',
      label: 'Attendance records today',
      value: displayCount(summary.todayAttendance?.total ?? null),
      icon: CalendarCheck,
      accent: 'success',
      to: '/attendance',
    },
    {
      key: 'schedule',
      label: 'Classes scheduled today',
      value: displayCount(
        summary.backendAvailable ? summary.todaySchedule.length : null,
      ),
      icon: School,
      accent: 'warning',
      to: '/schedules',
    },
  ]

  return (
    <div className="dashboard admin-dashboard">
      <AdminDashboardIntro
        user={user}
        currentAcademicYear={summary.currentAcademicYear}
        currentSemester={summary.currentSemester}
      />

      <section className="dashboard-summary" aria-labelledby="summary-title">
        <header className="dashboard-summary__head">
          <h2 id="summary-title" className="dashboard-summary__title">
            Institution overview
          </h2>
          <p className="dashboard-summary__hint">
            Live counts across your institution
          </p>
        </header>
        <div className="stats-grid">
          {stats.map((stat) => (
            <Link key={stat.label} to={stat.to} className="stat-card-link">
              <StatCard
                icon={stat.icon}
                label={stat.label}
                value={stat.value}
                accent={stat.accent}
              />
            </Link>
          ))}
        </div>
      </section>

      <ul className="metrics-strip" aria-label="Key metrics">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <li
              className={`metrics-strip__tile metrics-strip__tile--${metric.accent}`}
              key={metric.key}
            >
              <Link to={metric.to} className="metrics-strip__link">
                <span className="metrics-strip__icon" aria-hidden="true">
                  <Icon size={17} />
                </span>
                <span className="metrics-strip__body">
                  <span className="metrics-strip__value">{metric.value}</span>
                  <span className="metrics-strip__label">{metric.label}</span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="dashboard-grid">
        <TodaysScheduleCard
          items={summary.todaySchedule}
          isLoading={isLoading}
          error={errors.schedules}
          onRetry={refetch}
        />
        <AttendanceOverviewCard
          data={summary.todayAttendance}
          isLoading={isLoading}
          error={errors.attendance}
          onRetry={refetch}
        />
      </div>

      <div className="dashboard-grid">
        <AssessmentsOverviewCard
          assessments={summary.recentAssessments}
          isLoading={isLoading}
          error={errors.assessments}
          onRetry={refetch}
        />
        <EnrollmentOverviewCard
          classes={summary.enrolledClasses}
          isLoading={isLoading}
          error={errors.classes}
          onRetry={refetch}
        />
      </div>

      <div className="dashboard-grid">
        <RecentAnnouncementsCard
          title="Announcements"
          announcements={summary.recentAnnouncements}
          isLoading={isLoading}
          error={errors.announcements}
          onRetry={refetch}
          limit={4}
          action={
            <Link to="/announcements" className="form__link">
              View All
            </Link>
          }
        />
        <ReportsQuickAccessCard />
      </div>
    </div>
  )
}

export default DashboardPage