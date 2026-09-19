import { Award, ClipboardCheck, GraduationCap, School } from 'lucide-react'
import StatCard from '@/components/common/StatCard'
import AttendanceOverviewCard from '@/components/teacher/dashboard/AttendanceOverviewCard'
import GradeActivityCard from '@/components/teacher/dashboard/GradeActivityCard'
import MyClassesCard from '@/components/teacher/dashboard/MyClassesCard'
import StudentsOverviewCard from '@/components/teacher/dashboard/StudentsOverviewCard'
import TodaysScheduleCard from '@/components/teacher/dashboard/TodaysScheduleCard'
import useAuth from '@/hooks/useAuth'
import useTeacherDashboard from '@/hooks/teacher/useTeacherDashboard'

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

function TeacherDashboardPage() {
  const { summary, error, refetch } = useTeacherDashboard()
  const { user } = useAuth()

  const greeting = `Good ${getPartOfDay()}${user?.name ? `, ${user.name}` : ''}`

  const stats = [
    {
      label: 'My Classes',
      value: summary.classCount.toLocaleString(),
      icon: School,
      accent: 'primary',
    },
    {
      label: 'My Students',
      value: summary.studentCount.toLocaleString(),
      icon: GraduationCap,
      accent: 'success',
    },
    {
      label: 'Attendance Records',
      value: summary.attendanceCount.toLocaleString(),
      icon: ClipboardCheck,
      accent: 'warning',
    },
    {
      label: 'Grades Entered',
      value: summary.gradesEntered.toLocaleString(),
      icon: Award,
      accent: 'danger',
    },
  ]

  return (
    <div className="dashboard teacher-dashboard">
      {error ? (
        <div className="alert alert--error" role="alert">
          Failed to load teacher dashboard data. ({error.message})
          <button type="button" className="btn" onClick={refetch}>
            Retry
          </button>
        </div>
      ) : null}

      <div className="dashboard__intro">
        <p className="dashboard__greeting">{greeting}</p>
        <p className="dashboard__subtitle">
          Here&rsquo;s an overview of your classes, students, attendance, and grades.
        </p>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="dashboard-grid">
        <MyClassesCard classes={summary.myClasses} />
        <div className="dashboard-grid__stack">
          <TodaysScheduleCard items={summary.todaySchedule} />
          <AttendanceOverviewCard records={summary.attendanceRecords} />
        </div>
      </div>

      <div className="dashboard-grid">
        <StudentsOverviewCard students={summary.students} total={summary.studentCount} />
        <GradeActivityCard grades={summary.recentGrades} />
      </div>
    </div>
  )
}

export default TeacherDashboardPage