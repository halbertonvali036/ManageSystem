import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  GraduationCap,
  School,
} from 'lucide-react'
import StatCard from '@/components/common/StatCard'
import RecentAnnouncementsCard from '@/components/announcements/RecentAnnouncementsCard'
import AttendanceOverviewCard from '@/components/student/dashboard/AttendanceOverviewCard'
import GradeOverviewCard from '@/components/student/dashboard/GradeOverviewCard'
import MyCoursesCard from '@/components/student/dashboard/MyCoursesCard'
import TodayScheduleCard from '@/components/student/dashboard/TodayScheduleCard'
import UpcomingAssessmentsCard from '@/components/student/dashboard/UpcomingAssessmentsCard'
import UpcomingClassesCard from '@/components/student/dashboard/UpcomingClassesCard'
import useAuth from '@/hooks/useAuth'
import useMyAssessments from '@/hooks/student/useMyAssessments'
import useStudentAnnouncements from '@/hooks/student/useStudentAnnouncements'
import useStudentDashboard from '@/hooks/student/useStudentDashboard'
import { getScheduleDayKeys, WEEKDAY_KEYS } from '@/models/schedule'
import { STUDENT_PORTAL_LABEL } from '@/utils/studentConstants'

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

function StudentDashboardPage() {
  const { summary, isLoading, error, refetch } = useStudentDashboard()
  const { user } = useAuth()
  const {
    assessments: myAssessments,
    isLoading: isLoadingAssessments,
    error: assessmentsError,
    refetch: refetchAssessments,
  } = useMyAssessments()
  const {
    announcements,
    isLoading: isLoadingAnnouncements,
    error: announcementsError,
    refetch: refetchAnnouncements,
  } = useStudentAnnouncements()

  const greeting = `Good ${getPartOfDay()}${user?.name ? `, ${user.name}` : ''}`

  const courses = summary.courses ?? []
  const classes = summary.classes ?? []
  const attendance = summary.attendance ?? []
  const grades = summary.grades ?? []

  const todaySchedule = useMemo(() => {
    const items = summary.schedule ?? []
    if (items.length === 0) {
      return []
    }
    const today = new Date()
    const todayKey = WEEKDAY_KEYS[(today.getDay() + 6) % 7]
    return items.filter((item) => getScheduleDayKeys(item).includes(todayKey))
  }, [summary.schedule])

  const upcomingAssessments = useMemo(() => {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    return (myAssessments ?? []).filter((assessment) => {
      const value =
        assessment.date ?? assessment.dueDate ?? assessment.assessmentDate
      if (!value) {
        return false
      }
      const date = new Date(value)
      return !Number.isNaN(date.getTime()) && date >= startOfToday
    })
  }, [myAssessments])

  const stats = [
    {
      label: 'My Courses',
      value: courses.length.toLocaleString(),
      icon: BookOpen,
      accent: 'primary',
      to: '/student/courses',
    },
    {
      label: 'My Classes',
      value: classes.length.toLocaleString(),
      icon: School,
      accent: 'success',
      to: '/student/classes',
    },
    {
      label: 'Upcoming Assessments',
      value: upcomingAssessments.length.toLocaleString(),
      icon: ClipboardList,
      accent: 'warning',
      to: '/student/assessments',
    },
    {
      label: 'Attendance',
      value: attendance.length.toLocaleString(),
      icon: ClipboardCheck,
      accent: 'danger',
      to: '/student/attendance',
    },
  ]

  return (
    <div className="dashboard student-dashboard">
      {error ? (
        <div className="alert alert--error" role="alert">
          Failed to load student dashboard data. ({error.message})
          <button type="button" className="btn" onClick={refetch}>
            Retry
          </button>
        </div>
      ) : null}

      <div className="dashboard__intro">
        <p className="dashboard__greeting">{greeting}</p>
        <p className="dashboard__subtitle">
          Here&rsquo;s an overview of your courses, classes, schedule,
          assessments, attendance, and grades.
        </p>
        <div className="dashboard__context">
          <span className="dashboard-role">
            <GraduationCap size={14} aria-hidden="true" />
            {STUDENT_PORTAL_LABEL}
          </span>
        </div>
      </div>

      <section className="dashboard-summary" aria-labelledby="summary-title">
        <header className="dashboard-summary__head">
          <h2 id="summary-title" className="dashboard-summary__title">
            Learning snapshot
          </h2>
          <p className="dashboard-summary__hint">
            Live counts from your enrolled courses
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
        <TodayScheduleCard items={todaySchedule} isLoading={isLoading} />
        <MyCoursesCard courses={courses} isLoading={isLoading} />
      </div>

      <div className="dashboard-grid dashboard-grid--wide-right">
        <UpcomingClassesCard classes={classes} isLoading={isLoading} />
        <UpcomingAssessmentsCard
          assessments={upcomingAssessments}
          isLoading={isLoadingAssessments}
          error={assessmentsError}
          onRetry={refetchAssessments}
        />
      </div>

      <div className="dashboard-grid dashboard-grid--feature">
        <AttendanceOverviewCard records={attendance} isLoading={isLoading} />
        <GradeOverviewCard grades={grades} isLoading={isLoading} />
      </div>

      <div className="dashboard-grid dashboard-grid--full">
        <RecentAnnouncementsCard
          title="Announcements"
          announcements={announcements}
          isLoading={isLoadingAnnouncements}
          error={announcementsError}
          onRetry={refetchAnnouncements}
          limit={4}
          emptyText="No announcements are available."
          action={
            <Link to="/student/announcements" className="form__link">
              View all
            </Link>
          }
        />
      </div>
    </div>
  )
}

export default StudentDashboardPage