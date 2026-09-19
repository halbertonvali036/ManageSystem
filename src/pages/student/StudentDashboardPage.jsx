import { useMemo } from 'react'
import { Award, BookOpen, ClipboardCheck, School } from 'lucide-react'
import StatCard from '@/components/common/StatCard'
import AttendanceOverviewCard from '@/components/student/dashboard/AttendanceOverviewCard'
import GradeOverviewCard from '@/components/student/dashboard/GradeOverviewCard'
import MyCoursesCard from '@/components/student/dashboard/MyCoursesCard'
import TodayScheduleCard from '@/components/student/dashboard/TodayScheduleCard'
import UpcomingClassesCard from '@/components/student/dashboard/UpcomingClassesCard'
import useAuth from '@/hooks/useAuth'
import useStudentDashboard from '@/hooks/student/useStudentDashboard'
import { getScheduleDayKeys, WEEKDAY_KEYS } from '@/models/schedule'

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
  const { summary, error, refetch } = useStudentDashboard()
  const { user } = useAuth()

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

  const stats = [
    {
      label: 'My Courses',
      value: courses.length.toLocaleString(),
      icon: BookOpen,
      accent: 'primary',
    },
    {
      label: 'My Classes',
      value: classes.length.toLocaleString(),
      icon: School,
      accent: 'success',
    },
    {
      label: 'Attendance Records',
      value: attendance.length.toLocaleString(),
      icon: ClipboardCheck,
      accent: 'warning',
    },
    {
      label: 'Grades Received',
      value: grades.length.toLocaleString(),
      icon: Award,
      accent: 'danger',
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
          Here&rsquo;s an overview of your courses, classes, schedule, attendance, and
          grades.
        </p>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="dashboard-grid">
        <MyCoursesCard courses={courses} />
        <div className="dashboard-grid__stack">
          <TodayScheduleCard items={todaySchedule} />
          <UpcomingClassesCard classes={classes} />
        </div>
      </div>

      <div className="dashboard-grid">
        <AttendanceOverviewCard records={attendance} />
        <GradeOverviewCard grades={grades} />
      </div>
    </div>
  )
}

export default StudentDashboardPage