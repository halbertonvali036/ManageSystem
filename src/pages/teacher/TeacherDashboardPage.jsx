import { Link } from 'react-router-dom'
import {
  CalendarClock,
  ClipboardList,
  GraduationCap,
  School,
} from 'lucide-react'
import StatCard from '@/components/common/StatCard'
import AssessmentsOverviewCard from '@/components/teacher/dashboard/AssessmentsOverviewCard'
import AttendanceQuickActionsCard from '@/components/teacher/dashboard/AttendanceQuickActionsCard'
import GradeActivityCard from '@/components/teacher/dashboard/GradeActivityCard'
import MyClassesCard from '@/components/teacher/dashboard/MyClassesCard'
import TeacherDashboardIntro from '@/components/teacher/dashboard/TeacherDashboardIntro'
import TodaysScheduleCard from '@/components/teacher/dashboard/TodaysScheduleCard'
import RecentAnnouncementsCard from '@/components/announcements/RecentAnnouncementsCard'
import useAuth from '@/hooks/useAuth'
import useTeacherDashboard from '@/hooks/teacher/useTeacherDashboard'

const displayCount = (value) => (value == null ? '—' : value.toLocaleString())

function TeacherDashboardPage() {
  const { summary, errors, isLoading, refetch } = useTeacherDashboard()
  const { user } = useAuth()

  const stats = [
    {
      label: 'My Classes',
      value: displayCount(summary.assignedClassesCount),
      icon: School,
      accent: 'primary',
      to: '/teacher/classes',
    },
    {
      label: 'My Students',
      value: displayCount(summary.assignedStudentsCount),
      icon: GraduationCap,
      accent: 'success',
      to: '/teacher/students',
    },
    {
      label: 'Active Assessments',
      value: displayCount(summary.activeAssessmentsCount),
      icon: ClipboardList,
      accent: 'warning',
      to: '/teacher/assessments',
    },
    {
      label: "Today's Lessons",
      value: displayCount(summary.todayLessonsCount),
      icon: CalendarClock,
      accent: 'danger',
      to: '/teacher/schedule',
    },
  ]

  return (
    <div className="dashboard teacher-dashboard">
      <TeacherDashboardIntro
        user={user}
        currentAcademicYear={summary.currentAcademicYear}
        currentSemester={summary.currentSemester}
      />

      <section className="dashboard-summary" aria-labelledby="summary-title">
        <header className="dashboard-summary__head">
          <h2 id="summary-title" className="dashboard-summary__title">
            Teaching overview
          </h2>
          <p className="dashboard-summary__hint">
            Live counts across your classes
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

      <div className="dashboard-grid dashboard-grid--feature">
        <TodaysScheduleCard
          items={summary.todaySchedule}
          isLoading={isLoading}
          error={errors.schedule}
          onRetry={refetch}
        />
        <AttendanceQuickActionsCard
          todayClasses={summary.pendingAttendanceClasses}
          isLoading={isLoading}
          error={errors.classes}
          onRetry={refetch}
        />
      </div>

      <div className="dashboard-grid dashboard-grid--wide-right">
        <MyClassesCard
          classes={summary.myClasses}
          isLoading={isLoading}
          error={errors.classes}
          onRetry={refetch}
        />
        <AssessmentsOverviewCard
          assessments={summary.recentAssessments}
          isLoading={isLoading}
          error={errors.assessments}
          onRetry={refetch}
        />
      </div>

      <div className="dashboard-grid dashboard-grid--feature">
        <GradeActivityCard
          grades={summary.recentGrades}
          count={summary.gradesCount}
          isLoading={isLoading}
          error={errors.grades}
          onRetry={refetch}
          title="Grades Overview"
        />
        <RecentAnnouncementsCard
          title="Announcements"
          announcements={summary.recentAnnouncements}
          isLoading={isLoading}
          error={errors.announcements}
          onRetry={refetch}
          limit={4}
          action={
            <Link to="/teacher/announcements" className="form__link">
              View All
            </Link>
          }
        />
      </div>
    </div>
  )
}

export default TeacherDashboardPage